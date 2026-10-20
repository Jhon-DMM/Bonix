import { Router } from 'express';
import * as controladorAutenticacion from '../controllers/authController.js';
import { gestionarAsincrono } from '../middleware/asyncHandler.js';
import { exigirAdministrador, exigirOrigenConfiable } from '../middleware/adminAuth.js';

const router = Router();

router.post('/login', exigirOrigenConfiable, gestionarAsincrono(controladorAutenticacion.iniciarSesion));
router.get('/session', exigirAdministrador, controladorAutenticacion.obtenerSesion);
router.post('/logout', exigirOrigenConfiable, gestionarAsincrono(controladorAutenticacion.cerrarSesion));

export default router;
