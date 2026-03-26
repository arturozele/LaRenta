import admin from "firebase-admin";

export interface Shift {
  id?: string;
  turno: '6am-2pm' | '2pm-10pm';
  jefeTurnoId: string;
  empleadosIds: string[];
  fecha: admin.firestore.Timestamp | Date; // 🔹 aquí
  observaciones?: string;
}
