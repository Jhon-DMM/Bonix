import mongoose from 'mongoose';
import Postre from '../models/Dessert.js';
import { eliminarImagenPostre, guardarImagenPostre } from '../imageStorage.js';
import {
  isAllowedImageReference,
  validateBulkPrice,
  validateCreateDessert,
  validateDessertPatch,
  validateIngredientName,
} from '../validators/dessertValidators.js';

export async function obtenerTodos(req, res) {
  const postres = await Postre.find().sort({ catalogOrder: 1, createdAt: 1 });
  res.json(postres);
}

export async function obtenerUno(req, res) {
  const postre = await Postre.findOne({ id: req.params.id });
  if (!postre) return res.status(404).json({ error: 'Postre no encontrado.' });
  res.json(postre);
}

export async function crear(req, res) {
  const validationError = validateCreateDessert(req.body);
  if (validationError) return res.status(400).json({ error: validationError });
  const { id, name, price, description, colors, ingredients, image } = req.body;

  if (!isAllowedImageReference(image)) {
    return res.status(400).json({ error: 'La imagen debe ser una imagen incluida en el sitio o una imagen subida al servidor.' });
  }

  const existing = await Postre.findOne({ id });
  if (existing) {
    return res.status(409).json({ error: `Ya existe un postre con el id "${id}".` });
  }

  const postre = await Postre.create({
    id,
    name: name.trim(),
    price: price ?? 0,
    description: (description ?? '').trim(),
    image: image ?? '',
    colors,
    ingredients: (ingredients ?? []).map((ingredient) => ({
      id: ingredient.id.trim(),
      name: ingredient.name.trim(),
    })),
  });

  res.status(201).json(postre);
}

export async function actualizar(req, res) {
  const validationError = validateDessertPatch(req.body);
  if (validationError) return res.status(400).json({ error: validationError });
  const { price, name, description, colors, image } = req.body;
  const patch = {};
  if (price !== undefined) patch.price = price;
  if (name !== undefined) patch.name = name.trim();
  if (description !== undefined) patch.description = description.trim();
  if (colors !== undefined) patch.colors = colors;
  if (image !== undefined) {
    if (!isAllowedImageReference(image)) {
      return res.status(400).json({ error: 'La imagen debe ser una imagen incluida en el sitio o una imagen subida al servidor.' });
    }
    patch.image = image;
  }

  const postre = await Postre.findOneAndUpdate({ id: req.params.id }, patch, { new: true });
  if (!postre) return res.status(404).json({ error: 'Postre no encontrado.' });
  res.json(postre);
}

export async function actualizarPrecios(req, res) {
  const validationError = validateBulkPrice(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const { dessertIds, price } = req.body;
  const obtenerSesion = await mongoose.startSession();
  try {
    await obtenerSesion.withTransaction(async () => {
      const matchingDesserts = await Postre.find({ id: { $in: dessertIds } }).select('id').session(obtenerSesion);
      if (matchingDesserts.length !== dessertIds.length) {
        const missingIds = dessertIds.filter((id) => !matchingDesserts.some((postre) => postre.id === id));
        const error = new Error(`No se encontraron todos los postres seleccionados: ${missingIds.join(', ')}.`);
        error.status = 404;
        throw error;
      }
      await Postre.updateMany({ id: { $in: dessertIds } }, { $set: { price } }, { session: obtenerSesion, runValidators: true });
    });
    res.json({ updatedCount: dessertIds.length, price });
  } catch (error) {
    if (error.code === 20 || /Transaction numbers are only allowed/i.test(error.message || '')) {
      return res.status(503).json({ error: 'El cambio atómico de precios requiere que MongoDB use un replica set.' });
    }
    if (error.status) return res.status(error.status).json({ error: error.message });
    throw error;
  } finally {
    await obtenerSesion.endSession();
  }
}

export async function eliminar(req, res) {
  const postre = await Postre.findOneAndDelete({ id: req.params.id });
  if (!postre) return res.status(404).json({ error: 'Postre no encontrado.' });
  await eliminarImagenPostre(postre.image);
  res.json({ success: true });
}

export async function subirImagen(req, res) {
  const image = req.body;
  if (!Buffer.isBuffer(image) || image.length === 0) {
    return res.status(400).json({ error: 'Selecciona una imagen WebP válida.' });
  }
  if (image.length < 12 || image.toString('ascii', 0, 4) !== 'RIFF' || image.toString('ascii', 8, 12) !== 'WEBP') {
    return res.status(400).json({ error: 'El archivo recibido no es una imagen WebP válida.' });
  }

  const postre = await Postre.findOne({ id: req.params.id });
  if (!postre) return res.status(404).json({ error: 'Postre no encontrado.' });

  const previousImage = postre.image;
  const imagePath = await guardarImagenPostre(image);
  try {
    postre.image = imagePath;
    await postre.save();
  } catch (error) {
    await eliminarImagenPostre(imagePath).catch(() => {});
    throw error;
  }

  await eliminarImagenPostre(previousImage).catch(() => {});
  res.json(postre);
}

export async function agregarIngrediente(req, res) {
  const validationError = validateIngredientName(req.body);
  if (validationError) return res.status(400).json({ error: validationError });
  const { name } = req.body;

  const ingredient = { id: `${req.params.id}-${Date.now()}`, name: name.trim() };

  const postre = await Postre.findOneAndUpdate(
    { id: req.params.id },
    { $push: { ingredients: ingredient } },
    { new: true }
  );
  if (!postre) return res.status(404).json({ error: 'Postre no encontrado.' });
  res.status(201).json(postre);
}

export async function quitarIngrediente(req, res) {
  const postre = await Postre.findOneAndUpdate(
    { id: req.params.id },
    { $pull: { ingredients: { id: req.params.ingredientId } } },
    { new: true }
  );
  if (!postre) return res.status(404).json({ error: 'Postre no encontrado.' });
  res.json(postre);
}
