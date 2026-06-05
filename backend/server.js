import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Añadir en la sección de importaciones:
import libroRoutes from "./routes/libroRoutes.js";
import prestamoRoutes from "./routes/prestamoRoutes.js";



dotenv.config();

// Importamos base de datos y rutas
import { sequelize } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";

// 3. Configuramos las rutas de carpetas 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//rutas del backend
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);


// Añadir debajo de app.use("/api/usuarios", usuarioRoutes);
app.use("/api/libros", libroRoutes);
app.use("/api/prestamos", prestamoRoutes);


// Conectamos la carpeta frontend
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});