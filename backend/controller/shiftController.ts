// src/controllers/shiftController.ts
import { Request, Response } from "express";
import { db } from "../firebase/firebase";
import { Shift } from "../models/shift";
import admin from "firebase-admin";

const collection = db.collection("turnos");
const userCollection = db.collection("usuarios");

// Helper: convertir Timestamp | Date | string a Date
const convertirFecha = (fecha: admin.firestore.Timestamp | Date | string): Date => {
  if (!fecha) throw new Error("Fecha inválida");
  if (fecha instanceof admin.firestore.Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  const f = new Date(fecha);
  if (isNaN(f.getTime())) throw new Error("Fecha inválida");
  return f;
};

// Validar existencia de usuario por ID
const validarUsuario = async (id: string): Promise<boolean> => {
  const doc = await userCollection.doc(id).get();
  return doc.exists;
};

// Crear turno
export const crearTurno = async (req: Request, res: Response) => {
  try {
    const { turno, jefeTurnoId, empleadosIds, fecha, observaciones } = req.body as Shift;

    if (!turno || !jefeTurnoId || !empleadosIds || !fecha) {
      return res.status(400).json({ error: "Campos obligatorios: turno, jefeTurnoId, empleadosIds, fecha" });
    }

    const jefeExiste = await validarUsuario(jefeTurnoId);
    if (!jefeExiste) return res.status(400).json({ error: "El jefe de turno no existe" });

    for (const id of empleadosIds) {
      const existe = await validarUsuario(id);
      if (!existe) return res.status(400).json({ error: `Empleado con ID ${id} no existe` });
    }

    const empleadosUnicos = Array.from(new Set(empleadosIds));
    const fechaTurno = convertirFecha(fecha);

    const nuevoTurno: Omit<Shift, "id"> = {
      turno,
      jefeTurnoId,
      empleadosIds: empleadosUnicos,
      fecha: admin.firestore.Timestamp.fromDate(fechaTurno),
      ...(observaciones ? { observaciones } : {}),
    };

    const docRef = await collection.add(nuevoTurno);
    const doc = await docRef.get();
    const data = doc.data() as Shift;

    res.status(201).json({
      id: doc.id,
      ...data,
      fecha: convertirFecha(data.fecha),
    });
  } catch (error) {
    console.error("Error al crear turno:", error);
    res.status(500).json({ error: "Error al crear turno" });
  }
};

// Listar todos los turnos
export const listarTurnos = async (_req: Request, res: Response) => {
  try {
    const snapshot = await collection.orderBy("fecha", "desc").get();
    const turnos: Shift[] = snapshot.docs.map(doc => {
      const data = doc.data() as Shift;
      return {
        id: doc.id,
        ...data,
        fecha: convertirFecha(data.fecha),
      };
    });
    res.json(turnos);
  } catch (error) {
    console.error("Error al listar turnos:", error);
    res.status(500).json({ error: "Error al listar turnos" });
  }
};

// Obtener turno por ID
export const obtenerTurno = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await collection.doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: "Turno no encontrado" });

    const data = doc.data() as Shift;
    res.json({
      id: doc.id,
      ...data,
      fecha: convertirFecha(data.fecha),
    });
  } catch (error) {
    console.error("Error al obtener turno:", error);
    res.status(500).json({ error: "Error al obtener turno" });
  }
};

// Actualizar turno
export const actualizarTurno = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body as Partial<Shift>;

    if (payload.fecha) payload.fecha = admin.firestore.Timestamp.fromDate(convertirFecha(payload.fecha));

    if (payload.jefeTurnoId) {
      const jefeExiste = await validarUsuario(payload.jefeTurnoId);
      if (!jefeExiste) return res.status(400).json({ error: "El jefe de turno no existe" });
    }

    if (payload.empleadosIds) {
      for (const eid of payload.empleadosIds) {
        const existe = await validarUsuario(eid);
        if (!existe) return res.status(400).json({ error: `Empleado con ID ${eid} no existe` });
      }
      payload.empleadosIds = Array.from(new Set(payload.empleadosIds));
    }

    await collection.doc(id).update(payload);
    const doc = await collection.doc(id).get();
    const data = doc.data() as Shift;

    res.json({
      id: doc.id,
      ...data,
      fecha: convertirFecha(data.fecha),
    });
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    res.status(500).json({ error: "Error al actualizar turno" });
  }
};

// Eliminar turno
export const eliminarTurno = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Turno no encontrado" });

    await docRef.delete();
    res.json({ mensaje: "Turno eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar turno:", error);
    res.status(500).json({ error: "Error al eliminar turno" });
  }
};
