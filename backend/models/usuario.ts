// src/models/user.ts
import admin from "firebase-admin";

export interface UserModel {
  id?: string; // ID asignado por Firebase
  nombre: string;
  correo: string;
  password?: string;
  rol: 
    | "CEO"
    | "Gerente"
    | "Jefe de Turno"
    | "Cajero"
    | "Empleado"
    | "Directiva"       // 🔹 nuevo rol
    | "Administrador General" // 🔹 nuevo rol
    | "Cajero";
  turno?: string;
  fechaRegistro: admin.firestore.Timestamp | Date; // fecha de registro
  activo: boolean;
}

