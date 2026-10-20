# Bonix — Backend

## Imágenes del catálogo

Las imágenes que se suben desde el panel se convierten a WebP y se guardan como
archivos en `backend/uploads/desserts/`. MongoDB conserva únicamente la ruta
pública del archivo. Los archivos de esa carpeta no se suben a Git.

Si el catálogo ya contiene imágenes guardadas como base64, ejecuta una vez
`npm run migrate-images` desde esta carpeta para pasarlas a archivos y actualizar
sus rutas en MongoDB. Conserva una copia de seguridad de la base de datos antes
de migrar. El servidor necesita permiso de escritura en `uploads/`.

En producción, el disco donde se guardan las imágenes debe ser persistente y
compartido por las instancias que sirven la API. Si el proveedor borra archivos
al redeplegar o usa varias instancias sin disco compartido, configura después un
almacenamiento de objetos como S3 o Cloudinary en lugar del almacenamiento local.

## Rutas disponibles

| Método | Ruta                                   | Qué hace                                  |
|--------|-----------------------------------------|--------------------------------------------|
| POST   | `/api/auth/login`                       | Inicia sesión del administrador            |
| GET    | `/api/auth/session`                     | Comprueba si la sesión sigue activa        |
| POST   | `/api/auth/logout`                      | Cierra la sesión actual                    |
| GET    | `/api/desserts`                         | Lista todos los postres                    |
| GET    | `/api/desserts/:id`                     | Un postre por su `id` (slug)               |
| POST   | `/api/desserts`                         | Crea un postre nuevo                       |
| PATCH  | `/api/desserts/:id`                     | Actualiza campos (precio, nombre, etc.)    |
| PATCH  | `/api/desserts/prices`                  | Actualiza varios precios en una transacción |
| PUT    | `/api/desserts/:id/image`               | Sube una imagen WebP del postre             |
| DELETE | `/api/desserts/:id`                     | Elimina un postre                          |
| POST   | `/api/desserts/:id/ingredients`         | Agrega un ingrediente (`{ "name": "..." }`)|
| DELETE | `/api/desserts/:id/ingredients/:ingId`  | Quita un ingrediente                       |

Las rutas `GET` del catálogo son públicas. Las rutas que crean, cambian o
eliminan postres e ingredientes requieren una sesión de administrador.

Las validaciones de API tienen pruebas automatizadas. Ejecuta `npm test` para
correrlas o `npm run check` para revisar sintaxis y correr todas las pruebas.

## Acceso al panel

Configura `ADMIN_USERNAME` y `ADMIN_PASSWORD` en `backend/.env` antes de
iniciar sesión en `/#admin`. Usa una contraseña larga y única. Estas
credenciales se quedan en el servidor y no deben escribirse en variables
`VITE_*` ni subirse a Git. Si no están configuradas, el acceso administrativo
queda deshabilitado.

La sesión se guarda en MongoDB y vence después de ocho horas. Para desarrollo,
`FRONTEND_ORIGINS` usa `http://localhost:5173`. En producción, cámbialo por el
origen exacto del sitio. Si el frontend y la API están en sitios distintos,
configura `ADMIN_COOKIE_SAME_SITE=none` y sirve ambos por HTTPS; siempre que
sea posible, publica la API bajo el mismo sitio que el frontend.

## Estructura

```
backend/
  server.js                      # arranca Express y la conexión a Mongo
  src/
    db.js                         # conexión a MongoDB
    models/Dessert.js              # esquema Mongoose
    controllers/dessertController.js  # lógica de cada endpoint
    routes/dessertRoutes.js           # mapea rutas → controller
    middleware/asyncHandler.js        # evita que un error async cuelgue la petición
    seed.js                            # carga los postres iniciales
```
