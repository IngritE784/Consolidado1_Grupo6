import { Libro } from '../config/database.js';
import { Op } from 'sequelize'; // Importante para la búsqueda por título

export const obtenerLibros = async (req, res) => {
    try {
        const { titulo } = req.query; // Captura el query para la búsqueda
        let condicion = {};

        // Si el usuario envía un título, configuramos la búsqueda con LIKE
        if (titulo) {
            condicion = {
                titulo: {
                    [Op.like]: `%${titulo}%`
                }
            };
        }

        const libros = await Libro.findAll({ where: condicion });
        res.status(200).json(libros);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener libros.' });
    }
};

export const crearLibro = async (req, res) => {
    try {
        const { codigo, titulo, autor, categoria, cantidad } = req.body;
        const nuevoLibro = await Libro.create({ codigo, titulo, autor, categoria, cantidad });
        res.status(201).json({ mensaje: 'Libro creado exitosamente', libro: nuevoLibro });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Error al crear el libro.' });
    }
};

export const actualizarLibro = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, autor, categoria, cantidad } = req.body;

        const libro = await Libro.findByPk(id);
        if (!libro) return res.status(404).json({ error: 'Libro no encontrado.' });

        await libro.update({ titulo, autor, categoria, cantidad });
        res.status(200).json({ mensaje: 'Libro actualizado', libro });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el libro.' });
    }
};

export const eliminarLibro = async (req, res) => {
    try {
        const { id } = req.params;

        const libro = await Libro.findByPk(id);
        if (!libro) return res.status(404).json({ error: 'Libro no encontrado.' });

        await libro.destroy();
        res.status(200).json({ mensaje: 'Libro eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el libro.' });
    }
};