import { Router } from 'express';
import express from 'express';
import * as controladorPostres from '../controllers/dessertController.js';
import { gestionarAsincrono } from '../middleware/asyncHandler.js';
import { exigirAdministrador, exigirOrigenConfiable } from '../middleware/adminAuth.js';

const router = Router();
const parseWebpUpload = express.raw({ type: 'image/webp', limit: '8mb' });

router.get('/', gestionarAsincrono(controladorPostres.obtenerTodos));
router.get('/:id', gestionarAsincrono(controladorPostres.obtenerUno));
router.post('/', exigirOrigenConfiable, exigirAdministrador, gestionarAsincrono(controladorPostres.crear));
router.put('/:id/image', exigirOrigenConfiable, exigirAdministrador, parseWebpUpload, gestionarAsincrono(controladorPostres.subirImagen));
router.patch('/prices', exigirOrigenConfiable, exigirAdministrador, gestionarAsincrono(controladorPostres.actualizarPrecios));
router.patch('/:id', exigirOrigenConfiable, exigirAdministrador, gestionarAsincrono(controladorPostres.actualizar));
router.delete('/:id', exigirOrigenConfiable, exigirAdministrador, gestionarAsincrono(controladorPostres.eliminar));

router.post('/:id/ingredients', exigirOrigenConfiable, exigirAdministrador, gestionarAsincrono(controladorPostres.agregarIngrediente));
router.delete('/:id/ingredients/:ingredientId', exigirOrigenConfiable, exigirAdministrador, gestionarAsincrono(controladorPostres.quitarIngrediente));

export default router;
