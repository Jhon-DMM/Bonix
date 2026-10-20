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
- Cambiar las imágenes incluidas o subir una imagen desde el dispositivo.
- Agregar un postre nuevo (aparece automáticamente en el hero y gana su
  propia sección) o eliminar uno existente.

Cada acción llama a la API real del backend — los cambios quedan
guardados en la base de datos, no solo en esta pestaña.

No está enlazado desde el menú principal a propósito — es la vista del
operador, no de los clientes. Al abrir `/#admin` se solicita el usuario y la
contraseña configurados en el backend. Las acciones de escritura también
quedan protegidas por sesión en la API. Consulta `../backend/README.md` para
crear o cambiar las credenciales.

Las fotos elegidas en el dispositivo se optimizan a WebP y se envían como
archivo a la API; consulta `../backend/README.md` para la migración de fotos
anteriores y el requisito de almacenamiento persistente en producción.

## Cosas que debes personalizar

- **Número de WhatsApp:** está en `src/utils/whatsapp.js`
  (`WHATSAPP_NUMBER`) como marcador de posición. Cámbialo por el número
  real de Bonix, en formato `57XXXXXXXXXX`.

