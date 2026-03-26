// src/controllers/productController.ts
import { Request, Response } from "express";
import { db } from "../firebase/firebase";
import { ProductModel } from "../models/product";
import admin from "firebase-admin";

const collection = db.collection("productos"); // colección de productos

// Crear producto
export const crearProducto = async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      descripcion = "",
      categoria,
      precioCompra,
      precioVenta,
      stock = 0,
      unidadMedida = "unidad",
      activo = true,
    } = req.body as ProductModel;

    if (!nombre || !categoria || precioCompra === undefined || precioVenta === undefined) {
      return res
        .status(400)
        .json({ error: "Los campos nombre, categoria, precioCompra y precioVenta son obligatorios" });
    }

    const fechaRegistro = admin.firestore.FieldValue.serverTimestamp();

    const nuevoProducto: Omit<ProductModel, "id" | "fechaRegistro"> = {
      nombre,
      descripcion,
      categoria,
      precioCompra: Number(precioCompra),
      precioVenta: Number(precioVenta),
      stock: Number(stock),
      unidadMedida,
      activo,
    };

    const docRef = await collection.add({
      ...nuevoProducto,
      fechaRegistro,
    });

    const doc = await docRef.get();
    const data = doc.data() as ProductModel;

    res.status(201).json({
      id: doc.id,
      ...data,
      fechaRegistro:
        data.fechaRegistro instanceof admin.firestore.Timestamp
          ? data.fechaRegistro.toDate()
          : data.fechaRegistro ?? null,
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
};

// Listar todos los productos
export const listarProductos = async (_req: Request, res: Response) => {
  try {
    const snapshot = await collection.get();
    const productos: ProductModel[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as ProductModel;
      productos.push({
        id: doc.id,
        ...data,
        fechaRegistro:
          data.fechaRegistro instanceof admin.firestore.Timestamp
            ? data.fechaRegistro.toDate()
            : data.fechaRegistro ?? null,
      });
    });

    res.json(productos);
  } catch (error) {
    console.error("Error al listar productos:", error);
    res.status(500).json({ error: "Error al listar productos" });
  }
};

// Obtener producto por ID
export const obtenerProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await collection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const data = doc.data() as ProductModel;

    res.json({
      id: doc.id,
      ...data,
      fechaRegistro:
        data.fechaRegistro instanceof admin.firestore.Timestamp
          ? data.fechaRegistro.toDate()
          : data.fechaRegistro ?? null,
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
};

// Actualizar producto
export const actualizarProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload: Partial<ProductModel> = req.body;

    // Convertir números para evitar problemas de tipo
    if (payload.precioCompra !== undefined) payload.precioCompra = Number(payload.precioCompra);
    if (payload.precioVenta !== undefined) payload.precioVenta = Number(payload.precioVenta);
    if (payload.stock !== undefined) payload.stock = Number(payload.stock);

    const docRef = collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await docRef.update(payload);
    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data() as ProductModel;

    res.json({
      id: updatedDoc.id,
      ...updatedData,
      fechaRegistro:
        updatedData.fechaRegistro instanceof admin.firestore.Timestamp
          ? updatedData.fechaRegistro.toDate()
          : updatedData.fechaRegistro ?? null,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

// Eliminar producto
export const eliminarProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const docRef = collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await docRef.delete();
    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};
