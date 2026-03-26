import express from "express";
import {
  crearCompra,
  obtenerCompras,
  eliminarCompra,
} from "../controller/purchaseController";

const router = express.Router();

router.post("/", crearCompra); // Crear compra
router.get("/", obtenerCompras); // Listar compras
router.delete("/:id", eliminarCompra); // Eliminar compra

export default router;
