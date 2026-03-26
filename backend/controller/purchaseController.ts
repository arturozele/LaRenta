import { Request, Response } from "express";
import admin from "firebase-admin";
import { CompraModel } from "../models/purchase";

const db = admin.firestore();
const comprasRef = db.collection("compras");
const productosRef = db.collection("productos");

export const crearCompra = async (req: Request, res: Response) => {
  try {
    const { empleadosIds, productos, total, fechaCompra } = req.body as CompraModel;

    // Validar campos requeridos
    if (!empleadosIds || !productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        error: "Campos obligatorios: empleadosIds y productos",
      });
    }

    // Crear nueva compra
    const nuevaCompra = {
      empleadosIds,
      productos,
      total,
      fechaCompra: fechaCompra ? new Date(fechaCompra) : new Date(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const compraDoc = await comprasRef.add(nuevaCompra);

    // Actualizar stock de los productos
    for (const producto of productos) {
      const productoDoc = productosRef.doc(producto.idProducto);
      const productoSnapshot = await productoDoc.get();

      if (!productoSnapshot.exists) {
        console.warn(`Producto no encontrado: ${producto.idProducto}`);
        continue;
      }

      const datosProducto = productoSnapshot.data();
      const stockActual = datosProducto?.stock ?? 0;

      await productoDoc.update({
        stock: stockActual + producto.cantidad,
      });
    }

    return res.status(201).json({
      mensaje: "Compra creada correctamente",
      id: compraDoc.id,
    });
  } catch (error: any) {
    console.error("Error al crear compra:", error);
    return res.status(500).json({
      error: "Error interno al crear la compra",
      detalle: error.message,
    });
  }
};

export const obtenerCompras = async (req: Request, res: Response) => {
  try {
    const snapshot = await comprasRef.get();
    const compras: any[] = [];

    snapshot.forEach((doc) => {
      compras.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json(compras);
  } catch (error: any) {
    console.error("Error al obtener compras:", error);
    return res.status(500).json({ error: "Error al obtener las compras" });
  }
};

export const eliminarCompra = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const compraDoc = comprasRef.doc(id);
    const compraSnapshot = await compraDoc.get();

    if (!compraSnapshot.exists) {
      return res.status(404).json({ error: "Compra no encontrada" });
    }

    const compraData = compraSnapshot.data() as CompraModel;

    // Revertir stock (restar los productos comprados)
    for (const producto of compraData.productos) {
      const productoDoc = productosRef.doc(producto.idProducto);
      const productoSnapshot = await productoDoc.get();

      if (!productoSnapshot.exists) continue;

      const datosProducto = productoSnapshot.data();
      const stockActual = datosProducto?.stock ?? 0;

      await productoDoc.update({
        stock: Math.max(stockActual - producto.cantidad, 0),
      });
    }

    await compraDoc.delete();

    return res.status(200).json({ mensaje: "Compra eliminada correctamente" });
  } catch (error: any) {
    console.error("Error al eliminar compra:", error);
    return res.status(500).json({ error: "Error al eliminar la compra" });
  }
};
