import express from 'express';
import {
    obtenerPrestamos,
    solicitarPrestamo,
    devolverPrestamo,
    cambiarEstado
} from '../controllers/prestamoController.js';
import { verificarToken, verificarAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Obtener préstamos (admin: todos | usuario: los suyos)
router.get('/', verificarToken, obtenerPrestamos);

// Solicitar un préstamo (cualquier usuario autenticado)
router.post('/', verificarToken, solicitarPrestamo);

// Devolver un libro (el dueño o un admin)
router.put('/:id/devolver', verificarToken, devolverPrestamo);

// Cambiar estado manualmente (solo admin)
router.put('/:id/estado', verificarToken, verificarAdmin, cambiarEstado);

export default router;
