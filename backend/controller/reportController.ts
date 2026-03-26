import { Request, Response } from "express";
import admin from "firebase-admin";
import { ReporteVentas, ReporteCompras, ReporteInventario } from "../models/report";

const db = admin.firestore();

export const generarReporteVentas = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    let query = db.collection("ventas") as FirebaseFirestore.Query;
    if (fechaInicio && fechaFin) {
      query = query
        .where("fechaVenta", ">=", new Date(fechaInicio as string))
        .where("fechaVenta", "<=", new Date(fechaFin as string));
    }

    const snapshot = await query.get();
    let totalVentas = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      totalVentas += data.total || 0;
    });

    const reporte: ReporteVentas = {
      totalVentas,
      cantidadVentas: snapshot.size,
      fechaInicio: fechaInicio as string,
      fechaFin: fechaFin as string,
    };

    res.status(200).json(reporte);
  } catch (error) {
    console.error("Error generando reporte de ventas:", error);
    res.status(500).json({ error: "Error al generar el reporte de ventas" });
  }
};

// 🧾 Reporte de Compras
export const generarReporteCompras = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    let query = db.collection("compras") as FirebaseFirestore.Query;
    if (fechaInicio && fechaFin) {
      query = query
        .where("fechaCompra", ">=", new Date(fechaInicio as string))
        .where("fechaCompra", "<=", new Date(fechaFin as string));
    }

    const snapshot = await query.get();
    let totalCompras = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      totalCompras += data.total || 0;
    });

    const reporte: ReporteCompras = {
      totalCompras,
      cantidadCompras: snapshot.size,
      fechaInicio: fechaInicio as string,
      fechaFin: fechaFin as string,
    };

    res.status(200).json(reporte);
  } catch (error) {
    console.error("Error generando reporte de compras:", error);
    res.status(500).json({ error: "Error al generar el reporte de compras" });
  }
};

// 📦 Reporte de Inventario
export const generarReporteInventario = async (_req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("productos").get();

    let stockTotal = 0;
    let productosBajoStock = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      stockTotal += data.stock || 0;
      if (data.stock < 5) productosBajoStock++; // ejemplo: alerta si el stock es menor a 5
    });

    const reporte: ReporteInventario = {
      totalProductos: snapshot.size,
      stockTotal,
      productosBajoStock,
    };

    res.status(200).json(reporte);
  } catch (error) {
    console.error("Error generando reporte de inventario:", error);
    res.status(500).json({ error: "Error al generar el reporte de inventario" });
  }
};
