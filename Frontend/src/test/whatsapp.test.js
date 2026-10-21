import test from 'node:test';
import assert from 'node:assert/strict';
import { crearEnlacePedidoWhatsApp } from '../utils/whatsapp.js';

test('arma el enlace de WhatsApp con productos, cantidades y total', () => {
  const link = new URL(crearEnlacePedidoWhatsApp([
    { id: 'mora', name: 'Mora', price: 7000, quantity: 2 },
    { id: 'milo', name: 'Milo', price: 8000, quantity: 1 },
  ]));
  const message = link.searchParams.get('text');

  assert.equal(link.hostname, 'wa.me');
  assert.match(message, /Mora x2/);
  assert.match(message, /Milo x1/);
  assert.match(message, /Total:/);
  assert.match(message, /22\.000/);
});
