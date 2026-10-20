import test from 'node:test';
import assert from 'node:assert/strict';
import { agregarElementoCanasta, obtenerTotalesCanasta, fijarCantidadElementoCanasta } from '../utils/cart.js';

test('agrega un postre y acumula su cantidad si ya existe', () => {
  const postre = { id: 'oreo', name: 'Oreo', price: 7000 };
  const once = agregarElementoCanasta([], postre, 2);
  assert.deepEqual(once, [{ ...postre, quantity: 2 }]);
  assert.deepEqual(agregarElementoCanasta(once, postre, 3), [{ ...postre, quantity: 5 }]);
});

test('actualiza cantidades y elimina el postre al llegar a cero', () => {
  const elementos = [{ id: 'oreo', name: 'Oreo', price: 7000, quantity: 2 }];
  assert.equal(fijarCantidadElementoCanasta(elementos, 'oreo', 4)[0].quantity, 4);
  assert.deepEqual(fijarCantidadElementoCanasta(elementos, 'oreo', 0), []);
});

test('calcula el total de unidades y de dinero', () => {
  const elementos = [
    { id: 'oreo', price: 7000, quantity: 2 },
    { id: 'milo', price: 8000, quantity: 1 },
  ];
  assert.deepEqual(obtenerTotalesCanasta(elementos), { count: 3, price: 22000 });
});
