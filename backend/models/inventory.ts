// src/models/inventory.ts
import admin from "firebase-admin";

export interface InventoryModel {
  id?: string; // ID asignado por Firestore
  idProducto: string; // ID del producto en la colección "productos"
  nombreProducto: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  ultimaActualizacion: admin.firestore.Timestamp | Date;
  tipoMovimiento: "Entrada" | "Salida" | "Ajuste"; // tipo de registro en inventario
  cantidadMovimiento: number;
  descripcion?: string;
}
