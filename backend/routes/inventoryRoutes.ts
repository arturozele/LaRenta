// src/routes/inventoryRoutes.ts
import express from "express";
import {
  createInventoryRecord,
  getInventoryRecords,
  getInventoryById,
  deleteInventoryRecord,
} from "../controller/inventoryController";

const router = express.Router();

// 📦 Crear un nuevo registro en inventario
router.post("/", createInventoryRecord);

// 📋 Obtener todos los registros de inventario
router.get("/", getInventoryRecords);

// 🔍 Obtener un registro por ID
router.get("/:id", getInventoryById);

// 🗑️ Eliminar un registro
router.delete("/:id", deleteInventoryRecord);

export default router;
