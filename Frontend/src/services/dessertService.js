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

export function resolverImagenPostre(image) {
  if (typeof image !== 'string' || !image.startsWith('/uploads/')) return image;
  const apiUrl = new URL(API_BASE, window.location.origin);
  return new URL(image, apiUrl.origin).toString();
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      ...options,
    });
  } catch (networkError) {
    throw new Error(
      'No se pudo conectar con el servidor de Bonix. ¿Está corriendo el backend (npm run dev en /backend)?',
      { cause: networkError }
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status} al conectar con el servidor.`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function obtenerPostres() {
  return request('/desserts');
}

export async function obtenerPostrePorId(id) {
  return request(`/desserts/${id}`);
}

/** Admin action: change a dessert's price. */
export async function actualizarPrecioPostre(id, price) {
  return request(`/desserts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ price }),
  });
}

/** Admin action: update multiple dessert prices in one atomic API operation. */
export async function actualizarPreciosPostres(dessertIds, price) {
  return request('/desserts/prices', {
    method: 'PATCH',
    body: JSON.stringify({ dessertIds, price }),
  });
}

/** Admin action: change the image path used by the homepage and sections. */
export async function actualizarImagenPostre(id, image) {
  return request(`/desserts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ image }),
  });
}

/** Admin action: upload an optimized WebP image to the backend file store. */
export async function subirImagenPostre(id, imageBlob) {
  return request(`/desserts/${id}/image`, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/webp' },
    body: imageBlob,
  });
}

/** Admin action: add a brand-new dessert (shows up in the hero carousel and its own section). */
export async function agregarPostre(postre) {
  return request('/desserts', {
    method: 'POST',
    body: JSON.stringify(postre),
  });
}

/** Admin action: remove a dessert everywhere (hero + its section disappear). */
export async function eliminarPostre(id) {
  return request(`/desserts/${id}`, { method: 'DELETE' });
}

/** Admin action: add one ingredient to a dessert's list. */
export async function agregarIngrediente(dessertId, ingredientName) {
  return request(`/desserts/${dessertId}/ingredients`, {
    method: 'POST',
    body: JSON.stringify({ name: ingredientName }),
  });
}

/** Admin action: remove one ingredient from a dessert's list. */
export async function quitarIngrediente(dessertId, ingredientId) {
  return request(`/desserts/${dessertId}/ingredients/${ingredientId}`, {
    method: 'DELETE',
  });
}
