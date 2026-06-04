import bcrypt from 'bcrypt';
import { Usuario } from '../config/database.js';

const rolesPermitidos = ['admin', 'usuario'];

const usuarioSinPassword = (usuario) => {
    const data = usuario.toJSON();
    delete data.password;
    return data;
};

export const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['password'] }
        });

        return res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error en listarUsuarios:', error);
        return res.status(500).json({ error: 'Hubo un error en el servidor.' });
    }
};

export const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        return res.status(200).json(usuario);
    } catch (error) {
        console.error('Error en obtenerUsuarioPorId:', error);
        return res.status(500).json({ error: 'Hubo un error en el servidor.' });
    }
};

export const crearUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y password son obligatorios.' });
        }

        if (rol && !rolesPermitidos.includes(rol)) {
            return res.status(400).json({ error: 'Rol invalido.' });
        }

        const existe = await Usuario.findOne({ where: { email } });
        if (existe) {
            return res.status(400).json({ error: 'El correo electronico ya esta registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = await Usuario.create({
            nombre,
            email,
            password: hashedPassword,
            rol: rol || 'usuario'
        });

        return res.status(201).json({
            mensaje: 'Usuario creado exitosamente.',
            usuario: usuarioSinPassword(nuevoUsuario)
        });
    } catch (error) {
        console.error('Error en crearUsuario:', error);
        return res.status(500).json({ error: 'Hubo un error en el servidor.' });
    }
};

export const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, password, rol } = req.body;

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        if (email && email !== usuario.email) {
            const emailRepetido = await Usuario.findOne({ where: { email } });
            if (emailRepetido) {
                return res.status(400).json({ error: 'El correo electronico ya esta registrado.' });
            }
        }

        if (rol && !rolesPermitidos.includes(rol)) {
            return res.status(400).json({ error: 'Rol invalido.' });
        }

        if (nombre !== undefined) usuario.nombre = nombre;
        if (email !== undefined) usuario.email = email;
        if (rol !== undefined) usuario.rol = rol;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(password, salt);
        }

        await usuario.save();

        return res.status(200).json({
            mensaje: 'Usuario actualizado correctamente.',
            usuario: usuarioSinPassword(usuario)
        });
    } catch (error) {
        console.error('Error en actualizarUsuario:', error);
        return res.status(500).json({ error: 'Hubo un error en el servidor.' });
    }
};

export const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        await usuario.destroy();

        return res.status(200).json({ mensaje: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error('Error en eliminarUsuario:', error);
        return res.status(500).json({ error: 'Hubo un error en el servidor.' });
    }
};

export const cambiarRolUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;

        if (!rol || !rolesPermitidos.includes(rol)) {
            return res.status(400).json({ error: 'Debe enviar un rol valido (admin o usuario).' });
        }

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        usuario.rol = rol;
        await usuario.save();

        return res.status(200).json({
            mensaje: 'Rol actualizado correctamente.',
            usuario: usuarioSinPassword(usuario)
        });
    } catch (error) {
        console.error('Error en cambiarRolUsuario:', error);
        return res.status(500).json({ error: 'Hubo un error en el servidor.' });
    }
};
