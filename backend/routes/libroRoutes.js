import express from "express";
import { getLibros, crearLibro, actualizarLibro, eliminarLibro } from "../controllers/libroController.js";

const router = express.Router();

router.get("/", getLibros);
router.post("/", crearLibro);
router.put("/:id", actualizarLibro);
router.delete("/:id", eliminarLibro);

export default router;