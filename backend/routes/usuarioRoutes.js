import express from 'express';
import {
	listarUsuarios,
	obtenerUsuarioPorId,
	crearUsuario,
	actualizarUsuario,
	eliminarUsuario,
	cambiarRolUsuario
} from '../controllers/usuarioController.js';
import { verificarToken, verificarAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verificarToken, verificarAdmin, listarUsuarios);
router.get('/:id', verificarToken, verificarAdmin, obtenerUsuarioPorId);
router.post('/', verificarToken, verificarAdmin, crearUsuario);
router.put('/:id', verificarToken, verificarAdmin, actualizarUsuario);
router.delete('/:id', verificarToken, verificarAdmin, eliminarUsuario);
router.patch('/:id/rol', verificarToken, verificarAdmin, cambiarRolUsuario);

export default router;
