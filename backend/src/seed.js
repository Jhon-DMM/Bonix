// Carga los tres postres base. Conserva los cambios hechos desde el panel,
// elimina únicamente los postres retirados (Oreo y Fresas) y asigna el orden
// solicitado para el catálogo.
import 'dotenv/config';
import mongoose from 'mongoose';
import { conectarBaseDatos } from './db.js';
import { eliminarImagenPostre } from './imageStorage.js';
import Postre from './models/Dessert.js';

const postres = [
  {
    id: 'mora',
    name: 'Mora',
    catalogOrder: 0,
    price: 7000,
    description: 'Cremoso y frutal, con capas suaves de mora y una base crocante de galleta.',
    image: '/images/Mora-imagen.png',
    colors: { from: '#351047', to: '#6f2b8c', accent: '#f2ddfb', text: '#fff8ff' },
    ingredients: [
      { id: 'mora-1', name: 'Moras frescas' },
      { id: 'mora-2', name: 'Crema de leche' },
      { id: 'mora-3', name: 'Leche condensada' },
      { id: 'mora-4', name: 'Galletas trituradas' },
      { id: 'mora-5', name: 'Salsa de mora' },
      { id: 'mora-6', name: 'Gelatina sin sabor' },
    ],
  },
  {
    id: 'maracuya',
    name: 'Maracuyá',
    catalogOrder: 10,
    price: 7000,
    description: 'Fresco, dulce y ácido a la vez, con pulpa de maracuyá natural.',
    image: '/images/Maracuya-img.png',
    colors: { from: '#f6a623', to: '#ffd166', accent: '#5a3a00', text: '#3a2500' },
    ingredients: [
      { id: 'mar-1', name: 'Pulpa de maracuyá fresca' },
      { id: 'mar-2', name: 'Crema de leche' },
      { id: 'mar-3', name: 'Leche condensada' },
      { id: 'mar-4', name: 'Galletas tipo María trituradas' },
      { id: 'mar-5', name: 'Mantequilla derretida' },
      { id: 'mar-6', name: 'Gelatina sin sabor' },
    ],
  },
  {
    id: 'milo',
    name: 'Milo',
    catalogOrder: 20,
    price: 7000,
    description: 'Postre cremoso de chocolate malteado con crocante de Milo.',
    image: '/images/Milo-img.png',
    colors: { from: '#5a3a1e', to: '#8a5a2c', accent: '#ffe8c2', text: '#fff7ec' },
    ingredients: [
      { id: 'milo-1', name: 'Milo en polvo' },
      { id: 'milo-2', name: 'Crema de leche' },
      { id: 'milo-3', name: 'Leche condensada' },
      { id: 'milo-4', name: 'Galletas de chocolate trituradas' },
      { id: 'milo-5', name: 'Mantequilla derretida' },
      { id: 'milo-6', name: 'Chips de chocolate' },
    ],
  },
];

const idsRetirados = ['oreo', 'fresas'];
const imagenesPredeterminadasAntiguas = new Set([
  '/images/Mora-imagen.jpeg',
  '/images/Maracuya-img.jpeg',
  '/images/Milo-img.jpeg',
  '/images/Postre-oreo.png',
  '/images/Postre-Milo.png',
  '/images/Postre-maracuya.png',
  '/images/Postre-fresa.png',
]);

async function run() {
  try {
    await conectarBaseDatos();

    const postresRetirados = await Postre.find({ id: { $in: idsRetirados } }).select('image').lean();
    await Postre.deleteMany({ id: { $in: idsRetirados } });
    await Promise.all(postresRetirados.map((postre) => eliminarImagenPostre(postre.image)));

    let postresAgregados = 0;
    for (const postre of postres) {
      const actual = await Postre.findOne({ id: postre.id });
      if (!actual) {
        await Postre.create(postre);
        postresAgregados += 1;
        continue;
      }

      actual.catalogOrder = postre.catalogOrder;
      if (!actual.image || imagenesPredeterminadasAntiguas.has(actual.image)) actual.image = postre.image;
      await actual.save();
    }

    console.log(`Catálogo actualizado: ${postresAgregados} postres agregados; Mora, Maracuyá y Milo disponibles en ese orden.`);
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

run().catch(() => {
  console.error('No se pudo actualizar el catálogo. Revisa la conexión y la configuración de MongoDB.');
  process.exit(1);
});
