import Libro from "../models/Libro.js";
import { Op } from "sequelize";

// 1. OBTENER TODOS LOS LIBROS O BUSCAR POR TÍTULO
export const getLibros = async (req, res) => {
    try {
        const { titulo } = req.query;
        let filtro = {};

        if (titulo) {
            filtro.titulo = { [Op.like]: `%${titulo}%` };
        }

        const libros = await Libro.findAll({ where: filtro });
        res.json(libros);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los libros', error: error.message });
    }
};

// 2. CREAR UN NUEVO LIBRO
export const crearLibro = async (req, res) => {
    try {
        const nuevoLibro = await Libro.create(req.body);
        res.status(201).json({ mensaje: 'Libro registrado exitosamente', nuevoLibro });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al registrar el libro', error: error.message });
    }
};

// 3. ACTUALIZAR UN LIBRO
export const actualizarLibro = async (req, res) => {
    try {
        const { id } = req.params;
        const [actualizado] = await Libro.update(req.body, { where: { id } });
        
        if (actualizado) {
            const libroModificado = await Libro.findByPk(id);
            return res.json({ mensaje: 'Libro actualizado correctamente', libroModificado });
        }
        res.status(404).json({ mensaje: 'Libro no encontrado para actualizar' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar el libro', error: error.message });
    }
};

// 4. ELIMINAR UN LIBRO
export const eliminarLibro = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Libro.destroy({ where: { id } });
        
        if (eliminado) {
            return res.json({ mensaje: 'Libro eliminado de la biblioteca' });
        }
        res.status(404).json({ mensaje: 'Libro no encontrado' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar el libro', error: error.message });
    }
};