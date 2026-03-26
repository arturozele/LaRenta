export interface ReporteVentas {
  totalVentas: number;
  cantidadVentas: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ReporteCompras {
  totalCompras: number;
  cantidadCompras: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ReporteInventario {
  totalProductos: number;
  stockTotal: number;
  productosBajoStock: number;
}
