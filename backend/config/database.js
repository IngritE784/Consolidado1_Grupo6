import { Sequelize } from "sequelize";

// Configuración de la conexión a MySQL usando XAMPP
const sequelize = new Sequelize("biblioteca_web", "root", "", {
    host: "localhost",
    dialect: "mysql",
    port: 3306,
    logging: false // Esto evita que la consola se llene de mensajes de SQL
});

try {
    // Probamos la conexión
    await sequelize.authenticate();
    console.log("✅ Conexión con MySQL (XAMPP) establecida con éxito.");
} catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
}

export default sequelize;