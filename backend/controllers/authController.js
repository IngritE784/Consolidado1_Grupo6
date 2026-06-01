import { Usuario } from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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


// login  

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Usuario.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // Comparar la contraseña ingresada con la encriptada
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        // Crear el Token de sesión
        const token = jwt.sign(
            { id: user.id, rol: user.rol }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' }
        );

        res.status(200).json({ 
            mensaje: 'Inicio de sesión exitoso.', 
            token,
            usuario: { nombre: user.nombre, rol: user.rol }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Hubo un error en el servidor.' });
    }
};