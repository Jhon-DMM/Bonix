const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const imagePattern = /^\/images\/[A-Za-z0-9._-]+\.(png|jpe?g|webp)$/i;
const uploadedImagePattern = /^\/uploads\/desserts\/[\da-f-]{36}\.webp$/i;
const colorKeys = new Set(['from', 'to', 'accent', 'text']);
const colorPattern = /^#[\da-f]{6}$/i;
const editableFields = new Set(['price', 'name', 'description', 'colors', 'image']);
const createFields = new Set(['id', 'name', 'price', 'description', 'colors', 'ingredients', 'image']);

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isValidId = (value) => typeof value === 'string' && value.length <= 64 && idPattern.test(value);
const isValidName = (value) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 80;
const isValidPrice = (value) => Number.isSafeInteger(value) && value >= 0 && value <= 1_000_000_000;
const isValidDescription = (value) => typeof value === 'string' && value.length <= 280;
const isValidColors = (value) => isRecord(value)
  && Object.entries(value).every(([key, color]) => colorKeys.has(key) && typeof color === 'string' && colorPattern.test(color));
const isValidIngredients = (value) => Array.isArray(value)
  && value.length <= 40
  && value.every((ingredient) => isRecord(ingredient)
    && typeof ingredient.id === 'string'
    && ingredient.id.length > 0
    && ingredient.id.length <= 100
    && typeof ingredient.name === 'string'
    && ingredient.name.trim().length > 0
    && ingredient.name.trim().length <= 80)
  && new Set(value.map((ingredient) => ingredient.id)).size === value.length;

export function validateCreateDessert(body) {
  if (!isRecord(body)) return 'Envía los datos del postre en un objeto.';
  if (Object.keys(body).some((key) => !createFields.has(key))) return 'La solicitud contiene campos no permitidos.';
  if (!isValidId(body.id)) return 'El identificador debe usar letras minúsculas, números y guiones (máximo 64 caracteres).';
  if (!isValidName(body.name)) return 'El nombre debe tener entre 1 y 80 caracteres.';
  if (body.price !== undefined && !isValidPrice(body.price)) return 'El precio debe ser un número entero entre 0 y 1.000.000.000.';
  if (body.description !== undefined && !isValidDescription(body.description)) return 'La descripción no puede superar 280 caracteres.';
  if (body.colors !== undefined && !isValidColors(body.colors)) return 'Los colores deben ser códigos hexadecimales válidos.';
  if (body.ingredients !== undefined && !isValidIngredients(body.ingredients)) return 'La lista de ingredientes no es válida.';
  if (body.image !== undefined && body.image !== '' && typeof body.image !== 'string') return 'La referencia de imagen no es válida.';
  return null;
}

export function validateDessertPatch(body) {
  if (!isRecord(body)) return 'Envía los cambios en un objeto.';
  const keys = Object.keys(body);
  if (keys.length === 0) return 'Indica al menos un campo para actualizar.';
  if (keys.some((key) => !editableFields.has(key))) return 'La solicitud contiene campos no permitidos.';
  if (body.price !== undefined && !isValidPrice(body.price)) return 'El precio debe ser un número entero entre 0 y 1.000.000.000.';
  if (body.name !== undefined && !isValidName(body.name)) return 'El nombre debe tener entre 1 y 80 caracteres.';
  if (body.description !== undefined && !isValidDescription(body.description)) return 'La descripción no puede superar 280 caracteres.';
  if (body.colors !== undefined && !isValidColors(body.colors)) return 'Los colores deben ser códigos hexadecimales válidos.';
  if (body.image !== undefined && typeof body.image !== 'string') return 'La referencia de imagen no es válida.';
  return null;
}

export function validateBulkPrice(body) {
  if (!isRecord(body)) return 'Envía los datos del cambio masivo en un objeto.';
  if (!isValidPrice(body.price)) return 'El precio debe ser un número entero entre 0 y 1.000.000.000.';
  if (!Array.isArray(body.dessertIds) || body.dessertIds.length === 0 || body.dessertIds.length > 100) {
    return 'Selecciona entre 1 y 100 postres para actualizar.';
  }
  if (!body.dessertIds.every(isValidId) || new Set(body.dessertIds).size !== body.dessertIds.length) {
    return 'La lista de postres contiene identificadores inválidos o repetidos.';
  }
  return null;
}

export function validateIngredientName(body) {
  if (!isRecord(body) || typeof body.name !== 'string' || body.name.trim().length === 0 || body.name.trim().length > 80) {
    return 'El ingrediente debe tener entre 1 y 80 caracteres.';
  }
  return null;
}

export function isAllowedImageReference(image) {
  return typeof image === 'string' && (image === '' || imagePattern.test(image) || uploadedImagePattern.test(image));
}
