# Bonix

Sitio de catálogo y pedidos de Bonix. El proyecto tiene un frontend React/Vite
y una API Express conectada a MongoDB.

## Requisitos

- Node.js y npm.
- MongoDB disponible; Atlas funciona para desarrollo y producción.
- MongoDB en replica set para aplicar los cambios masivos de precios de forma
  atómica. MongoDB Atlas ya usa replica sets; una instalación local standalone
  debe configurarse como replica set para habilitar esa función.

## Inicio local

Abre dos terminales desde la carpeta del proyecto.

En la primera, prepara y ejecuta la API:

```bash
cd backend
npm install
npm run set-admin
npm run seed
npm run dev
```

En la segunda, levanta el sitio:

```bash
cd Frontend
npm install
npm run dev
```

Vite muestra la dirección local, normalmente `http://localhost:5173`. El panel
de administración está en `/#admin`.

## Comprobaciones

Ejecuta `npm run check` desde `backend/` para revisar sintaxis y correr las
pruebas de validación de la API. En `Frontend/`, `npm run lint` ejecuta ESLint;
`npm run check` ejecuta lint, las pruebas de canasta y armado del pedido, y el
build de producción.

## Datos e imágenes

`npm run seed` solo agrega los postres iniciales que falten; no reemplaza
cambios existentes. Si ya hay fotos base64 en MongoDB, haz primero un respaldo
y luego ejecuta `npm run migrate-images` desde `backend/`. Las nuevas imágenes
se guardan en `backend/uploads/`, por lo que el hosting debe conservar esa
carpeta entre despliegues o conectarse a un almacenamiento de archivos externo.

Consulta [la guía del frontend](Frontend/README.md) y
[la guía del backend](backend/README.md) para más detalles.
