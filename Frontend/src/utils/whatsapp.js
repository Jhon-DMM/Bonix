import { formatCOP } from './format.js';

// TODO: reemplazar por el número real de Bonix (formato: código de país +
// número, sin espacios ni símbolos, ej. "573001234567").
export const WHATSAPP_NUMBER = '573000000000';

/**
 * Construye el link de WhatsApp con el pedido ya escrito, para que la
 * persona solo tenga que abrir el chat y presionar "enviar".
 */
export function buildOrderWhatsAppLink(cartItems) {
  const lines = cartItems.map(
    (item) => `- ${item.name} x${item.quantity} (${formatCOP(item.price * item.quantity)})`
  );
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const message = [
    '¡Hola Bonix! Quiero hacer el siguiente pedido:',
    '',
    ...lines,
    '',
    `Total: ${formatCOP(total)}`,
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralWhatsAppLink() {
  const message = '¡Hola Bonix! Quiero más información sobre sus postres.';
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
