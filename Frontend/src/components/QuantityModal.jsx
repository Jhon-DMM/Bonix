import { useRef, useState } from 'react';
import { formatearCOP } from '../utils/format.js';
import { useAccesibilidadDialogo } from '../hooks/useDialogAccessibility.js';

export default function ModalCantidad({ postre, onConfirm, onCancel }) {
  const [cantidad, fijarCantidad] = useState(1);
  const dialogRef = useRef(null);
  useAccesibilidadDialogo(dialogRef, onCancel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCancel}
        className="absolute inset-0 bg-ink/40"
      />

      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="titulo-dialogo-cantidad" aria-describedby="descripcion-dialogo-cantidad" tabIndex={-1} className="relative bg-paper rounded-card shadow-2xl w-full max-w-[320px] px-6 py-6">
        <p id="descripcion-dialogo-cantidad" className="font-text text-[13px] text-ink/50 mb-1">Añadir a la canasta</p>
        <h3 id="titulo-dialogo-cantidad" className="font-display font-semibold text-xl text-ink mb-4">{postre.name}</h3>

        <div className="flex items-center justify-between mb-5">
          <span className="font-text text-[15px] text-ink/70">Cantidad</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fijarCantidad((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-pill border border-hairline text-ink hover:bg-canvas"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="w-6 text-center font-text text-[16px] text-ink">{cantidad}</span>
            <button
              type="button"
              onClick={() => fijarCantidad((q) => Math.min(20, q + 1))}
              className="w-8 h-8 rounded-pill border border-hairline text-ink hover:bg-canvas"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5 font-text">
          <span className="text-ink/60 text-[14px]">Subtotal</span>
          <span className="text-ink font-semibold text-[16px]">
            {formatearCOP(postre.price * cantidad)}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-pill border border-hairline text-ink/70 font-text text-[14px] py-2.5 hover:bg-canvas"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(cantidad)}
            className="flex-1 rounded-pill bg-celeste-500 text-white font-text font-semibold text-[14px] py-2.5 hover:bg-celeste-600"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
