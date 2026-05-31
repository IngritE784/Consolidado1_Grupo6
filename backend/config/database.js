const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración para proyecto local (MySQL)
const sequelize = new Sequelize(
    process.env.DB_NAME || 'biblioteca_local', 
    process.env.DB_USER || 'root', 
    process.env.DB_PASSWORD || '', 
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false // Cambia a true si quieres ver las consultas SQL en consola
    }
);

// Probar la conexión
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos MySQL establecida correctamente.');
    } catch (error) {
        console.error('❌ No se pudo conectar a la base de datos:', error);
    }
};

testConnection();

module.exports = sequelize;
