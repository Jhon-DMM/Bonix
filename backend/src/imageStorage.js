import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const directorioSubidas = fileURLToPath(new URL('../uploads/', import.meta.url));
export const directorioImagenesPostres = fileURLToPath(new URL('../uploads/desserts/', import.meta.url));

const storedImagePattern = /^\/uploads\/desserts\/([\da-f-]{36})\.webp$/i;

export async function guardarImagenPostre(contents) {
  await mkdir(directorioImagenesPostres, { recursive: true });
  const filename = `${randomUUID()}.webp`;
  await writeFile(fileURLToPath(new URL(`../uploads/desserts/${filename}`, import.meta.url)), contents, { flag: 'wx' });
  return `/uploads/desserts/${filename}`;
}

export async function eliminarImagenPostre(imagePath) {
  const match = storedImagePattern.exec(imagePath || '');
  if (!match) return;
  const filename = `${match[1]}.webp`;
  const filePath = fileURLToPath(new URL(`../uploads/desserts/${filename}`, import.meta.url));
  await unlink(filePath).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
}

export function esImagenPostreGuardada(imagePath) {
  return typeof imagePath === 'string' && storedImagePattern.test(imagePath);
}
