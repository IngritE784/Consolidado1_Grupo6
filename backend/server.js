const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Inicializamos la app
const app = express();

// Middlewares
app.use(cors()); // Permite peticiones del frontend
app.use(express.json()); // Permite recibir JSON en el body
app.use(express.urlencoded({ extended: true }));

// Importar conexión a base de datos
const sequelize = require('./config/database');

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: '¡Bienvenido a la API del proyecto Biblioteca Local!' });
});

// Configuración del Puerto
const PORT = process.env.PORT || 3000;

// Sincronizar BD y levantar servidor
sequelize.sync({ alter: true }) // alter: true actualiza las tablas si hacemos cambios en los modelos sin borrarlas
    .then(() => {
        console.log('Tablas sincronizadas correctamente.');
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo localmente en: http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error('Error al sincronizar la base de datos:', error);
    });
