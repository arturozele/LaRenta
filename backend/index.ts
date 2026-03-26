import express from "express";
import productoRoutes from "./routes/productRoutes";
import usuarioRoutes from "./routes/usuarioRoutes"; // importamos rutas de usuarios
import saleRoutes from "./routes/saleRoutes";
import shiftRoutes from "./routes/shiftRoutes"; // sin errores de path
import purchaseRoutes from "./routes/purchaseRoutes"
import inventoryRoutes from "./routes/inventoryRoutes"
import reportRoutes from "./routes/reportRoutes"

const app = express();
const PORT = 3000;


// Middleware para trabajar con JSON
app.use(express.json());

// Rutas
app.use("/productos", productoRoutes);
app.use("/usuarios", usuarioRoutes); 
app.use("/sale",saleRoutes);
app.use("/turnos", shiftRoutes);
app.use("/compras",purchaseRoutes);
app.use("/inventario", inventoryRoutes);
app.use("/reportes", reportRoutes)


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

