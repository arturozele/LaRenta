// src/models/sale.ts/Ventaaaaaas
// src/models/sale.ts
export interface SaleProduct {
  idProducto: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface SaleModel {
  id?: string;
  idCajero: string; 
  productos: SaleProduct[];
  total: number;
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  fechaVenta: Date;
}
