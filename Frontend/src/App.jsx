import { useEffect, useState } from 'react';
import * as servicioPostres from './services/dessertService.js';
import { ProveedorCanasta } from './context/CartContext.jsx';
import Encabezado from './components/Header.jsx';
import Portada from './components/Hero.jsx';
import SeccionPostre from './components/DessertSection.jsx';
import PiePagina from './components/Footer.jsx';
import PanelCanasta from './components/CartDrawer.jsx';
import PanelAdministracion from './components/AdminPanel.jsx';

function useRutaHash() {
  const [fragmentoRuta, fijarFragmentoRuta] = useState(window.location.hash);
  useEffect(() => {
    const alCambiarRutaHash = () => fijarFragmentoRuta(window.location.hash);
    window.addEventListener('hashchange', alCambiarRutaHash);
    return () => window.removeEventListener('hashchange', alCambiarRutaHash);
  }, []);
  return fragmentoRuta;
}

export default function Aplicacion() {
  const [postres, fijarPostres] = useState([]);
  const [cargando, fijarCargando] = useState(true);
  const [error, fijarError] = useState('');
  const [indicePostreActivo, fijarIndicePostreActivo] = useState(0);
  const fragmentoRuta = useRutaHash();

  useEffect(() => {
    servicioPostres
      .obtenerPostres()
      .then((data) => {
        fijarPostres(data);
        fijarCargando(false);
      })
      .catch((err) => {
        fijarError(err.message);
        fijarCargando(false);
      });
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas font-text text-ink/50">
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas font-text px-6">
        <p className="max-w-[420px] text-center text-ink/70">{error}</p>
      </div>
    );
  }

  if (fragmentoRuta === '#admin') {
    return <PanelAdministracion postres={postres} onChange={fijarPostres} />;
  }

  return (
    <ProveedorCanasta>
      <div className="relative min-h-screen flex flex-col bg-paper">
        <Encabezado postres={postres} indicePostreActivo={indicePostreActivo} />
        <Portada postres={postres} indiceActivo={indicePostreActivo} alCambiarIndiceActivo={fijarIndicePostreActivo} />

        <main>
          <section className="relative isolate overflow-hidden bg-white px-5 py-12 text-center sm:py-16">
            <h2 className="relative z-10 font-display font-semibold text-[25px] sm:text-[32px] text-ink tracking-tight">
              Conoce un poco más de lo que están hechos nuestros postres
            </h2>
            <p className="relative z-10 font-text text-[15px] sm:text-[17px] text-ink/60 mt-3">
              Dale clic a las imágenes para ver los ingredientes.
            </p>
          </section>
          {postres.map((postre, indice) => (
            <SeccionPostre key={postre.id} postre={postre} indice={indice} />
          ))}
        </main>

        <PiePagina />
        <PanelCanasta />
      </div>
    </ProveedorCanasta>
  );
}
