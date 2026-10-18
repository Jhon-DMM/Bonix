import { useCart } from '../context/CartContext.jsx';

function BasketIcon() {
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

export default function Header({ desserts, activeDessertIndex }) {
  const { totalCount, toggleCart } = useCart();
  const textColor = desserts[activeDessertIndex]?.colors.text || '#1d1d1f';

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="absolute inset-x-0 top-0 z-40 transition-colors duration-700" style={{ color: textColor }}>
      <div className="mx-auto max-w-[1100px] px-5 h-16 flex items-center justify-between gap-4">
        <a
          href="#inicio"
          onClick={scrollTo('inicio')}
          className="font-display font-semibold text-xl tracking-tight shrink-0"
        >
          Bonix
        </a>

        <nav className="hidden md:flex items-center gap-7 text-[14px] font-text">
          {desserts.map((d) => (
            <a
              key={d.id}
              href={`#postre-${d.id}`}
              onClick={scrollTo(`postre-${d.id}`)}
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              {d.name}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={toggleCart}
          aria-label="Abrir canasta"
          className="relative flex items-center justify-center w-10 h-10 rounded-pill bg-white/20 hover:bg-white/35 transition-colors"
        >
          <BasketIcon />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0071e3] text-white text-[11px] leading-[18px] text-center font-semibold">
              {totalCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
