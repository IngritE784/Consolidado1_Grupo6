import { Prestamo, Libro, Usuario } from '../config/database.js';
import crypto from 'crypto'; // <-- IMPORTA CRYPTO AQUÍ

export const solicitarPrestamo = async (req, res) => {
    try {
        const { libro_id, fecha_devolucion } = req.body;
        const usuario_id = req.usuario.id;

        const libro = await Libro.findByPk(libro_id);
        if (!libro || libro.cantidad <= 0) {
            return res.status(400).json({ error: 'Libro no disponible.' });
        }

        // GENERADOR DE CÓDIGO DEL PDF
        const codigoGenerado = crypto.randomBytes(4).toString("hex").toUpperCase(); // <-- USA EL CÓDIGO DEL PDF

        const nuevoPrestamo = await Prestamo.create({
            codigo: codigoGenerado, // <-- GUÁRDALO EN LA BASE DE DATOS
            usuario_id,
            libro_id,
            fecha_prestamo: new Date(),
            fecha_devolucion,
            estado: 'pendiente'
        });

        await libro.update({ cantidad: libro.cantidad - 1 });

        res.status(201).json({ mensaje: 'Préstamo registrado.', prestamo: nuevoPrestamo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al solicitar préstamo.' });
    }
};

export const listarPrestamos = async (req, res) => {
    try {
        let condicion = {};
        // Si no es admin, solo ve sus préstamos
        if (req.usuario.rol !== 'admin') {
            condicion = { usuario_id: req.usuario.id };
        }

        const prestamos = await Prestamo.findAll({
            where: condicion,
            include: [
                { model: Usuario, attributes: ['nombre', 'email'] },
                { model: Libro, attributes: ['titulo'] }
            ]
        });
        res.status(200).json(prestamos);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar préstamos.' });
    }
};

export const registrarDevolucion = async (req, res) => {
    try {
        const { id } = req.params;
        const prestamo = await Prestamo.findByPk(id);

        if (!prestamo) return res.status(404).json({ error: 'Préstamo no encontrado.' });
        if (prestamo.estado === 'devuelto') return res.status(400).json({ error: 'Ya está devuelto.' });

        await prestamo.update({ estado: 'devuelto' });

        const libro = await Libro.findByPk(prestamo.libro_id);
        if (libro) {
            await libro.update({ cantidad: libro.cantidad + 1 });
        }

        res.status(200).json({ mensaje: 'Devolución registrada.', prestamo });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar devolución.' });
    }
};

export const aprobarPrestamo = async (req, res) => {
    try {
        const { id } = req.params;
        const prestamo = await Prestamo.findByPk(id);

        if (!prestamo) return res.status(404).json({ error: 'Préstamo no encontrado.' });
        
        // Cambia el estado de 'pendiente' a 'prestado'
        await prestamo.update({ estado: 'prestado' });

        res.status(200).json({ mensaje: 'Préstamo aprobado.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al aprobar préstamo.' });
    }
};