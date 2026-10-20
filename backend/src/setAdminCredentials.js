import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const envPath = fileURLToPath(new URL('../.env', import.meta.url));

function ask(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let answer = '';
    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === '\u0003') {
          process.stdin.setRawMode?.(false);
          process.stdout.write('\nConfiguración cancelada.\n');
          process.exit(130);
        }
        if (character === '\r' || character === '\n') {
          process.stdin.setRawMode?.(false);
          process.stdin.pause();
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(answer);
          return;
        }
        if (character === '\u007f' || character === '\b') {
          answer = answer.slice(0, -1);
          process.stdout.write('\b \b');
          continue;
        }
        answer += character;
        process.stdout.write('*');
      }
    };

    if (process.stdin.isTTY && process.stdin.setRawMode) process.stdin.setRawMode(true);
    process.stdin.on('data', onData);
  });
}

function quoteEnvValue(value) {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

async function main() {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) {
    throw new Error('Ejecuta este comando desde una terminal interactiva.');
  }

  const username = (await ask('Usuario administrador: ')).trim();
  const password = await ask('Contraseña (no se mostrará): ');
  const confirmation = await ask('Confirma la contraseña: ');

  if (!username || password.length < 16) {
    throw new Error('El usuario no puede estar vacío y la contraseña debe tener al menos 16 caracteres.');
  }
  if (password !== confirmation) throw new Error('Las contraseñas no coinciden.');

  let envContents = '';
  try {
    envContents = await readFile(envPath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const values = {
    ADMIN_USERNAME: username,
    ADMIN_PASSWORD: password,
  };
  const lines = envContents ? envContents.split(/\r?\n/) : [];
  const updatedKeys = new Set();
  const updatedLines = lines.flatMap((line) => {
    const match = line.match(/^\s*(ADMIN_USERNAME|ADMIN_PASSWORD)\s*=/);
    if (!match) return [line];
    const key = match[1];
    if (updatedKeys.has(key)) return [];
    updatedKeys.add(key);
    return [`${key}=${quoteEnvValue(values[key])}`];
  });

  for (const [key, value] of Object.entries(values)) {
    if (!updatedKeys.has(key)) updatedLines.push(`${key}=${quoteEnvValue(value)}`);
  }

  await writeFile(envPath, `${updatedLines.join('\n').replace(/\n+$/, '')}\n`, 'utf8');
  process.stdout.write('Credenciales guardadas en backend/.env. Reinicia el servidor para aplicarlas.\n');
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
