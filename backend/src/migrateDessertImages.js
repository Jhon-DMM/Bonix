import 'dotenv/config';
import mongoose from 'mongoose';
import Postre from './models/Dessert.js';
import { conectarBaseDatos } from './db.js';
import { eliminarImagenPostre, guardarImagenPostre } from './imageStorage.js';

const legacyImagePattern = /^data:image\/webp;base64,([A-Za-z0-9+/]+={0,2})$/;

async function migrar() {
  let migrados = 0;

  try {
    await conectarBaseDatos();
    const cursor = Postre.find({ image: /^data:image\/webp;base64,/ }).cursor();

    for await (const postre of cursor) {
      const match = legacyImagePattern.exec(postre.image);
      if (!match) continue;
      const contents = Buffer.from(match[1], 'base64');
      if (contents.length < 12 || contents.toString('ascii', 0, 4) !== 'RIFF' || contents.toString('ascii', 8, 12) !== 'WEBP') {
        continue;
      }

      const previousImage = postre.image;
      const imagePath = await guardarImagenPostre(contents);
      const result = await Postre.updateOne(
        { _id: postre._id, image: previousImage },
        { $set: { image: imagePath } }
      );
      if (result.modifiedCount) migrados += 1;
      else {
        await eliminarImagenPostre(imagePath);
      }
    }

    const currentUploads = await Postre.countDocuments({ image: /^\/uploads\/desserts\// });
    console.log(`Migración completada: ${migrados} imágenes guardadas como archivos; ${currentUploads} postres usan URL de archivo.`);
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

migrar().catch(() => {
  console.error('No se pudieron migrar las imágenes. Revisa la conexión y la configuración de MongoDB.');
  process.exit(1);
});
