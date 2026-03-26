// src/controllers/userController.ts
import { Request, Response } from "express";
import { db } from "../firebase/firebase";
import { UserModel } from "../models/usuario";
import admin from "firebase-admin";

const collection = db.collection("usuarios"); // Nombre de la colección en Firestore

// Crear usuario
export const crearUsuario = async (req: Request, res: Response) => {
  try {
    const { nombre, correo, rol, turno, activo = true } = req.body as UserModel;

    // Validaciones básicas
    if (!nombre || !correo || !rol) {
      return res
        .status(400)
        .json({ error: "Los campos nombre, correo y rol son obligatorios" });
    }

    const fechaRegistro = admin.firestore.FieldValue.serverTimestamp();

    const nuevoUsuario: Omit<UserModel, "id" | "fechaRegistro"> = {
      nombre,
      correo,
      rol,
      ...(turno ? { turno } : {}), // solo agrega turno si existe
      activo,
    };

    const docRef = await collection.add({
      ...nuevoUsuario,
      fechaRegistro,
    });

    const doc = await docRef.get();
    const data = doc.data() as UserModel;

    res.status(201).json({
      id: doc.id,
      ...data,
      fechaRegistro:
        data.fechaRegistro instanceof admin.firestore.Timestamp
          ? data.fechaRegistro.toDate()
          : data.fechaRegistro ?? null,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

// Listar todos los usuarios
export const listarUsuarios = async (_req: Request, res: Response) => {
  try {
    const snapshot = await collection.get();
    const usuarios: UserModel[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      usuarios.push({
        id: doc.id,
        nombre: data.nombre,
        correo: data.correo,
        rol: data.rol,
        turno: data.turno,
        activo: data.activo,
        fechaRegistro:
          data.fechaRegistro instanceof admin.firestore.Timestamp
            ? data.fechaRegistro.toDate()
            : data.fechaRegistro ?? null,
      });
    });

    res.json(usuarios);
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ error: "Error al listar usuarios" });
  }
};

// Obtener un usuario por ID
export const obtenerUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await collection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const data = doc.data() as UserModel;

    res.json({
      id: doc.id,
      ...data,
      fechaRegistro:
        data.fechaRegistro instanceof admin.firestore.Timestamp
          ? data.fechaRegistro.toDate()
          : data.fechaRegistro ?? null,
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// Actualizar usuario
export const actualizarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: Partial<UserModel> = req.body;

    if (!id) return res.status(400).json({ error: "ID de usuario requerido" });

    const docRef = collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await docRef.update(data);
    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data() as UserModel;

    res.json({
      id: updatedDoc.id,
      ...updatedData,
      fechaRegistro:
        updatedData.fechaRegistro instanceof admin.firestore.Timestamp
          ? updatedData.fechaRegistro.toDate()
          : updatedData.fechaRegistro ?? null,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

// Eliminar usuario
export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "ID de usuario requerido" });

    const docRef = collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await docRef.delete();
    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};
