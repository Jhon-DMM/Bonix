import { useEffect, useState } from 'react';
import { useCanasta } from '../context/useCart.js';
import { formatearCOP } from '../utils/format.js';
import IlustracionPostre from './DessertIllustration.jsx';
import ModalCantidad from './QuantityModal.jsx';

const duracionEncendido = 1500;
const separacionAnimaciones = 900;
const duracionEntradaEncabezado = 2100;
const duracionEntradaPostre = 2150;
const duracionEntradaDetalles = 2000;
const inicioEntradaEncabezado = duracionEncendido + separacionAnimaciones;
const inicioEntradaPostre = inicioEntradaEncabezado + duracionEntradaEncabezado + separacionAnimaciones;
const inicioEntradaDetalles = inicioEntradaPostre + duracionEntradaPostre + separacionAnimaciones;
const finEntradaInicial = inicioEntradaDetalles + duracionEntradaDetalles;

function Flecha({ direccion, onClick, disabled, label, colorPostre }) {
  const estaALaIzquierda = direccion === 'izquierda';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{ color: colorPostre }}
      className={`absolute top-1/2 -translate-y-1/2 z-10 ${estaALaIzquierda ? 'left-1 sm:left-2' : 'right-1 sm:right-2'} w-11 h-11 rounded-pill flex items-center justify-center bg-white/25 hover:bg-white/40 backdrop-blur-sm transition-opacity ${disabled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d={estaALaIzquierda ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function Portada({ postres, indiceActivo = 0, alCambiarIndiceActivo = () => {} }) {
  const [direccion, fijarDireccion] = useState('derecha');
  const [modalAbierto, fijarModalAbierto] = useState(false);
  const [movimientoReducido] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [fondoListo, fijarFondoListo] = useState(movimientoReducido);
  const [entradaLista, fijarEntradaLista] = useState(movimientoReducido);
  const [primeraEntradaPostre, fijarPrimeraEntradaPostre] = useState(!movimientoReducido);
  const { agregarElemento, abrirCanasta } = useCanasta();

  useEffect(() => {
    if (movimientoReducido) return undefined;

    const temporizadorFondo = window.setTimeout(() => fijarFondoListo(true), inicioEntradaPostre);
    const temporizadorEntrada = window.setTimeout(() => fijarEntradaLista(true), finEntradaInicial);
    return () => {
      window.clearTimeout(temporizadorFondo);
      window.clearTimeout(temporizadorEntrada);
    };
  }, [movimientoReducido]);

  if (postres.length === 0) {
    return (
      <section id="inicio" className="h-screen flex items-center justify-center bg-canvas">
        <p className="font-text text-ink/60">Pronto tendremos postres disponibles.</p>
      </section>
    );
  }

  const indice = Math.min(indiceActivo, postres.length - 1);
  const postre = postres[indice];
  const animacionDeslizamiento = direccion === 'derecha' ? 'animate-deslizar-desde-derecha' : 'animate-deslizar-desde-izquierda';
  const puedeIrAnterior = indice > 0;
  const puedeIrSiguiente = indice < postres.length - 1;
  const irAnterior = () => {
    if (!puedeIrAnterior) return;
    fijarPrimeraEntradaPostre(false);
    fijarDireccion('izquierda');
    alCambiarIndiceActivo(indice - 1);
  };
  const irSiguiente = () => {
    if (!puedeIrSiguiente) return;
    fijarPrimeraEntradaPostre(false);
    fijarDireccion('derecha');
    alCambiarIndiceActivo(indice + 1);
  };
  const confirmarAgregar = (cantidad) => {
    agregarElemento(postre, cantidad);
    fijarModalAbierto(false);
    abrirCanasta();
  };

  return (
    <section
      id="inicio"
      className="relative h-screen min-h-[620px] overflow-hidden transition-colors duration-700 ease-out"
      style={{ backgroundColor: fondoListo ? postre.colors.from : '#d9f1ff' }}
    >
      {fondoListo && (
      <div
          key={`bg-${postre.id}`}
          className="absolute inset-0 animate-[aparecerGradualmente_500ms_ease-out]"
          style={{ background: `radial-gradient(circle at 50% 38%, ${postre.colors.to}, transparent 65%)` }}
        />
      )}
      <div className="hero-encendido absolute inset-0 z-30 pointer-events-none" aria-hidden="true" />

      <div className={entradaLista ? 'pointer-events-auto' : 'entrada-hero-demorada pointer-events-none'} style={{ '--demora-entrada-detalles': `${inicioEntradaDetalles}ms` }}>
        <Flecha direccion="izquierda" onClick={irAnterior} disabled={!puedeIrAnterior} label="Postre anterior" colorPostre={postre.colors.text} />
        <Flecha direccion="derecha" onClick={irSiguiente} disabled={!puedeIrSiguiente} label="Siguiente postre" colorPostre={postre.colors.text} />

        <p className="absolute left-6 sm:left-10 top-[88px] z-10 font-text text-[13px] font-semibold tracking-wide" style={{ color: postre.colors.text }}>
          {indice + 1}/{postres.length}
        </p>
      </div>

      <div key={postre.id} className={`absolute inset-0 flex items-center justify-center pointer-events-none ${animacionDeslizamiento} ${primeraEntradaPostre ? 'entrada-imagen-postre' : ''}`} style={{ '--demora-entrada-postre': primeraEntradaPostre ? `${inicioEntradaPostre}ms` : '0ms' }}>
        <div className="-translate-y-6 sm:-translate-y-2">
          <IlustracionPostre postre={postre} tamano={Math.min(442, window.innerWidth * 0.68)} />
        </div>
      </div>

      <div key={`details-${postre.id}`} className={`absolute right-6 bottom-6 sm:right-12 sm:bottom-10 z-10 max-w-[280px] text-right ${animacionDeslizamiento}`} style={{ color: postre.colors.text }}>
        <div className={entradaLista ? '' : 'entrada-detalles-postre'} style={{ '--demora-entrada-detalles': `${inicioEntradaDetalles}ms` }}>
          <p className="font-text text-[13px] opacity-75">Postre artesanal</p>
          <h1 className="font-display font-semibold leading-tight tracking-tight text-[28px] sm:text-[36px]">{postre.name}</h1>
          <p className="font-text text-[14px] leading-snug opacity-85 mt-1">{postre.description}</p>
          <div className="mt-3 flex items-center justify-end gap-3">
            <span className="font-text text-[14px] font-semibold">{formatearCOP(postre.price)}</span>
            <button
              type="button"
              onClick={() => fijarModalAbierto(true)}
              className="rounded-pill bg-[#0071e3] text-white font-text font-semibold text-[14px] px-5 py-2.5 hover:bg-[#0066cc] transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>

      {modalAbierto && (
        <ModalCantidad postre={postre} onConfirm={confirmarAgregar} onCancel={() => fijarModalAbierto(false)} />
      )}
    </section>
  );
}
