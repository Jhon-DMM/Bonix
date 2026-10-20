// Ejecuta `npm run seed` (desde backend/) para llenar la base de datos con
// los 4 postres originales. Solo agrega los que falten; no borra ni sobrescribe
// cambios del panel ni postres agregados después.
import 'dotenv/config';
import { conectarBaseDatos } from './db.js';
import Postre from './models/Dessert.js';
import mongoose from 'mongoose';

const postres = [
  {
    id: 'oreo',
    name: 'Oreo',
    price: 7000,
    description: 'Capas de galleta Oreo, queso crema batido y chocolate.',
    image: '/images/Postre-oreo.png',
    colors: { from: '#1b1b1f', to: '#3a3a42', accent: '#f5f5f7', text: '#f5f5f7' },
    ingredients: [
      { id: 'oreo-1', name: 'Galletas Oreo trituradas' },
      { id: 'oreo-2', name: 'Queso crema' },
      { id: 'oreo-3', name: 'Crema de leche' },
      { id: 'oreo-4', name: 'Leche condensada' },
      { id: 'oreo-5', name: 'Mantequilla derretida' },
      { id: 'oreo-6', name: 'Galleta Oreo entera, para decorar' },
    ],
  },
  {
    id: 'milo',
    name: 'Milo',
    price: 7000,
    description: 'Postre cremoso de chocolate malteado con crocante de Milo.',
    image: '/images/Postre-Milo.png',
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
  {
    id: 'maracuya',
    name: 'Maracuyá',
    price: 7000,
    description: 'Fresco, dulce y ácido a la vez, con pulpa de maracuyá natural.',
    image: '/images/Postre-maracuya.png',
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
    id: 'fresas',
    name: 'Fresas',
    price: 7000,
    description: 'Capas de fresa natural con crema suave y base de galleta.',
    image: '/images/Postre-fresa.png',
    colors: { from: '#e8486b', to: '#ffb3c6', accent: '#3a0011', text: '#3a0011' },
    ingredients: [
      { id: 'fre-1', name: 'Fresas frescas' },
      { id: 'fre-2', name: 'Crema de leche' },
      { id: 'fre-3', name: 'Leche condensada' },
      { id: 'fre-4', name: 'Galletas tipo María trituradas' },
      { id: 'fre-5', name: 'Mantequilla derretida' },
      { id: 'fre-6', name: 'Gelatina de fresa' },
    ],
  },
];

async function run() {
  try {
    await conectarBaseDatos();
    const result = await Postre.bulkWrite(
      postres.map((postre) => ({
        updateOne: {
          filter: { id: postre.id },
          update: { $setOnInsert: postre },
          upsert: true,
        },
      })),
      { ordered: true }
    );

    console.log(`Carga inicial completada: ${result.upsertedCount} postres agregados; los existentes se conservaron.`);
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

run().catch(() => {
  console.error('No se pudo completar la carga inicial. Revisa la conexión y la configuración de MongoDB.');
  process.exit(1);
});
