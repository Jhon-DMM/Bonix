import { useEffect, useState } from 'react';
import { useCanasta } from '../context/useCart.js';

function IconoCanasta() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 8h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 8V6a3 3 0 1 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Encabezado({ postres }) {
  const { cantidadTotal, alternarCanasta } = useCanasta();
  const [estaEnPortada, fijarEstaEnPortada] = useState(true);

  useEffect(() => {
    const actualizarColorEncabezado = () => {
      const portada = document.getElementById('inicio');
      fijarEstaEnPortada(Boolean(portada && portada.getBoundingClientRect().bottom > 64));
    };

    actualizarColorEncabezado();
    window.addEventListener('scroll', actualizarColorEncabezado, { passive: true });
    window.addEventListener('resize', actualizarColorEncabezado);
    return () => {
      window.removeEventListener('scroll', actualizarColorEncabezado);
      window.removeEventListener('resize', actualizarColorEncabezado);
    };
  }, []);

  const desplazarA = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className={`encabezado-entrada fixed inset-x-0 top-0 z-40 border-b border-white/30 bg-white/35 shadow-sm backdrop-blur-xl transition-colors duration-700 ${estaEnPortada ? 'text-white' : 'text-celeste-700'}`}>
      <div className="mx-auto max-w-[1100px] px-5 h-16 flex items-center justify-between gap-4">
        <a
          href="#inicio"
          onClick={desplazarA('inicio')}
          className="font-display font-semibold text-xl tracking-tight shrink-0"
        >
          Bonix
        </a>

        <nav className="hidden md:flex items-center gap-7 text-[14px] font-text">
          {postres.map((d) => (
            <a
              key={d.id}
              href={`#postre-${d.id}`}
              onClick={desplazarA(`postre-${d.id}`)}
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              {d.name}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={alternarCanasta}
          aria-label="Abrir canasta"
          className="relative flex items-center justify-center w-10 h-10 rounded-pill bg-white/20 hover:bg-white/35 transition-colors"
        >
          <IconoCanasta />
          {cantidadTotal > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0071e3] text-white text-[11px] leading-[18px] text-center font-semibold">
              {cantidadTotal}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
