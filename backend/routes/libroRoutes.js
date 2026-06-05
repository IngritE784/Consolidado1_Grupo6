import express from 'express';
import { obtenerLibros, crearLibro, actualizarLibro, eliminarLibro } from '../controllers/libroController.js';
import { verificarToken, verificarAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verificarToken, obtenerLibros); 
router.post('/', verificarToken, verificarAdmin, crearLibro); 
router.put('/:id', verificarToken, verificarAdmin, actualizarLibro); 
router.delete('/:id', verificarToken, verificarAdmin, eliminarLibro); 

export default router;