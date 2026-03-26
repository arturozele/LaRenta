// src/models/product.ts
export interface ProductModel {
  id?: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  unidadMedida: string; // Ej: "kg", "unidad", "litro"
  fechaRegistro: Date;
  activo: boolean;
}
