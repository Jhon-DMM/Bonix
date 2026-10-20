import { formatearCOP } from './format.js';

export const NUMERO_WHATSAPP = '573185183126';

/**
 * Construye el link de WhatsApp con el pedido ya escrito, para que la
 * persona solo tenga que abrir el chat y presionar "enviar".
 */
export function crearEnlacePedidoWhatsApp(cartItems) {
  const lines = cartItems.map(
    (elemento) => `- ${elemento.name} x${elemento.quantity} (${formatearCOP(elemento.price * elemento.quantity)})`
  );
  const total = cartItems.reduce((sum, elemento) => sum + elemento.price * elemento.quantity, 0);

  const message = [
    '¡Hola Bonix! Quiero hacer el siguiente pedido:',
    '',
    ...lines,
    '',
    `Total: ${formatearCOP(total)}`,
  ].join('\n');

  return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function crearEnlaceGeneralWhatsApp() {
  const message = '¡Hola Bonix! Quiero más información sobre sus postres.';
  return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
