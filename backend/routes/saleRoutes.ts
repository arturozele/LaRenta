import { Router } from "express";
import { crearVenta, listarVentas, obtenerVenta, eliminarVenta } from "../controller/saleController";


const router = Router();

router.post("/", crearVenta);
router.get("/", listarVentas);
router.get("/:id", obtenerVenta);
router.delete("/:id", eliminarVenta);


export default router;
