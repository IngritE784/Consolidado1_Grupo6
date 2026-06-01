import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Verifica si el usuario tiene su Token válido
export const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere un token para esta ruta.' });
    }

    try {
        // Verificamos el token usando tu clave secreta del .env
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decodificado; 
        next(); 
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

// Verifica si el usuario tiene privilegios de Administrador
export const verificarAdmin = (req, res, next) => {
    if (!req.usuario || req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Acción exclusiva para administradores.' });
    }
    next(); 
};