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
    <header className="encabezado-entrada fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-6 sm:px-10">
        <a
          href="#inicio"
          onClick={desplazarA('inicio')}
          className={`shrink-0 font-display text-[23px] font-semibold tracking-tight transition-colors duration-500 ${estaEnPortada ? 'text-white' : 'text-[#83d5ff]'}`}
        >
          Bonix
        </a>

        <nav className="mx-auto hidden items-center gap-1 rounded-pill border border-white/30 bg-white/15 px-1.5 py-1 shadow-[0_5px_20px_rgba(30,70,100,0.1)] backdrop-blur-xl md:flex">
          {postres.map((d) => (
            <a
              key={d.id}
              href={`#postre-${d.id}`}
              onClick={desplazarA(`postre-${d.id}`)}
              className={`rounded-pill px-4 py-1.5 font-text text-[14px] transition-colors duration-500 hover:bg-white/25 sm:px-5 ${estaEnPortada ? 'text-white' : 'text-celeste-700'}`}
            >
              {d.name}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={alternarCanasta}
          aria-label="Abrir canasta"
          className={`relative flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/15 px-3 font-text text-[13px] font-semibold shadow-[0_5px_20px_rgba(30,70,100,0.1)] backdrop-blur-xl transition-colors hover:bg-white/30 ${estaEnPortada ? 'text-white' : 'text-celeste-700'}`}
        >
          <IconoCanasta />
          <span className="hidden sm:inline">Canasta</span>
          {cantidadTotal > 0 && (
            <span className="absolute -right-2 -top-2 min-w-[19px] rounded-full bg-[#22a9f2] px-1.5 py-0.5 text-center font-text text-[10px] font-bold leading-none text-[#10233a] shadow-sm">
              {cantidadTotal}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
