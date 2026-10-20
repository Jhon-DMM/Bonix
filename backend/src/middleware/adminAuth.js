import { createHash } from 'node:crypto';
import AdminSession from '../models/AdminSession.js';
import { gestionarAsincrono } from './asyncHandler.js';

export const ADMIN_COOKIE_NAME = 'bonix_admin_session';
export const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export const origenesPermitidosFrontend = new Set(
  (process.env.FRONTEND_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

export function exigirOrigenConfiable(req, res, next) {
  const origin = req.get('origin');
  if (!origin || !origenesPermitidosFrontend.has(origin)) {
    return res.status(403).json({ error: 'Origen no autorizado.' });
  }
  next();
}

function readCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';
  const prefix = `${name}=`;
  const cookie = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return cookie ? cookie.slice(prefix.length) : '';
}

export function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function versionActualAutenticacion() {
  const username = process.env.ADMIN_USERNAME || '';
  const password = process.env.ADMIN_PASSWORD || '';
  return createHash('sha256').update(`${username}\u0000${password}`).digest('hex');
}

export function setAdminSessionCookie(res, token) {
  const configuredSameSite = (process.env.ADMIN_COOKIE_SAME_SITE || 'lax').toLowerCase();
  const sameSite = ['lax', 'strict', 'none'].includes(configuredSameSite) ? configuredSameSite : 'lax';
  const secure = process.env.NODE_ENV === 'production' || sameSite === 'none';
  const cookie = [
    `${ADMIN_COOKIE_NAME}=${token}`,
    'Path=/api',
    'HttpOnly',
    `SameSite=${sameSite}`,
    `Max-Age=${Math.floor(ADMIN_SESSION_TTL_MS / 1000)}`,
  ];
  if (secure) cookie.push('Secure');
  res.setHeader('Set-Cookie', cookie.join('; '));
}

export function clearAdminSessionCookie(res) {
  const configuredSameSite = (process.env.ADMIN_COOKIE_SAME_SITE || 'lax').toLowerCase();
  const sameSite = ['lax', 'strict', 'none'].includes(configuredSameSite) ? configuredSameSite : 'lax';
  const secure = process.env.NODE_ENV === 'production' || sameSite === 'none';
  const cookie = [`${ADMIN_COOKIE_NAME}=`, 'Path=/api', 'HttpOnly', `SameSite=${sameSite}`, 'Max-Age=0'];
  if (secure) cookie.push('Secure');
  res.setHeader('Set-Cookie', cookie.join('; '));
}

export const exigirAdministrador = gestionarAsincrono(async (req, res, next) => {
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'El acceso administrativo no está configurado.' });
  }
  const token = readCookie(req, ADMIN_COOKIE_NAME);
  if (!token) return res.status(401).json({ error: 'Inicia sesión para continuar.' });

  const obtenerSesion = await AdminSession.findOne({
    tokenHash: hashSessionToken(token),
    authVersion: versionActualAutenticacion(),
    expiresAt: { $gt: new Date() },
  });
  if (!obtenerSesion) return res.status(401).json({ error: 'La sesión venció. Inicia sesión nuevamente.' });

  req.adminSessionId = obtenerSesion._id;
  next();
});
