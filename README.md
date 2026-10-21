# Bonix

Bonix es una página web para presentar el catálogo de postres artesanales de
Mora, Maracuyá y Milo, y facilitar los pedidos. La página principal muestra
los postres en un carrusel visual y en secciones individuales: cada persona
puede explorar las imágenes,
consultar la descripción, los ingredientes y el precio, y agregar productos a
una canasta para preparar su pedido por WhatsApp.

El sitio también incluye un panel privado para que el administrador gestione el
catálogo: puede modificar precios e ingredientes, cambiar o subir imágenes,
agregar postres y eliminar los que ya no se ofrecen. Los cambios se guardan en
la base de datos.

## Cómo está construido

- **Frontend:** React y Vite. Presenta el catálogo, las animaciones, la canasta
  y la interfaz de administración.
- **Backend:** Node.js y Express. Expone la API del catálogo, valida los
  cambios y protege las acciones administrativas con inicio de sesión.
- **Base de datos:** MongoDB almacena los postres, sus precios, descripciones e
  ingredientes.
- **Imágenes:** las fotos del catálogo viven en `Frontend/public/images`;
  las imágenes subidas desde el panel se guardan como archivos WebP y MongoDB
  conserva sus rutas.

## Requisitos

- Node.js y npm.
- Una instancia de MongoDB. MongoDB Atlas funciona para desarrollo y
  producción.
- MongoDB en modo replica set para que los cambios masivos de precios se
  apliquen como una sola operación. Atlas ya usa replica sets.

## Ejecutar en desarrollo

Inicia MongoDB y abre dos terminales desde la carpeta del proyecto.

En la primera terminal, configura y ejecuta el backend:

```bash
cd backend
npm install
npm run set-admin
npm run seed
npm run dev
```

`npm run set-admin` configura las credenciales del único administrador.
`npm run seed` sincroniza los postres iniciales, los ordena como Mora,
Maracuyá y Milo, y conserva los cambios del panel en esos postres. También
retira del catálogo los registros anteriores de Oreo y Fresas. Si necesitas
conservar esos registros, respáldalos antes de ejecutar la sincronización.

En la segunda terminal, inicia el frontend:

```bash
cd Frontend
npm install
npm run dev
```

Abre la dirección local que indique Vite, normalmente
`http://localhost:5173`. El panel administrativo está disponible en `/#admin`
y requiere iniciar sesión.

## Verificaciones

Desde `backend/`, ejecuta `npm run check` para revisar el backend y sus pruebas.
Desde `Frontend/`, ejecuta `npm run check` para ejecutar ESLint, las pruebas del
frontend y la compilación de producción.

## Imágenes existentes y despliegue

Si la base de datos todavía tiene imágenes antiguas guardadas como base64,
haz una copia de seguridad antes de ejecutar `npm run migrate-images` desde
`backend/`. Las imágenes nuevas se guardan en `backend/uploads/`; en producción,
el almacenamiento debe conservar esos archivos entre despliegues y estar
disponible para las instancias del backend.

Consulta la [guía del frontend](Frontend/README.md) y la
[guía del backend](backend/README.md) para más información sobre sus
configuraciones y funciones.
