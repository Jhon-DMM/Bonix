Bonix
Bonix es una página web para presentar el catálogo de postres de la marca y facilitar los pedidos. La página principal muestra los postres en un carrusel visual y en secciones individuales: cada persona puede explorar las imágenes, consultar la descripción, los ingredientes y el precio, y agregar productos a una canasta para preparar su pedido por WhatsApp.

El sitio también incluye un panel privado para que el administrador gestione el catálogo: puede modificar precios e ingredientes, cambiar o subir imágenes, agregar postres y eliminar los que ya no se ofrecen. Los cambios se guardan en la base de datos.

Cómo está construido
Frontend: React y Vite. Presenta el catálogo, las animaciones, la canasta y la interfaz de administración.
Backend: Node.js y Express. Expone la API del catálogo, valida los cambios y protege las acciones administrativas con inicio de sesión.
Base de datos: MongoDB almacena los postres, sus precios, descripciones e ingredientes.
Imágenes: se guardan como archivos WebP; MongoDB conserva sus rutas.
Requisitos
Node.js y npm.
Una instancia de MongoDB. MongoDB Atlas funciona para desarrollo y producción.
MongoDB en modo replica set para que los cambios masivos de precios se apliquen como una sola operación.