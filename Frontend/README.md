# Bonix — Frontend

Sitio de Bonix en React, con header + canasta de compras, un hero tipo
carrusel (un postre a la vez) y una sección por postre con imagen e
ingredientes alternados. Paleta celeste sobre blanco, inspirada en el
sistema de diseño de Apple (fondos blancos, botones tipo píldora,
tarjetas de 28px, sin sombras).

Este frontend **no tiene datos propios**: todo lo pide por HTTP al
backend en `../backend`. Sin el backend corriendo, la página se queda
cargando o muestra un mensaje de error — no hay postres que mostrar.

## ⚠️ Por qué sale en blanco si abres `index.html` directamente

Este proyecto usa Vite + módulos de JavaScript (`import`/`export`).
Los navegadores bloquean ese tipo de módulos cuando el archivo se abre
como `file://` (doble clic), así que **nunca va a funcionar así,
aunque todo el código esté bien**. Siempre tienes que levantar el
servidor de desarrollo y entrar por la URL que te da:

```bash
npm install
npm run dev       # abre la URL que muestra en la terminal, normalmente http://localhost:5173
```

Y para que la página tenga postres que mostrar, el backend también
debe estar corriendo al mismo tiempo (ver `../backend/README.md`).

## Cómo correrlo

```bash
npm install
npm run dev       # desarrollo, http://localhost:5173 (requiere el backend corriendo)
npm run build     # genera /dist listo para publicar
```

En desarrollo, las peticiones a `/api/...` se reenvían automáticamente
al backend gracias al proxy configurado en `vite.config.js`. En
producción, si frontend y backend quedan en dominios distintos, define
la variable de entorno `VITE_API_URL` (por ejemplo en un archivo
`.env`) apuntando a la URL pública de la API, p. ej.:

```
VITE_API_URL=https://api.bonix.com/api
```

## Estructura

```
src/
  services/
    dessertService.js    # cliente HTTP: habla con la API del backend (antes era un import directo a un array)
  context/
    CartContext.jsx      # estado global de la canasta
  components/
    Header.jsx            # logo + atajos de sección + icono de canasta
    CartDrawer.jsx         # panel de la canasta y botón "Ordenar por WhatsApp"
    Hero.jsx                # carrusel de postres (uno a la vez)
    DessertIllustration.jsx # arte placeholder de cada postre
    QuantityModal.jsx       # ventana para elegir cantidad al agregar
    DessertSection.jsx      # sección imagen + ingredientes, alternada
    Footer.jsx               # footer básico
    AdminPanel.jsx            # panel de administración (ver abajo)
  utils/
    whatsapp.js           # arma el link de WhatsApp con el pedido
    format.js               # formato de moneda COP
```

## Panel de administración

Entra a **`/#admin`** (por ejemplo `http://localhost:5173/#admin`) para:

- Cambiar el precio de cada postre.
- Agregar o quitar ingredientes de cada postre.
- Agregar un postre nuevo (aparece automáticamente en el hero y gana su
  propia sección) o eliminar uno existente.

Cada acción llama a la API real del backend — los cambios quedan
guardados en la base de datos, no solo en esta pestaña.

No está enlazado desde el menú principal a propósito — es la vista del
operador, no de los clientes. Más adelante se puede proteger con login.

## Cosas que debes personalizar

- **Número de WhatsApp:** está en `src/utils/whatsapp.js`
  (`WHATSAPP_NUMBER`) como marcador de posición. Cámbialo por el número
  real de Bonix, en formato `57XXXXXXXXXX`.
- **Imágenes reales:** cada postre tiene espacio para un campo `image`
  en el modelo del backend; hoy se usa una ilustración genérica
  (`DessertIllustration.jsx`) mientras no haya fotos.
