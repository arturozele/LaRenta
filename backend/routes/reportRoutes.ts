import { Router } from "express";
import {
  generarReporteVentas,
  generarReporteCompras,
  generarReporteInventario,
} from "../controller/reportController";

const router = Router();

router.get("/ventas", generarReporteVentas);
router.get("/compras", generarReporteCompras);
router.get("/inventario", generarReporteInventario);

export default router;
