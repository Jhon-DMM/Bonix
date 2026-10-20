import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { conectarBaseDatos } from './src/db.js';
import authRoutes from './src/routes/authRoutes.js';
import rutasPostres from './src/routes/dessertRoutes.js';
import { origenesPermitidosFrontend } from './src/middleware/adminAuth.js';
import { directorioSubidas } from './src/imageStorage.js';

const app = express();

app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || origenesPermitidosFrontend.has(origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: '4mb' }));
app.use('/uploads', express.static(directorioSubidas, { maxAge: '1y', immutable: true }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/desserts', rutasPostres);

// Manejador de errores centralizado: cualquier error que llegue por
// asyncHandler(...) termina aquí en vez de colgar la petición.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 4000;

conectarBaseDatos()
  .then(() => {
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      console.warn('Acceso administrativo deshabilitado: ejecuta npm run set-admin desde backend/.');
    }
    app.listen(PORT, () => {
      console.log(`API de Bonix escuchando en http://localhost:${PORT}`);
    });
  })
  .catch(() => {
    console.error('No se pudo conectar a MongoDB. Revisa la configuración y disponibilidad del servidor.');
    process.exit(1);
  });
