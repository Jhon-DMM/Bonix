import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Postre from '../src/models/Dessert.js';
import { actualizarPrecios } from '../src/controllers/dessertController.js';

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

async function withDatabaseStubs({ desserts: postres, updateMany }) {
  const originalFind = Postre.find;
  const originalUpdateMany = Postre.updateMany;
  const originalStartSession = mongoose.startSession;
  const operations = { transactionCalls: 0, updateCalls: 0, sessionEnded: false };
  Postre.find = () => ({
    select: () => ({
      session: async () => postres,
    }),
  });
  Postre.updateMany = async (...args) => {
    operations.updateCalls += 1;
    operations.updateArguments = args;
    return updateMany?.(...args);
  };
  mongoose.startSession = async () => {
    const obtenerSesion = {
      withTransaction: async (callback) => {
        operations.transactionCalls += 1;
        return callback();
      },
      endSession: async () => { operations.sessionEnded = true; },
    };
    operations.session = obtenerSesion;
    return obtenerSesion;
  };

  return {
    operations,
    restore() {
      Postre.find = originalFind;
      Postre.updateMany = originalUpdateMany;
      mongoose.startSession = originalStartSession;
    },
  };
}

test('aplica el cambio masivo dentro de una sola transacción', async () => {
  const stubs = await withDatabaseStubs({
    desserts: [{ id: 'mora' }, { id: 'milo' }],
    updateMany: async () => ({ modifiedCount: 2 }),
  });
  const response = createResponse();

  try {
    await actualizarPrecios({ body: { dessertIds: ['mora', 'milo'], price: 9500 } }, response);
    assert.equal(stubs.operations.transactionCalls, 1);
    assert.equal(stubs.operations.updateCalls, 1);
    assert.deepEqual(stubs.operations.updateArguments[0], { id: { $in: ['mora', 'milo'] } });
    assert.deepEqual(stubs.operations.updateArguments[1], { $set: { price: 9500 } });
    assert.equal(stubs.operations.updateArguments[2].session, stubs.operations.session);
    assert.deepEqual(response.body, { updatedCount: 2, price: 9500 });
    assert.equal(stubs.operations.sessionEnded, true);
  } finally {
    stubs.restore();
  }
});

test('rechaza el cambio antes de abrir transacción si falta un postre seleccionado', async () => {
  const stubs = await withDatabaseStubs({ desserts: [{ id: 'mora' }] });
  const response = createResponse();

  try {
    await actualizarPrecios({ body: { dessertIds: ['mora', 'milo'], price: 9500 } }, response);
    assert.equal(stubs.operations.transactionCalls, 1);
    assert.equal(stubs.operations.updateCalls, 0);
    assert.equal(response.statusCode, 404);
    assert.match(response.body.error, /milo/i);
  } finally {
    stubs.restore();
  }
});
