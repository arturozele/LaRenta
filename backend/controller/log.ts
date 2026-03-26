import { Request, Response } from "express";
import { db } from "../firebase/firebase";
import { LogModel } from "../models/log";

const collection = db.collection("logs");

// Crear producto
export const crearLog= async (data: LogModel) => {
  try {
    const docRef = await collection.add(data);
  } catch (error) {
    console.log("me dio error")
  }
};

// Obtener todos los logs
export const listarLogs = async (req: Request, res: Response) => {
  try {
    const snapshot = await collection.get();
    const logs: LogModel[] = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...(doc.data() as LogModel) });
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error al listar logs" });
  }
};

// Obtener un producto por ID
export const obtenerLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await collection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "LogModel no encontrado" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener log" });
  }
};

// Actualizar producto
export const actualizarLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: Partial<LogModel> = req.body;
    await collection.doc(id).update(data);
    res.json({ mensaje: "Log actualizado" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar log" });
  }
};

// Eliminar producto
export const eliminarLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await collection.doc(id).delete();
    res.json({ mensaje: "Log eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar log" });
  }
};
