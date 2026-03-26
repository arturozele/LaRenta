// src/controllers/saleController.ts
import { Request, Response } from "express";
import { db } from "../firebase/firebase";
import { SaleModel, SaleProduct } from "../models/sale";
import admin from "firebase-admin";

const collection = db.collection("ventas"); // colección de ventas

// Crear venta
export const crearVenta = async (req: Request, res: Response) => {
  try {
    const { idCajero, productos, metodoPago } = req.body as {
      idCajero: string;
      productos: SaleProduct[];
      metodoPago: "Efectivo" | "Tarjeta" | "Transferencia";
    };

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "La venta debe contener al menos un producto" });
    }

    // calcular subtotales y total
    const productosConSubtotal = productos.map((p) => ({
      ...p,
      cantidad: Number(p.cantidad),
      precioUnitario: Number(p.precioUnitario),
      subtotal: Number(p.cantidad) * Number(p.precioUnitario),
    }));

    const total = productosConSubtotal.reduce((s, p) => s + p.subtotal, 0);

    const fechaVenta = admin.firestore.FieldValue.serverTimestamp();

    const nuevaVenta: Omit<SaleModel, "id" | "fechaVenta"> = {
      idCajero,
      productos: productosConSubtotal,
      total,
      metodoPago,
    };

    // Crear venta en Firestore
    const docRef = await collection.add({
      ...nuevaVenta,
      fechaVenta,
    });

    // Actualizar stock de productos con batch
    const batch = db.batch();
    for (const p of productosConSubtotal) {
      const prodRef = db.collection("productos").doc(p.idProducto);
      const prodSnap = await prodRef.get();
      if (prodSnap.exists) {
        const currentStock = prodSnap.data()?.stock ?? 0;
        batch.update(prodRef, { stock: Math.max(0, currentStock - p.cantidad) });
      }
    }
    await batch.commit();

    const doc = await docRef.get();
    const data = doc.data() as SaleModel;

    res.status(201).json({
      id: doc.id,
      ...data,
      fechaVenta:
        data.fechaVenta instanceof admin.firestore.Timestamp
          ? data.fechaVenta.toDate()
          : data.fechaVenta ?? null,
    });
  } catch (error) {
    console.error("Error al crear venta:", error);
    res.status(500).json({ error: "Error al crear venta" });
  }
};

// Listar todas las ventas
export const listarVentas = async (_req: Request, res: Response) => {
  try {
    const snapshot = await collection.orderBy("fechaVenta", "desc").get();
    const ventas: SaleModel[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as SaleModel;
      ventas.push({
        id: doc.id,
        ...data,
        fechaVenta:
          data.fechaVenta instanceof admin.firestore.Timestamp
            ? data.fechaVenta.toDate()
            : data.fechaVenta ?? null,
      });
    });

    res.json(ventas);
  } catch (error) {
    console.error("Error al listar ventas:", error);
    res.status(500).json({ error: "Error al listar ventas" });
  }
};

// Obtener venta por ID
export const obtenerVenta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await collection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    const data = doc.data() as SaleModel;

    res.json({
      id: doc.id,
      ...data,
      fechaVenta:
        data.fechaVenta instanceof admin.firestore.Timestamp
          ? data.fechaVenta.toDate()
          : data.fechaVenta ?? null,
    });
  } catch (error) {
    console.error("Error al obtener venta:", error);
    res.status(500).json({ error: "Error al obtener venta" });
  }
};

// Eliminar venta
export const eliminarVenta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    await docRef.delete();
    res.json({ mensaje: "Venta eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar venta:", error);
    res.status(500).json({ error: "Error al eliminar venta" });
  }
};
