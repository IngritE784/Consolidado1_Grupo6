import mysql from 'mysql2/promise';
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const dbName = process.env.DB_NAME || 'biblioteca_web';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';

// --- PASO 1: CREAR LA BASE DE DATOS SI NO EXISTE ---
const connection = await mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword
});
await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
console.log(`Base de datos '${dbName}' verificada/creada.`);
await connection.end();

// --- PASO 2: INICIALIZAR SEQUELIZE ---
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'mysql',
    logging: false
});

// --- PASO 3: DEFINICIÓN DE MODELOS ---

// 1. Tabla: usuarios
const Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    rol: { type: DataTypes.ENUM('admin', 'usuario'), defaultValue: 'usuario' }
}, {
    tableName: 'usuarios',
    timestamps: false
});

// 2. Tabla: libros
const Libro = sequelize.define('Libro', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    codigo: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    titulo: { type: DataTypes.STRING(150), allowNull: false },
    autor: { type: DataTypes.STRING(100), allowNull: false },
    categoria: { type: DataTypes.STRING(100), allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
    tableName: 'libros',
    timestamps: false
});

// 3. Tabla: prestamos
const Prestamo = sequelize.define('Prestamo', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    codigo: { type: DataTypes.STRING(20), allowNull: false }, // <-- AÑADE ESTA LÍNEA
    fecha_prestamo: { type: DataTypes.DATEONLY },
    fecha_devolucion: { type: DataTypes.DATEONLY },
    estado: { type: DataTypes.ENUM('pendiente', 'prestado', 'devuelto'), defaultValue: 'pendiente' }
}, {
    tableName: 'prestamos',
    timestamps: false
});

// --- PASO 4: RELACIONES 
Usuario.hasMany(Prestamo, { foreignKey: 'usuario_id' });
Prestamo.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Libro.hasMany(Prestamo, { foreignKey: 'libro_id' });
Prestamo.belongsTo(Libro, { foreignKey: 'libro_id' });


// --- PASO 5: SINCRONIZAR Y CREAR TABLAS ---
try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Todas las tablas han sido creadas/sincronizadas correctamente.');

    const adminExists = await Usuario.findOne({ where: { email: 'admin@admin.com' } });
    if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await Usuario.create({
            nombre: 'Administrador',
            email: 'admin@admin.com',
            password: hashedPassword,
            rol: 'admin'
        });
        console.log('Usuario administrador creado por defecto (admin@admin.com / admin123).');
    }

} catch (error) {
    console.error(' Error al sincronizar las tablas:', error);
}

// Exportamos la conexión y los modelos para usarlos en los controladores
export { sequelize, Usuario, Libro, Prestamo };