import { Usuario } from '../config/database.js';
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Validar si el usuario ya existe
        const userExists = await Usuario.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }

        // Hashear la contraseña por seguridad
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear el nuevo usuario
        const newUser = await Usuario.create({
            nombre,
            email,
            password: hashedPassword
        });

        res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Hubo un error en el servidor.' });
    }
};
