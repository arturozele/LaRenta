// src/controllers/inventoryController.ts
import { Request, Response } from "express";
import admin from "firebase-admin";
import { InventoryModel } from "../models/inventory";

const db = admin.firestore();
const inventoryCollection = db.collection("inventario");
const productCollection = db.collection("productos");

// ✅ Crear registro de movimiento en inventario
export const createInventoryRecord = async (req: Request, res: Response) => {
  try {
    const {
      idProducto,
      nombreProducto,
      stockActual,
      stockMinimo,
      stockMaximo,
      tipoMovimiento,
      cantidadMovimiento,
      descripcion,
    } = req.body as InventoryModel;

    if (
      !idProducto ||
      !nombreProducto ||
      !tipoMovimiento ||
      cantidadMovimiento === undefined
    ) {
      return res.status(400).json({
        error:
          "Campos obligatorios: idProducto, nombreProducto, tipoMovimiento, cantidadMovimiento",
      });
    }

    // Obtener el producto para actualizar su stock
    const productRef = productCollection.doc(idProducto);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const data = productSnap.data()!;
    let nuevoStock = data.stock || 0;

    if (tipoMovimiento === "Entrada") nuevoStock += cantidadMovimiento;
    else if (tipoMovimiento === "Salida") nuevoStock -= cantidadMovimiento;
    else if (tipoMovimiento === "Ajuste")
      nuevoStock = cantidadMovimiento; // En caso de ajuste manual

    await productRef.update({
      stock: Math.max(nuevoStock, 0),
    });

    const newRecord: InventoryModel = {
      idProducto,
      nombreProducto,
      stockActual: nuevoStock,
      stockMinimo: stockMinimo || 5,
      stockMaximo: stockMaximo || 100,
      ultimaActualizacion: admin.firestore.Timestamp.now(),
      tipoMovimiento,
      cantidadMovimiento,
      descripcion: descripcion || "",
    };

    const docRef = await inventoryCollection.add(newRecord);
    res
      .status(201)
      .json({ id: docRef.id, mensaje: "Registro de inventario creado", ...newRecord });
  } catch (error) {
    console.error("Error al crear registro de inventario:", error);
    res.status(500).json({ error: "Error interno al registrar inventario" });
  }
};

// ✅ Obtener todos los registros de inventario
export const getInventoryRecords = async (_req: Request, res: Response) => {
  try {
    const snapshot = await inventoryCollection.get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener registros de inventario" });
  }
};

// ✅ Obtener un registro de inventario por ID
export const getInventoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await inventoryCollection.doc(id).get();
    if (!doc.exists)
      return res.status(404).json({ error: "Registro no encontrado" });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el registro" });
  }
};

// ✅ Eliminar registro de inventario
export const deleteInventoryRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = inventoryCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists)
      return res.status(404).json({ error: "Registro no encontrado" });

    await docRef.delete();
    res.status(200).json({ mensaje: "Registro eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el registro" });
  }
};
