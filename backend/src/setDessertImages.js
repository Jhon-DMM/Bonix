import 'dotenv/config';
import mongoose from 'mongoose';
import { conectarBaseDatos } from './db.js';
import Postre from './models/Dessert.js';

const defaultImages = {
  mora: '/images/Mora-imagen.png',
  maracuya: '/images/Maracuya-img.png',
  milo: '/images/Milo-img.png',
};

async function run() {
  await conectarBaseDatos();
  let updated = 0;

  for (const [id, image] of Object.entries(defaultImages)) {
    const result = await Postre.updateOne(
      { id, $or: [{ image: { $exists: false } }, { image: '' }] },
      { $set: { image } }
    );
    updated += result.modifiedCount;
  }

  console.log(`Listo: se asignaron imágenes a ${updated} postres sin foto previa.`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('No se pudieron asignar las imágenes:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
