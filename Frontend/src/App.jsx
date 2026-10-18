import { useEffect, useState } from 'react';
import * as dessertService from './services/dessertService.js';
import { CartProvider } from './context/CartContext.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import DessertSection from './components/DessertSection.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import AdminPanel from './components/AdminPanel.jsx';

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return hash;
}

export default function App() {
  const [desserts, setDesserts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDessertIndex, setActiveDessertIndex] = useState(0);
  const hash = useHashRoute();

  useEffect(() => {
    dessertService
      .getDesserts()
      .then((data) => {
        setDesserts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
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

  if (hash === '#admin') {
    return <AdminPanel desserts={desserts} onChange={setDesserts} />;
  }

  return (
    <CartProvider>
      <div className="relative min-h-screen flex flex-col bg-paper">
        <Header desserts={desserts} activeDessertIndex={activeDessertIndex} />
        <Hero desserts={desserts} activeIndex={activeDessertIndex} onActiveIndexChange={setActiveDessertIndex} />

        <main>
          {desserts.map((dessert, index) => (
            <DessertSection key={dessert.id} dessert={dessert} index={index} />
          ))}
        </main>

        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
