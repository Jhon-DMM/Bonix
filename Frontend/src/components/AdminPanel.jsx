import { useEffect, useRef, useState } from 'react';
import * as servicioPostres from '../services/dessertService.js';
import * as servicioAutenticacion from '../services/authService.js';
import { formatearCOP } from '../utils/format.js';
import AdornosPostre from './DessertAccents.jsx';

const opcionesImagen = [
  { label: 'Postre de Mora', path: '/images/Mora-imagen.png' },
  { label: 'Postre de maracuyá', path: '/images/Maracuya-img.png' },
  { label: 'Postre de Milo', path: '/images/Milo-img.png' },
];
const secciones = [
  { id: 'inicio', label: 'Inicio', description: 'Consulta los postres disponibles, sus fotos y sus ingredientes.', icon: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></> },
  { id: 'ingredientes', label: 'Ingredientes', description: 'Agrega o quita ingredientes de cada postre.', icon: <><path d="M4 5h16M4 12h16M4 19h16" /><circle cx="8" cy="5" r="1.5" fill="currentColor" /><circle cx="15" cy="12" r="1.5" fill="currentColor" /><circle cx="10" cy="19" r="1.5" fill="currentColor" /></> },
  { id: 'precios', label: 'Precios', description: 'Actualiza el precio de cada postre, de todos a la vez o solo de los que elijas.', icon: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
  { id: 'imagenes', label: 'Imágenes', description: 'Cambia la foto de un postre o sube una desde tu dispositivo.', icon: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></> },
  { id: 'eliminar', label: 'Eliminar postre', description: 'Elimina un postre del catálogo y de la página principal.', icon: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></> },
  { id: 'agregar', label: 'Agregar postre', description: 'Crea un postre nuevo para incluirlo en el catálogo.', icon: <><path d="M12 5v14M5 12h14" /></> },
];

const postreInicial = { id: '', name: '', price: '', description: '' };
const obtenerImagenPostre = (postre) => postre.image || '';
const claseAjusteImagenPostre = (ruta) => (
  /^\/images\/(Mora-imagen|Maracuya-img|Milo-img)\.png$/.test(ruta || '')
    ? 'object-cover'
    : 'object-contain'
);

async function convertirArchivoImagenWebp(archivo) {
  if (!archivo.type.startsWith('image/')) throw new Error('Elige un archivo de imagen.');
  const mapaBits = await createImageBitmap(archivo);
  const ladoMaximo = 1400;
  const escala = Math.min(1, ladoMaximo / Math.max(mapaBits.width, mapaBits.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(mapaBits.width * escala);
  canvas.height = Math.round(mapaBits.height * escala);
  canvas.getContext('2d').drawImage(mapaBits, 0, 0, canvas.width, canvas.height);
  mapaBits.close();
  return new Promise((resolver, rechazar) => {
    canvas.toBlob((blob) => {
      if (blob) resolver(blob);
      else rechazar(new Error('No se pudo preparar la imagen.'));
    }, 'image/webp', 0.82);
  });
}

function IconoAdministracion({ children }) {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}

function TarjetaPostre({ postre }) {
  return (
    <article className="overflow-hidden rounded-card border border-hairline bg-paper">
      <div className="flex justify-center pt-4">
        <div className="flex h-[219px] w-[219px] items-center justify-center rounded-2xl bg-celeste-50 p-3">
          {obtenerImagenPostre(postre)
            ? <img src={servicioPostres.resolverImagenPostre(obtenerImagenPostre(postre))} alt={postre.name} className={`h-[156px] w-[156px] max-h-full max-w-full ${claseAjusteImagenPostre(postre.image)}`} />
            : <span className="text-center text-xs font-medium text-ink/45">Sin imagen</span>}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-semibold text-ink">{postre.name}</h3>
        <p className="mt-4 text-sm font-semibold text-ink/60">Ingredientes</p>
        {postre.ingredients.length ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {postre.ingredients.map((ingrediente) => <li key={ingrediente.id} className="rounded-pill bg-canvas px-3 py-1 text-sm text-ink/75">{ingrediente.name}</li>)}
          </ul>
        ) : <p className="mt-2 text-sm text-ink/45">Aún no hay ingredientes.</p>}
      </div>
    </article>
  );
}

export default function PanelAdministracion({ postres, onChange }) {
  const [seccionActiva, fijarSeccionActiva] = useState('inicio');
  const [nombreIngredienteNuevo, fijarNombreIngredienteNuevo] = useState({});
  const [postreNuevo, fijarPostreNuevo] = useState(postreInicial);
  const [borradoresPrecio, fijarBorradoresPrecio] = useState({});
  const [precioMasivo, fijarPrecioMasivo] = useState('');
  const [postresSeleccionadosPrecio, fijarPostresSeleccionadosPrecio] = useState([]);
  const [error, fijarError] = useState('');
  const [success, fijarExito] = useState('');
  const [estadoAutenticacion, fijarEstadoAutenticacion] = useState('checking');
  const [errorInicioSesion, fijarErrorInicioSesion] = useState('');
  const [usuarioInicioSesion, fijarUsuarioInicioSesion] = useState('');
  const [contrasenaInicioSesion, fijarContrasenaInicioSesion] = useState('');
  const [inicioSesionPendiente, fijarInicioSesionPendiente] = useState(false);
  const [seleccionesImagen, fijarSeleccionesImagen] = useState({});
  const [cargasImagen, fijarCargasImagen] = useState({});
  const [cambioImagenPendiente, fijarCambioImagenPendiente] = useState(null);
  const referenciasEntradaArchivo = useRef({});

  useEffect(() => {
    if (!success) return undefined;
    const idTemporizador = window.setTimeout(() => fijarExito(''), 3500);
    return () => window.clearTimeout(idTemporizador);
  }, [success]);

  useEffect(() => {
    let cancelado = false;
    servicioAutenticacion.obtenerSesionAdministrador()
      .then(() => { if (!cancelado) fijarEstadoAutenticacion('authenticated'); })
      .catch((err) => {
        if (cancelado) return;
        fijarEstadoAutenticacion('anonymous');
        if (err.status !== 401) fijarErrorInicioSesion(err.message);
      });
    return () => { cancelado = true; };
  }, []);

  const gestionarInicioSesion = async (event) => {
    event.preventDefault();
    fijarInicioSesionPendiente(true);
    fijarErrorInicioSesion('');
    try {
      await servicioAutenticacion.iniciarSesionAdministrador(usuarioInicioSesion.trim(), contrasenaInicioSesion);
      fijarContrasenaInicioSesion('');
      fijarEstadoAutenticacion('authenticated');
      try {
        onChange(await servicioPostres.obtenerPostres());
      } catch (refreshError) {
        fijarError(refreshError.message);
      }
    } catch (err) {
      fijarErrorInicioSesion(err.message);
    } finally {
      fijarInicioSesionPendiente(false);
    }
  };

  const cerrarSesionAdministrador = async () => {
    try {
      await servicioAutenticacion.cerrarSesionAdministrador();
    } catch {
      // De todos modos se oculta el panel; la sesión expira en el servidor.
    }
    fijarEstadoAutenticacion('anonymous');
    fijarUsuarioInicioSesion('');
    fijarContrasenaInicioSesion('');
    fijarErrorInicioSesion('');
  };

  const actualizarListado = async () => onChange(await servicioPostres.obtenerPostres());
  const ejecutarAccion = async (action, message) => {
    try {
      fijarError('');
      fijarExito('');
      await action();
      await actualizarListado();
      if (message) fijarExito(message);
    } catch (err) {
      if (err.status === 401) {
        fijarEstadoAutenticacion('anonymous');
        fijarErrorInicioSesion('La sesión venció. Inicia sesión nuevamente.');
      }
      fijarError(err.message);
    }
  };

  const agregarIngrediente = async (dessertId) => {
    const name = (nombreIngredienteNuevo[dessertId] || '').trim();
    if (!name) return;
    await ejecutarAccion(async () => {
      await servicioPostres.agregarIngrediente(dessertId, name);
      fijarNombreIngredienteNuevo((prev) => ({ ...prev, [dessertId]: '' }));
    }, 'Has agregado el ingrediente al postre.');
  };

  const quitarIngrediente = async (dessertId, ingredientId) => {
    await ejecutarAccion(() => servicioPostres.quitarIngrediente(dessertId, ingredientId), 'Has eliminado el ingrediente del postre.');
  };

  const guardarPrecioPostre = async (postre) => {
    const value = borradoresPrecio[postre.id] ?? String(postre.price);
    if (value === '' || !Number.isFinite(Number(value)) || Number(value) < 0) return;
    await ejecutarAccion(() => servicioPostres.actualizarPrecioPostre(postre.id, Number(value)), `Has actualizado el precio de ${postre.name}.`);
  };

  const aplicarPrecioMasivo = async (dessertIds, mensajeExito) => {
    if (precioMasivo === '' || !Number.isFinite(Number(precioMasivo)) || Number(precioMasivo) < 0 || !dessertIds.length) return;
    await ejecutarAccion(async () => {
      await servicioPostres.actualizarPreciosPostres(dessertIds, Number(precioMasivo));
      fijarBorradoresPrecio((prev) => {
        const next = { ...prev };
        dessertIds.forEach((id) => delete next[id]);
        return next;
      });
    }, mensajeExito);
  };

  const alternarPostreSeleccionPrecio = (dessertId) => {
    fijarPostresSeleccionadosPrecio((prev) => prev.includes(dessertId)
      ? prev.filter((id) => id !== dessertId)
      : [...prev, dessertId]);
  };

  const eliminarPostre = async (postre) => {
    if (!window.confirm(`¿Eliminar ${postre.name}? Esta acción no se puede deshacer.`)) return;
    await ejecutarAccion(() => servicioPostres.eliminarPostre(postre.id), `Has eliminado el postre ${postre.name}.`);
  };

  const seleccionarImagenLocal = async (event, dessertId) => {
    const archivo = event.target.files?.[0];
    event.target.value = '';
    if (!archivo) return;
    try {
      fijarError('');
      const blob = await convertirArchivoImagenWebp(archivo);
      const preview = URL.createObjectURL(blob);
      const vistaPreviaAnterior = seleccionesImagen[dessertId];
      if (vistaPreviaAnterior?.startsWith('blob:')) URL.revokeObjectURL(vistaPreviaAnterior);
      fijarCargasImagen((prev) => ({ ...prev, [dessertId]: blob }));
      fijarSeleccionesImagen((prev) => ({ ...prev, [dessertId]: preview }));
    } catch (err) {
      fijarError(err.message || 'No se pudo abrir esa imagen.');
    }
  };

  const guardarImagen = () => {
    if (!cambioImagenPendiente) return;
    ejecutarAccion(async () => {
      if (cambioImagenPendiente.upload) {
        await servicioPostres.subirImagenPostre(cambioImagenPendiente.dessertId, cambioImagenPendiente.upload);
      } else {
        await servicioPostres.actualizarImagenPostre(cambioImagenPendiente.dessertId, cambioImagenPendiente.image);
      }
      if (cambioImagenPendiente.image.startsWith('blob:')) URL.revokeObjectURL(cambioImagenPendiente.image);
      fijarSeleccionesImagen((prev) => { const next = { ...prev }; delete next[cambioImagenPendiente.dessertId]; return next; });
      fijarCargasImagen((prev) => { const next = { ...prev }; delete next[cambioImagenPendiente.dessertId]; return next; });
      fijarCambioImagenPendiente(null);
    }, `Has actualizado la imagen de ${cambioImagenPendiente.dessertName}.`);
  };

  const agregarPostre = async (event) => {
    event.preventDefault();
    await ejecutarAccion(async () => {
      await servicioPostres.agregarPostre({
        id: postreNuevo.id.trim().toLowerCase().replace(/\s+/g, '-'),
        name: postreNuevo.name.trim(),
        price: Number(postreNuevo.price) || 0,
        description: postreNuevo.description.trim(),
        ingredients: [],
      });
      fijarPostreNuevo(postreInicial);
    }, `Has agregado el postre ${postreNuevo.name.trim()}.`);
  };

  const active = secciones.find((seccion) => seccion.id === seccionActiva);
  const inputClass = 'w-full rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm outline-hidden focus:border-celeste-500';
  const buttonClass = 'rounded-pill bg-celeste-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-celeste-700 disabled:cursor-not-allowed disabled:opacity-40';

  if (estadoAutenticacion !== 'authenticated') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10 font-text text-ink">
        <section className="w-full max-w-[440px] rounded-card border border-hairline bg-white p-7 shadow-xs sm:p-9">
          <p className="mb-4 inline-flex rounded-pill bg-celeste-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-celeste-800">Bonix · Administración</p>
          <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight sm:text-[28px]">Estás a punto de entrar al panel administrativo de Bonix</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">Ingresa tus credenciales para administrar los postres.</p>

          {estadoAutenticacion === 'checking' ? (
            <p className="mt-6 text-sm text-ink/55" role="status">Verificando sesión…</p>
          ) : (
            <form className="mt-6 flex flex-col gap-4" onSubmit={gestionarInicioSesion}>
              <label className="text-sm font-semibold">Usuario
                <input autoComplete="username" required className={`${inputClass} mt-1.5 font-normal`} value={usuarioInicioSesion} onChange={(event) => fijarUsuarioInicioSesion(event.target.value)} />
              </label>
              <label className="text-sm font-semibold">Contraseña
                <input autoComplete="current-password" required type="password" className={`${inputClass} mt-1.5 font-normal`} value={contrasenaInicioSesion} onChange={(event) => fijarContrasenaInicioSesion(event.target.value)} />
              </label>
              {errorInicioSesion && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorInicioSesion}</p>}
              <button type="submit" disabled={inicioSesionPendiente || !usuarioInicioSesion.trim() || !contrasenaInicioSesion} className={`${buttonClass} mt-1 w-full py-3`}>
                {inicioSesionPendiente ? 'Ingresando…' : 'Iniciar sesión'}
              </button>
            </form>
          )}

          <a href="#inicio" className="mt-6 inline-flex text-sm font-semibold text-celeste-700 hover:text-celeste-800">Volver a la página principal</a>
        </section>
      </main>
    );
  }

  return (
    <div className="relative isolate min-h-screen bg-canvas font-text text-ink">
      {postres[0] && <AdornosPostre postre={postres[0]} modo="admin" />}
      <aside className="barra-lateral-admin fixed inset-y-0 left-0 z-30 flex w-[76px] flex-col items-center border-r border-hairline bg-white py-5">
        <a href="#inicio" className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-celeste-600 font-display text-lg font-bold text-white" aria-label="Volver al sitio">B</a>
        <nav className="flex w-full flex-col items-center gap-2" aria-label="Secciones del panel">
          {secciones.map((seccion) => (
            <button
              key={seccion.id}
              type="button"
              onClick={() => { fijarSeccionActiva(seccion.id); fijarError(''); fijarExito(''); }}
              className={`elemento-navegacion-admin group relative flex h-12 w-12 items-center justify-center rounded-2xl transition ${seccionActiva === seccion.id ? 'bg-celeste-100 text-celeste-700' : 'text-ink/50 hover:bg-canvas hover:text-ink'}`}
              aria-label={seccion.label}
              aria-current={seccionActiva === seccion.id ? 'page' : undefined}
            >
              <IconoAdministracion>{seccion.icon}</IconoAdministracion>
              <span className="ayuda-navegacion-admin pointer-events-none absolute left-[58px] z-40 whitespace-nowrap rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 delay-500 group-hover:opacity-100 group-focus-visible:opacity-100">{seccion.label}</span>
            </button>
          ))}
        </nav>
        <button type="button" onClick={cerrarSesionAdministrador} className="mt-auto flex h-12 w-12 items-center justify-center rounded-2xl text-ink/45 transition hover:bg-canvas hover:text-ink" aria-label="Cerrar sesión" title="Cerrar sesión">
          <IconoAdministracion><path d="M10 17l5-5-5-5M15 12H3m9-8h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7" /></IconoAdministracion>
        </button>
        <a href="#inicio" className="mt-2 flex h-12 w-12 items-center justify-center rounded-2xl text-ink/45 transition hover:bg-canvas hover:text-ink" aria-label="Volver al sitio" title="Volver al sitio">
          <IconoAdministracion><path d="M15 18 9 12l6-6M9 12h12" /></IconoAdministracion>
        </a>
      </aside>

      <main className="admin-main relative z-10 ml-[76px] min-h-screen px-[10%] py-8 sm:py-10">
        <div className="mx-auto max-w-[1050px]">
          <div className="mb-8 flex items-end justify-between gap-4 px-1 sm:px-2">
            <div className="min-w-0">
              <p className="mb-3 inline-flex rounded-pill bg-celeste-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-celeste-800">Bonix <span className="mx-1.5 opacity-50">·</span> Administración</p>
              <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">{active.label}</h1>
              <p className="mt-2 max-w-[560px] text-sm leading-relaxed text-ink/55">{active.description}</p>
            </div>
            <span className="hidden rounded-pill bg-white px-4 py-2 text-sm text-ink/55 sm:inline-flex">{postres.length} postres</span>
          </div>

          {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}


          {seccionActiva === 'inicio' && (
            postres.length ? <div className="grid max-w-[900px] gap-5 sm:grid-cols-2 lg:grid-cols-3">{postres.map((postre) => <TarjetaPostre key={postre.id} postre={postre} />)}</div>
              : <p className="rounded-card border border-hairline bg-white p-8 text-center text-ink/55">Todavía no hay postres.</p>
          )}

          {seccionActiva === 'ingredientes' && (
            <div className="flex flex-col gap-4">
              {postres.map((postre) => (
                <section key={postre.id} className="w-full max-w-[640px] rounded-card border border-hairline bg-white p-5 sm:p-6">
                  <h2 className="font-display text-xl font-semibold">{postre.name}</h2>
                  <ul className="my-4 divide-y divide-hairline">
                    {postre.ingredients.map((ingrediente) => <li key={ingrediente.id} className="flex items-center justify-between gap-4 py-3 text-sm"><span>{ingrediente.name}</span><button type="button" onClick={() => quitarIngrediente(postre.id, ingrediente.id)} className="text-xs font-semibold text-red-500 hover:text-red-700">Quitar</button></li>)}
                    {!postre.ingredients.length && <li className="py-3 text-sm text-ink/45">Sin ingredientes todavía.</li>}
                  </ul>
                  <form className="flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); agregarIngrediente(postre.id); }}>
                    <input className={inputClass} value={nombreIngredienteNuevo[postre.id] || ''} onChange={(event) => fijarNombreIngredienteNuevo((prev) => ({ ...prev, [postre.id]: event.target.value }))} placeholder="Nombre del ingrediente" aria-label={`Nuevo ingrediente para ${postre.name}`} />
                    {(nombreIngredienteNuevo[postre.id] || '').trim().length > 0 && <button type="submit" className={`${buttonClass} shrink-0`}>Agregar</button>}
                  </form>
                </section>
              ))}
            </div>
          )}

          {seccionActiva === 'precios' && (
            <div className="flex flex-col gap-5">
              <div className="grid max-w-[920px] justify-items-center gap-4 sm:grid-cols-2">
                {postres.map((postre) => (
                  <section key={postre.id} className="w-full max-w-[440px] rounded-card border border-hairline bg-white p-5">
                    <h2 className="font-display text-lg font-semibold">{postre.name}</h2>
                    <p className="mt-1 text-sm text-ink/50">Precio actual: {formatearCOP(postre.price)}</p>
                    <form className="mt-4 flex items-end gap-2" onSubmit={(event) => { event.preventDefault(); guardarPrecioPostre(postre); }}>
                      <label className="min-w-0 flex-1 text-sm font-medium">Nuevo precio
                        <input className={`${inputClass} mt-1.5`} type="number" min="0" step="1" value={borradoresPrecio[postre.id] ?? String(postre.price)} onChange={(event) => fijarBorradoresPrecio((prev) => ({ ...prev, [postre.id]: event.target.value }))} />
                      </label>
                      <button type="submit" className={`${buttonClass} shrink-0`} disabled={(borradoresPrecio[postre.id] ?? String(postre.price)) === String(postre.price)}>Guardar</button>
                    </form>
                  </section>
                ))}
              </div>

              <div className="flex flex-col items-center gap-5">
                <section className="w-full max-w-[640px] rounded-card border border-hairline bg-white p-5 sm:p-6">
                  <h2 className="font-display text-lg font-semibold">Cambiar el precio de todos</h2>
                  <p className="mt-1 text-sm text-ink/55">Usa el mismo precio para todos los postres del catálogo.</p>
                  <form className="mt-4 flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); aplicarPrecioMasivo(postres.map((postre) => postre.id), 'Has actualizado los precios de todos los postres.'); }}>
                    <label className="min-w-[160px] flex-1 text-sm font-medium">Nuevo precio
                      <input className={`${inputClass} mt-1.5`} type="number" min="0" step="1" value={precioMasivo} onChange={(event) => fijarPrecioMasivo(event.target.value)} placeholder="Ej. 12000" />
                    </label>
                    <button type="submit" className={`${buttonClass} self-end`} disabled={!postres.length || precioMasivo === ''}>Aplicar a todos</button>
                  </form>
                </section>
                <section className="w-full max-w-[640px] rounded-card border border-hairline bg-white p-5 sm:p-6">
                  <h2 className="font-display text-lg font-semibold">Elegir postres</h2>
                  <p className="mt-1 text-sm text-ink/55">Selecciona cuáles quieres actualizar con un mismo precio.</p>
                  <div className="my-4 flex flex-col divide-y divide-hairline">
                    {postres.map((postre) => (
                      <label key={postre.id} className="flex cursor-pointer items-center gap-3 py-3 text-sm">
                        <input type="checkbox" checked={postresSeleccionadosPrecio.includes(postre.id)} onChange={() => alternarPostreSeleccionPrecio(postre.id)} className="h-4 w-4 accent-celeste-600" />
                        <span className="flex-1 font-medium">{postre.name}</span>
                        <span className="text-ink/50">{formatearCOP(postre.price)}</span>
                      </label>
                    ))}
                  </div>
                  <form className="flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); aplicarPrecioMasivo(postresSeleccionadosPrecio, 'Has actualizado los precios de los postres seleccionados.'); }}>
                    <label className="min-w-[160px] flex-1 text-sm font-medium">Nuevo precio
                      <input className={`${inputClass} mt-1.5`} type="number" min="0" step="1" value={precioMasivo} onChange={(event) => fijarPrecioMasivo(event.target.value)} placeholder="Ej. 12000" />
                    </label>
                    <button type="submit" className={`${buttonClass} self-end`} disabled={!postresSeleccionadosPrecio.length || precioMasivo === ''}>Aplicar a seleccionados</button>
                  </form>
                </section>
              </div>
            </div>
          )}

          {seccionActiva === 'imagenes' && (
            <div className="grid max-w-[920px] gap-4 sm:grid-cols-2">
              {postres.map((postre) => {
                const imagenSeleccionada = seleccionesImagen[postre.id] ?? obtenerImagenPostre(postre);
                return (
                  <section key={postre.id} className="w-full max-w-[560px] rounded-card border border-hairline bg-white p-5">
                    <h2 className="mb-4 font-display text-lg font-semibold">{postre.name}</h2>
                    <div className="flex flex-col gap-4 sm:flex-row">
                      {imagenSeleccionada
                        ? <img src={servicioPostres.resolverImagenPostre(imagenSeleccionada)} alt={`Vista previa de ${postre.name}`} className={`h-[188px] w-[188px] shrink-0 rounded-xl bg-celeste-50 p-2 ${claseAjusteImagenPostre(imagenSeleccionada)}`} />
                        : <div role="img" aria-label={`${postre.name}: sin imagen asignada`} className="flex h-[188px] w-[188px] shrink-0 items-center justify-center rounded-xl bg-celeste-50 p-2 text-center text-xs text-ink/45">Sin imagen</div>}
                      <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <select className={inputClass} value={opcionesImagen.some((opcion) => opcion.path === imagenSeleccionada) ? imagenSeleccionada : ''} onChange={(event) => {
                          const vistaPreviaAnterior = seleccionesImagen[postre.id];
                          if (vistaPreviaAnterior?.startsWith('blob:')) URL.revokeObjectURL(vistaPreviaAnterior);
                          fijarCargasImagen((prev) => { const next = { ...prev }; delete next[postre.id]; return next; });
                          fijarSeleccionesImagen((prev) => ({ ...prev, [postre.id]: event.target.value }));
                        }} aria-label={`Elegir imagen para ${postre.name}`}>
                          <option value="" disabled>Elige una imagen incluida</option>
                          {opcionesImagen.map((opcion) => <option key={opcion.path} value={opcion.path}>{opcion.label}</option>)}
                        </select>
                        <input ref={(node) => { referenciasEntradaArchivo.current[postre.id] = node; }} type="file" accept="image/*" className="sr-only" onChange={(event) => seleccionarImagenLocal(event, postre.id)} aria-label={`Subir imagen desde el dispositivo para ${postre.name}`} />
                        <button type="button" className="rounded-pill border border-hairline px-4 py-2 text-sm font-semibold text-ink/75 hover:bg-canvas" onClick={() => referenciasEntradaArchivo.current[postre.id]?.click()}>Elegir desde mi dispositivo</button>
                        <button type="button" className={buttonClass} disabled={imagenSeleccionada === obtenerImagenPostre(postre)} onClick={() => fijarCambioImagenPendiente({ dessertId: postre.id, dessertName: postre.name, image: imagenSeleccionada, upload: cargasImagen[postre.id] || null })}>Guardar imagen</button>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {seccionActiva === 'eliminar' && (
            <div className="flex flex-col gap-3">
              {postres.map((postre) => (
                <article key={postre.id} className="flex w-full max-w-[640px] items-center gap-4 rounded-card border border-hairline bg-white p-4">
                  {obtenerImagenPostre(postre)
                    ? <img src={servicioPostres.resolverImagenPostre(obtenerImagenPostre(postre))} alt="" className={`h-[86px] w-[86px] shrink-0 rounded-xl bg-celeste-50 p-1 ${claseAjusteImagenPostre(postre.image)}`} />
                    : <span role="img" aria-label="Sin imagen asignada" className="flex h-[86px] w-[86px] shrink-0 items-center justify-center rounded-xl bg-celeste-50 text-center text-[8px] text-ink/45">Sin imagen</span>}
                  <div className="min-w-0 flex-1"><h2 className="truncate font-semibold">{postre.name}</h2><p className="text-sm text-ink/50">{formatearCOP(postre.price)}</p></div>
                  <button type="button" onClick={() => eliminarPostre(postre)} className="rounded-pill border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Eliminar</button>
                </article>
              ))}
            </div>
          )}

          {seccionActiva === 'agregar' && (
            <form onSubmit={agregarPostre} className="mx-auto w-full max-w-[448px] rounded-card border border-hairline bg-white p-5 sm:p-7">
              <h2 className="mb-1 font-display text-xl font-semibold">Agregar postre nuevo</h2>
              <p className="mb-6 text-sm text-ink/55">Después podrás agregar sus ingredientes y elegir su imagen desde las otras secciones.</p>
              <div className="flex flex-col gap-4">
                <label className="text-sm font-semibold">Nombre<input required className={`${inputClass} mt-1.5 font-normal`} placeholder="Ej. Postre de chocolate" value={postreNuevo.name} onChange={(event) => fijarPostreNuevo((prev) => ({ ...prev, name: event.target.value }))} /></label>
                <label className="text-sm font-semibold">Identificador<input required pattern="[A-Za-z0-9-]+" title="Usa letras, números o guiones" className={`${inputClass} mt-1.5 font-normal`} placeholder="Ej. chocolate" value={postreNuevo.id} onChange={(event) => fijarPostreNuevo((prev) => ({ ...prev, id: event.target.value.toLowerCase().replace(/\s+/g, '-') }))} /></label>
                <label className="text-sm font-semibold">Precio<input required type="number" min="0" step="1" className={`${inputClass} mt-1.5 font-normal`} placeholder="0" value={postreNuevo.price} onChange={(event) => fijarPostreNuevo((prev) => ({ ...prev, price: event.target.value }))} /></label>
                <label className="text-sm font-semibold">Descripción<textarea className={`${inputClass} mt-1.5 font-normal`} rows="3" placeholder="Describe brevemente el postre" value={postreNuevo.description} onChange={(event) => fijarPostreNuevo((prev) => ({ ...prev, description: event.target.value }))} /></label>
                {postreNuevo.name.trim() && postreNuevo.id.trim() && postreNuevo.price.trim() && postreNuevo.description.trim() && (
                  <button type="submit" className={`${buttonClass} self-start px-6 py-2.5`}>Agregar postre</button>
                )}
              </div>
            </form>
          )}
        </div>
      </main>

      {success && (
        <div role="status" aria-live="polite" className="fixed right-5 top-5 z-60 flex w-[min(360px,calc(100%-2.5rem))] items-center gap-3 rounded-2xl border border-green-200 bg-white px-4 py-3.5 text-sm font-medium text-ink shadow-xl">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700" aria-hidden="true">✓</span>
          <span className="flex-1">{success}</span>
          <button type="button" onClick={() => fijarExito('')} className="rounded-full px-2 py-1 text-lg leading-none text-ink/45 hover:bg-canvas hover:text-ink" aria-label="Cerrar notificación">×</button>
        </div>
      )}

      {cambioImagenPendiente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4" role="presentation">
          <div className="w-full max-w-[400px] rounded-card bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="confirm-image-title">
            <h2 id="confirm-image-title" className="font-display text-xl font-semibold">¿Guardar esta imagen?</h2>
            <p className="mt-2 text-sm text-ink/65">Se actualizará la imagen de {cambioImagenPendiente.dessertName} en la página principal.</p>
            <img src={servicioPostres.resolverImagenPostre(cambioImagenPendiente.image)} alt={`Nueva imagen de ${cambioImagenPendiente.dessertName}`} className={`mx-auto my-5 h-[219px] w-[219px] ${claseAjusteImagenPostre(cambioImagenPendiente.image)}`} />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => fijarCambioImagenPendiente(null)} className="rounded-pill bg-canvas px-5 py-2.5 text-sm font-semibold">Cancelar</button>
              <button type="button" onClick={guardarImagen} className={buttonClass}>Sí, guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
