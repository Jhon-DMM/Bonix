const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function authRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      ...options,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor de Bonix.');
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || `Error ${response.status} al iniciar sesión.`);
    error.status = response.status;
    throw error;
  }
  return body;
}

export function obtenerSesionAdministrador() {
  return authRequest('/auth/session');
}

export function iniciarSesionAdministrador(username, password) {
  return authRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function cerrarSesionAdministrador() {
  return authRequest('/auth/logout', { method: 'POST' });
}
