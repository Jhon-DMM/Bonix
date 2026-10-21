import IlustracionPostre from './DessertIllustration.jsx';
import AdornosPostre from './DessertAccents.jsx';
import { useState } from 'react';

function obtenerColorTextoContraste(colorHexadecimal) {
  const valor = colorHexadecimal.replace('#', '');
  const hexadecimal = valor.length === 3
    ? [...valor].map((canal) => `${canal}${canal}`).join('')
    : valor;
  if (!/^[\da-f]{6}$/i.test(hexadecimal)) return '#111827';

  const canales = [0, 2, 4].map((indice) => {
    const canal = Number.parseInt(hexadecimal.slice(indice, indice + 2), 16) / 255;
    return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });
  const luminancia = 0.2126 * canales[0] + 0.7152 * canales[1] + 0.0722 * canales[2];
  return luminancia > 0.179 ? '#111827' : '#ffffff';
}

export default function SeccionPostre({ postre, indice = 0 }) {
  const [estaAbierto, fijarEstaAbierto] = useState(false);
  const [seHaAbierto, fijarSeHaAbierto] = useState(false);
  const imagenVaALaIzquierda = indice % 2 === 0;
  const colorTextoTitulo = obtenerColorTextoContraste(postre.colors.from);
  const inicioMovimientoTitulo = 0;
  const inicioAparicionIngrediente = inicioMovimientoTitulo + 1550;
  const inicioAparicionDescripcion = inicioMovimientoTitulo + 2850;
  const pasoDesaparicionIngrediente = Math.min(55, 385 / Math.max(1, postre.ingredients.length - 1));
  const inicioDesaparicionIngrediente = 450;
  const demoraCierreProducto = 1500;

  return (
    <section id={`postre-${postre.id}`} className="seccion-postre-exterior relative isolate overflow-hidden bg-white py-[15vh]">
      <AdornosPostre postre={postre} modo="pagina" />
      <span className={`versiculo-fondo versiculo-fondo--body versiculo-fondo--body-${indice % 3}`} aria-hidden="true">
        “Y haré de ti una nación grande,<br />
        y te bendeciré, y engrandeceré<br />
        tu nombre, y serás bendición”
        <small>Génesis 12:2</small>
      </span>
      <div
        className={`seccion-postre relative z-10 mx-[7%] rounded-[38px] sm:mx-[10%] lg:mx-[15%] ${estaAbierto ? 'esta-abierto' : ''} ${seHaAbierto ? 'se-ha-abierto' : ''} ${imagenVaALaIzquierda ? 'imagen-va-a-la-izquierda' : 'imagen-va-a-la-derecha'}`}
        style={{
          color: postre.colors.text,
          backgroundColor: postre.colors.from,
          backgroundImage: `radial-gradient(circle at 50% 38%, ${postre.colors.to}, transparent 65%)`,
          '--demora-cierre-producto': `${demoraCierreProducto}ms`,
        }}
      >
        <AdornosPostre postre={postre} modo="seccion" />

        <button
          type="button"
          className="seccion-postre__tarjeta absolute left-1/2 top-1/2 z-10 flex items-center justify-center rounded-[38px]"
          onClick={() => {
            if (!estaAbierto) {
              if (!seHaAbierto) fijarSeHaAbierto(true);
            }
            fijarEstaAbierto((estadoAbierto) => !estadoAbierto);
          }}
          aria-expanded={estaAbierto}
          aria-label={`${estaAbierto ? 'Ocultar' : 'Ver'} ingredientes de ${postre.name}`}
        >
        </button>

        <span className="seccion-postre__producto absolute z-20 flex flex-col items-center" aria-hidden="true">
          <span className="seccion-postre__flotante block">
            <IlustracionPostre postre={postre} tamano={386} />
          </span>
        </span>

        <div className="seccion-postre__detalles absolute inset-0">
          <h2 className="seccion-postre__titulo font-display text-[14px] font-normal sm:text-[16px]" style={{ color: colorTextoTitulo }} aria-label={`Postre de: ${postre.name}`}>Postre de: {postre.name}</h2>
          <div className="seccion-postre__contenido" aria-hidden={!estaAbierto}>
            <div className="seccion-postre__ingredientes">
              <p className="seccion-postre__descripcion font-text text-[16px] sm:text-[17px]" style={{ '--demora-aparicion-descripcion': `${inicioAparicionDescripcion}ms` }}>{postre.description}</p>
              <p className="seccion-postre__etiqueta-ingredientes mt-5 font-text text-[14px] font-semibold">Ingredientes</p>
              <ul className="mt-2 flex flex-col gap-1">
                {postre.ingredients.map((ingrediente, indiceIngrediente) => (
                  <li
                    key={ingrediente.id}
                    className="seccion-postre__ingrediente flex items-center gap-3 border-b py-2 font-text text-[14px] sm:text-[15px]"
                    style={{
                      '--demora-aparicion-ingrediente': `${inicioAparicionIngrediente + 350 + (postre.ingredients.length - indiceIngrediente - 1) * 110}ms`,
                      '--demora-desaparicion-ingrediente': `${inicioDesaparicionIngrediente + indiceIngrediente * pasoDesaparicionIngrediente}ms`,
                    }}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-celeste-500" />
                    {ingrediente.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
