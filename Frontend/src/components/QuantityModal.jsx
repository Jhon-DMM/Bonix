import { useState } from 'react';
import { formatCOP } from '../utils/format.js';

export default function QuantityModal({ dessert, onConfirm, onCancel }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCancel}
        className="absolute inset-0 bg-ink/40"
      />

      <div className="relative bg-paper rounded-card shadow-2xl w-full max-w-[320px] px-6 py-6">
        <p className="font-text text-[13px] text-ink/50 mb-1">Añadir a la canasta</p>
        <h3 className="font-display font-semibold text-xl text-ink mb-4">{dessert.name}</h3>

        <div className="flex items-center justify-between mb-5">
          <span className="font-text text-[15px] text-ink/70">Cantidad</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-pill border border-hairline text-ink hover:bg-canvas"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="w-6 text-center font-text text-[16px] text-ink">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
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
            {formatCOP(dessert.price * quantity)}
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
            onClick={() => onConfirm(quantity)}
            className="flex-1 rounded-pill bg-celeste-500 text-white font-text font-semibold text-[14px] py-2.5 hover:bg-celeste-600"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
