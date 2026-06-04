import { Prestamo, Libro, Usuario } from '../config/database.js';

// GET /api/prestamos — admin ve todos; usuario ve solo los suyos
export const obtenerPrestamos = async (req, res) => {
    try {
        const condicion = req.usuario.rol === 'admin'
            ? {}
            : { usuario_id: req.usuario.id };

        const prestamos = await Prestamo.findAll({
            where: condicion,
            include: [
                { model: Usuario, attributes: ['id', 'nombre', 'email'] },
                { model: Libro,   attributes: ['id', 'titulo', 'autor', 'codigo'] }
            ],
            order: [['id', 'DESC']]
        });

        res.status(200).json(prestamos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los préstamos.' });
    }
};

// POST /api/prestamos — cualquier usuario autenticado puede solicitar
export const solicitarPrestamo = async (req, res) => {
    try {
        const { libro_id, fecha_devolucion } = req.body;
        const usuario_id = req.usuario.id;

        if (!libro_id) {
            return res.status(400).json({ error: 'El campo libro_id es obligatorio.' });
        }

        const libro = await Libro.findByPk(libro_id);
        if (!libro) {
            return res.status(404).json({ error: 'Libro no encontrado.' });
        }
        if (libro.cantidad <= 0) {
            return res.status(400).json({ error: 'No hay ejemplares disponibles de este libro.' });
        }

        // Verificar que el usuario no tenga ya un préstamo activo de este libro
        const prestamoActivo = await Prestamo.findOne({
            where: { usuario_id, libro_id, estado: 'prestado' }
        });
        if (prestamoActivo) {
            return res.status(400).json({ error: 'Ya tienes un préstamo activo de este libro.' });
        }

        const fecha_prestamo = new Date().toISOString().split('T')[0];
        const devolucion = fecha_devolucion || (() => {
            const d = new Date();
            d.setDate(d.getDate() + 7);
            return d.toISOString().split('T')[0];
        })();

        const prestamo = await Prestamo.create({
            usuario_id,
            libro_id,
            fecha_prestamo,
            fecha_devolucion: devolucion,
            estado: 'prestado'
        });

        // Decrementar stock del libro
        await libro.update({ cantidad: libro.cantidad - 1 });

        res.status(201).json({ mensaje: 'Préstamo solicitado correctamente.', prestamo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al solicitar el préstamo.' });
    }
};

// PUT /api/prestamos/:id/devolver — el propio usuario o un admin pueden devolver
export const devolverPrestamo = async (req, res) => {
    try {
        const { id } = req.params;

        const prestamo = await Prestamo.findByPk(id, {
            include: [{ model: Libro }]
        });

        if (!prestamo) {
            return res.status(404).json({ error: 'Préstamo no encontrado.' });
        }

        // Solo el dueño del préstamo o un admin pueden devolver
        if (req.usuario.rol !== 'admin' && prestamo.usuario_id !== req.usuario.id) {
            return res.status(403).json({ error: 'No tienes permiso para devolver este préstamo.' });
        }

        if (prestamo.estado === 'devuelto') {
            return res.status(400).json({ error: 'Este préstamo ya fue devuelto.' });
        }

        await prestamo.update({ estado: 'devuelto' });

        // Incrementar stock del libro
        const libro = prestamo.Libro;
        if (libro) {
            await libro.update({ cantidad: libro.cantidad + 1 });
        }

        res.status(200).json({ mensaje: 'Libro devuelto correctamente.', prestamo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al devolver el préstamo.' });
    }
};

// PUT /api/prestamos/:id/estado — solo admin puede cambiar estado manualmente
export const cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const estadosValidos = ['pendiente', 'prestado', 'devuelto'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Use: ${estadosValidos.join(', ')}` });
        }

        const prestamo = await Prestamo.findByPk(id);
        if (!prestamo) {
            return res.status(404).json({ error: 'Préstamo no encontrado.' });
        }

        await prestamo.update({ estado });
        res.status(200).json({ mensaje: `Estado actualizado a '${estado}'.`, prestamo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cambiar el estado.' });
    }
};
