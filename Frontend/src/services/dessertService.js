/**
 * dessertService.js
 * ---------------------------------------------------------------------------
 * Capa de API del frontend. Antes hablaba directamente con un array en
 * memoria (src/backend/db.js); ahora habla por HTTP con el servidor
 * Express en /backend. Ningún componente que use este archivo tuvo que
 * cambiar — siguen llamando a las mismas funciones con la misma firma,
 * solo cambió lo que hay dentro de ellas.
 *
 * En desarrollo, el proxy configurado en vite.config.js reenvía las
 * peticiones a `/api/...` hacia el backend (ver VITE_API_URL más abajo
 * para producción, donde frontend y backend quedan en dominios distintos).
 * ---------------------------------------------------------------------------
 */
const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (networkError) {
    throw new Error(
      'No se pudo conectar con el servidor de Bonix. ¿Está corriendo el backend (npm run dev en /backend)?'
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status} al conectar con el servidor.`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function getDesserts() {
  return request('/desserts');
}

export async function getDessertById(id) {
  return request(`/desserts/${id}`);
}

/** Admin action: change a dessert's price. */
export async function updateDessertPrice(id, price) {
  return request(`/desserts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ price }),
  });
}

/** Admin action: change the image path used by the homepage and sections. */
export async function updateDessertImage(id, image) {
  return request(`/desserts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ image }),
  });
}

/** Admin action: add a brand-new dessert (shows up in the hero carousel and its own section). */
export async function addDessert(dessert) {
  return request('/desserts', {
    method: 'POST',
    body: JSON.stringify(dessert),
  });
}

/** Admin action: remove a dessert everywhere (hero + its section disappear). */
export async function removeDessert(id) {
  return request(`/desserts/${id}`, { method: 'DELETE' });
}

/** Admin action: add one ingredient to a dessert's list. */
export async function addIngredient(dessertId, ingredientName) {
  return request(`/desserts/${dessertId}/ingredients`, {
    method: 'POST',
    body: JSON.stringify({ name: ingredientName }),
  });
}

/** Admin action: remove one ingredient from a dessert's list. */
export async function removeIngredient(dessertId, ingredientId) {
  return request(`/desserts/${dessertId}/ingredients/${ingredientId}`, {
    method: 'DELETE',
  });
}
