import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { formatCOP } from '../utils/format.js';
import DessertIllustration from './DessertIllustration.jsx';
import QuantityModal from './QuantityModal.jsx';

function Arrow({ direction, onClick, disabled, label, dessertColor }) {
  const isLeft = direction === 'left';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{ color: dessertColor }}
      className={`absolute top-1/2 -translate-y-1/2 z-10 ${isLeft ? 'left-1 sm:left-2' : 'right-1 sm:right-2'} w-11 h-11 rounded-pill flex items-center justify-center bg-white/25 hover:bg-white/40 backdrop-blur transition-opacity ${disabled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d={isLeft ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function Hero({ desserts, activeIndex = 0, onActiveIndexChange = () => {} }) {
  const [direction, setDirection] = useState('right');
  const [modalOpen, setModalOpen] = useState(false);
  const { addItem, openCart } = useCart();

  if (desserts.length === 0) {
    return (
      <section id="inicio" className="h-screen flex items-center justify-center bg-canvas">
        <p className="font-text text-ink/60">Pronto tendremos postres disponibles.</p>
      </section>
    );
  }

  const index = Math.min(activeIndex, desserts.length - 1);
  const dessert = desserts[index];
  const slideAnimation = direction === 'right' ? 'animate-slide-from-right' : 'animate-slide-from-left';
  const canGoPrev = index > 0;
  const canGoNext = index < desserts.length - 1;
  const goPrev = () => {
    if (!canGoPrev) return;
    setDirection('left');
    onActiveIndexChange(index - 1);
  };
  const goNext = () => {
    if (!canGoNext) return;
    setDirection('right');
    onActiveIndexChange(index + 1);
  };
  const handleConfirmAdd = (quantity) => {
    addItem(dessert, quantity);
    setModalOpen(false);
    openCart();
  };

  return (
    <section
      id="inicio"
      className="relative h-screen min-h-[620px] overflow-hidden transition-colors duration-700 ease-out"
      style={{ backgroundColor: dessert.colors.from }}
    >
      <div
        key={`bg-${dessert.id}`}
        className="absolute inset-0 animate-[fadeIn_500ms_ease-out]"
        style={{ background: `radial-gradient(circle at 50% 38%, ${dessert.colors.to}, transparent 65%)` }}
      />

      <Arrow direction="left" onClick={goPrev} disabled={!canGoPrev} label="Postre anterior" dessertColor={dessert.colors.text} />
      <Arrow direction="right" onClick={goNext} disabled={!canGoNext} label="Siguiente postre" dessertColor={dessert.colors.text} />

      <p className="absolute left-6 sm:left-10 top-[88px] z-10 font-text text-[13px] font-semibold tracking-wide" style={{ color: dessert.colors.text }}>
        {index + 1}/{desserts.length}
      </p>

      <div key={dessert.id} className={`absolute inset-0 flex items-center justify-center pointer-events-none ${slideAnimation}`}>
        <div className="-translate-y-6 sm:-translate-y-2">
          <DessertIllustration dessert={dessert} size={Math.min(520, window.innerWidth * 0.8)} />
        </div>
      </div>

      <div key={`details-${dessert.id}`} className={`absolute right-6 bottom-6 sm:right-12 sm:bottom-10 z-10 max-w-[280px] text-right ${slideAnimation}`} style={{ color: dessert.colors.text }}>
        <p className="font-text text-[13px] opacity-75">Postre artesanal</p>
        <h1 className="font-display font-semibold leading-tight tracking-tight text-[28px] sm:text-[36px]">{dessert.name}</h1>
        <p className="font-text text-[14px] leading-snug opacity-85 mt-1">{dessert.description}</p>
        <div className="mt-3 flex items-center justify-end gap-3">
          <span className="font-text text-[14px] font-semibold">{formatCOP(dessert.price)}</span>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-pill bg-[#0071e3] text-white font-text font-semibold text-[14px] px-5 py-2.5 hover:bg-[#0066cc] transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>

      {modalOpen && (
        <QuantityModal dessert={dessert} onConfirm={handleConfirmAdd} onCancel={() => setModalOpen(false)} />
      )}
    </section>
  );
}
