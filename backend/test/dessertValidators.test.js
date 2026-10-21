import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateBulkPrice,
  validateCreateDessert,
  validateDessertPatch,
  validateIngredientName,
} from '../src/validators/dessertValidators.js';

const validDessert = {
  id: 'chocolate-amargo',
  name: 'Chocolate amargo',
  price: 8500,
  description: 'Chocolate y crema.',
  ingredients: [{ id: 'chocolate-1', name: 'Chocolate' }],
  colors: { from: '#112233', to: '#445566' },
};

test('acepta un postre con campos válidos', () => {
  assert.equal(validateCreateDessert(validDessert), null);
});

test('rechaza datos mal formados al crear un postre', () => {
  assert.match(validateCreateDessert({ ...validDessert, id: 'Chocolate amargo' }), /identificador/i);
  assert.match(validateCreateDessert({ ...validDessert, price: '8500' }), /precio/i);
  assert.match(validateCreateDessert({ ...validDessert, ingredients: [{ id: 'i1', name: ' ' }] }), /ingredientes/i);
  assert.match(validateCreateDessert({ ...validDessert, unexpected: true }), /campos no permitidos/i);
});

test('valida actualizaciones parciales y evita parches vacíos', () => {
  assert.equal(validateDessertPatch({ price: 0 }), null);
  assert.match(validateDessertPatch({ name: '' }), /nombre/i);
  assert.match(validateDessertPatch({ colors: { from: 'azul' } }), /colores/i);
  assert.match(validateDessertPatch({}), /al menos un campo/i);
});

test('valida listas para cambio masivo de precios', () => {
  assert.equal(validateBulkPrice({ dessertIds: ['mora', 'milo'], price: 9000 }), null);
  assert.match(validateBulkPrice({ dessertIds: ['mora', 'mora'], price: 9000 }), /inválidos o repetidos/i);
  assert.match(validateBulkPrice({ dessertIds: ['mora'], price: -1 }), /precio/i);
  assert.match(validateBulkPrice({ dessertIds: [], price: 9000 }), /selecciona/i);
});

test('limita el nombre de un ingrediente', () => {
  assert.equal(validateIngredientName({ name: 'Crema de leche' }), null);
  assert.match(validateIngredientName({ name: '   ' }), /ingrediente/i);
  assert.match(validateIngredientName({ name: 'a'.repeat(81) }), /ingrediente/i);
});
