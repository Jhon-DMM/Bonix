import { useRef } from 'react';
import { useCanasta } from '../context/useCart.js';
import { formatearCOP } from '../utils/format.js';
import { crearEnlacePedidoWhatsApp } from '../utils/whatsapp.js';
import { useAccesibilidadDialogo } from '../hooks/useDialogAccessibility.js';

export default function PanelCanasta() {
  const { elementos, estaAbierto, cerrarCanasta, precioTotal, actualizarCantidad, quitarElemento } = useCanasta();
  const dialogRef = useRef(null);
  useAccesibilidadDialogo(dialogRef, cerrarCanasta, estaAbierto);

  if (!estaAbierto) return null;

  const canastaVacia = elementos.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Cerrar canasta"
        onClick={cerrarCanasta}
        className="absolute inset-0 bg-ink/30"
      />

      <aside ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="titulo-dialogo-canasta" tabIndex={-1} className="relative h-full w-full max-w-[380px] bg-paper shadow-2xl flex flex-col animate-deslizar-desde-derecha">
        <div className="flex items-center justify-between px-5 h-16 border-b border-hairline shrink-0">
          <h2 id="titulo-dialogo-canasta" className="font-display font-semibold text-lg text-ink">Tu canasta</h2>
          <button
            type="button"
            onClick={cerrarCanasta}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-pill flex items-center justify-center text-ink/60 hover:bg-canvas"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {canastaVacia ? (
            <p className="text-ink/60 text-[15px] font-text">
              No hay ningún postre añadido.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {elementos.map((elemento) => (
                <li key={elemento.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-text text-[15px] text-ink font-medium">{elemento.name}</p>
                    <p className="font-text text-[13px] text-ink/50">
                      {formatearCOP(elemento.price)} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => actualizarCantidad(elemento.id, elemento.quantity - 1)}
                      className="w-7 h-7 rounded-pill border border-hairline text-ink/70 hover:bg-canvas"
                      aria-label={`Quitar una unidad de ${elemento.name}`}
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-text text-[14px] text-ink">
                      {elemento.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => actualizarCantidad(elemento.id, elemento.quantity + 1)}
                      className="w-7 h-7 rounded-pill border border-hairline text-ink/70 hover:bg-canvas"
                      aria-label={`Añadir una unidad de ${elemento.name}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => quitarElemento(elemento.id)}
                      className="ml-1 text-ink/40 hover:text-red-500 text-[13px]"
                      aria-label={`Eliminar ${elemento.name} de la canasta`}
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!canastaVacia && (
          <div className="px-5 py-5 border-t border-hairline shrink-0">
            <div className="flex items-center justify-between mb-4 font-text">
              <span className="text-ink/60 text-[14px]">Total</span>
              <span className="text-ink font-semibold text-[17px]">{formatearCOP(precioTotal)}</span>
            </div>
            <a
              href={crearEnlacePedidoWhatsApp(elementos)}
              target="_blank"
              rel="noreferrer"
              className="block text-center w-full rounded-pill bg-celeste-500 text-white font-text font-semibold text-[15px] py-3 hover:bg-celeste-600 transition-colors"
            >
              Ordenar por WhatsApp
            </a>
          </div>
        )}
      </aside>
    </div>
  );
}
