import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import AdminSession from '../models/AdminSession.js';
import {
  ADMIN_SESSION_TTL_MS,
  clearAdminSessionCookie,
  versionActualAutenticacion,
  hashSessionToken,
  setAdminSessionCookie,
} from '../middleware/adminAuth.js';

const attemptsByClient = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

function compararCadenasSeguras(candidate, expected) {
  const candidateHash = createHash('sha256').update(candidate).digest();
  const expectedHash = createHash('sha256').update(expected).digest();
  return timingSafeEqual(candidateHash, expectedHash);
}

function loginAttemptKey(req) {
  return req.ip || 'unknown';
}

function obtenerRegistroIntento(key) {
  const now = Date.now();
  for (const [storedKey, record] of attemptsByClient) {
    if (record.resetAt <= now) attemptsByClient.delete(storedKey);
  }
  while (attemptsByClient.size >= 5000 && !attemptsByClient.has(key)) {
    attemptsByClient.delete(attemptsByClient.keys().next().value);
  }
  return attemptsByClient.get(key);
}

export async function iniciarSesion(req, res) {
  const configuredUsername = process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredUsername || !configuredPassword) {
    return res.status(503).json({ error: 'El acceso administrativo aún no está configurado en el servidor.' });
  }

  const username = typeof req.body?.username === 'string' ? req.body.username : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const key = loginAttemptKey(req);
  const attempt = obtenerRegistroIntento(key);
  if (attempt?.blockedUntil > Date.now()) {
    return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos y vuelve a intentarlo.' });
  }

  const validCredentials = compararCadenasSeguras(username, configuredUsername)
    && compararCadenasSeguras(password, configuredPassword);
  if (!validCredentials) {
    const failures = (attempt?.failures || 0) + 1;
    attemptsByClient.set(key, {
      failures,
      resetAt: Date.now() + ATTEMPT_WINDOW_MS,
      blockedUntil: failures >= MAX_FAILED_ATTEMPTS ? Date.now() + ATTEMPT_WINDOW_MS : 0,
    });
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }

  attemptsByClient.delete(key);
  const token = randomBytes(32).toString('base64url');
  await AdminSession.create({
    tokenHash: hashSessionToken(token),
    authVersion: versionActualAutenticacion(),
    expiresAt: new Date(Date.now() + ADMIN_SESSION_TTL_MS),
  });
  setAdminSessionCookie(res, token);
  res.json({ authenticated: true });
}

export function obtenerSesion(req, res) {
  res.json({ authenticated: true });
}

export async function cerrarSesion(req, res) {
  const cookieHeader = req.headers.cookie || '';
  const prefix = 'bonix_admin_session=';
  const cookie = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
  if (cookie) {
    await AdminSession.deleteOne({ tokenHash: hashSessionToken(cookie.slice(prefix.length)) });
  }
  clearAdminSessionCookie(res);
  res.json({ authenticated: false });
}
