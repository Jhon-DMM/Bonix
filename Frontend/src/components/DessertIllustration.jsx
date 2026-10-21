import { resolverImagenPostre } from '../services/dessertService.js';

// Muestra la foto asignada al postre o una ilustración SVG de respaldo.
export default function IlustracionPostre({ postre, tamano = 260 }) {
  if (postre.image) {
    const esImagenNuevaCatalogo = /^\/images\/(Mora-imagen|Maracuya-img|Milo-img)\.png$/.test(postre.image);
    return (
      <img
        src={resolverImagenPostre(postre.image)}
        width={tamano}
        height={tamano}
        alt={`Postre ${postre.name}`}
        className={esImagenNuevaCatalogo ? 'object-cover' : 'object-contain'}
      />
    );
  }

  const { accent, to } = postre.colors;
  const idDegradado = `degradado-${postre.id}`;

  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 240 240"
      role="img"
      aria-label={`Ilustración del postre ${postre.name}`}
    >
      <defs>
        <linearGradient id={idDegradado} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={to} />
          <stop offset="100%" stopColor={accent} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {/* jar body */}
      <path
        d="M60 95 h120 l-10 110 a14 14 0 0 1-14 13 H84 a14 14 0 0 1-14-13 L60 95Z"
        fill="#ffffff"
        fillOpacity="0.9"
      />
      <path
        d="M64 100 h112 l-9 100 a10 10 0 0 1-10 9 H83 a10 10 0 0 1-10-9 L64 100Z"
        fill={`url(#${idDegradado})`}
      />
      {/* layers */}
      <rect x="64" y="130" width="112" height="10" fill="#ffffff" fillOpacity="0.5" />
      <rect x="64" y="160" width="112" height="10" fill="#ffffff" fillOpacity="0.35" />
      {/* jar rim */}
      <rect x="52" y="82" width="136" height="16" rx="8" fill="#ffffff" />
      {/* topping swirl */}
      <path
        d="M90 82 C90 55 150 55 150 82"
        stroke="#ffffff"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="120" cy="52" r="7" fill="#ffffff" />
    </svg>
  );
}
