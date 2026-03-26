export interface ProductoCompra {
  idProducto: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface CompraModel {
  id?: string;
  empleadosIds: string; // ID del empleado que realiza la compra
  productos: ProductoCompra[];
  total: number;
  fechaCompra: string; // ISO string (ej: 2025-11-05T00:00:00.000Z)
}
