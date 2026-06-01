import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/database.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRoutes from "./routes/authRoutes.js";
app.use("/api/auth", authRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({
        mensaje: "¡Bienvenido a la API del proyecto Biblioteca Local!"
    });
});

const PORT = process.env.PORT || 3000;

sequelize.sync()
    .then(() => {
        console.log("Tablas sincronizadas correctamente.");

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error al sincronizar la base de datos:", error);
    });