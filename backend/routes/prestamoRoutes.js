import express from 'express';
// Solo una línea de importación con todas las funciones
import { solicitarPrestamo, listarPrestamos, registrarDevolucion, aprobarPrestamo } from '../controllers/prestamoController.js';
import { verificarToken, verificarAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verificarToken, solicitarPrestamo);
router.get('/', verificarToken, listarPrestamos);
router.put('/:id/devolver', verificarToken, verificarAdmin, registrarDevolucion);
// Nueva ruta para aprobar
router.put('/:id/aprobar', verificarToken, verificarAdmin, aprobarPrestamo);

export default router;