// application/src/models/Locker.model.ts
import mongoose, { Document, Schema, model } from "mongoose";
import { ICourse } from "./Course.model"; // Importa a interface do Course

// 1. Interface para o documento Locker
export interface ILocker extends Document {
  _id: string;
  numero: string;
  status: "available" | "occupied" | "overdue";
  courseId: Schema.Types.ObjectId | ICourse;
  building: "A" | "B" | "C" | "D" | "E"; // Novo campo para o prédio
  createdAt: Date;
  updatedAt: Date;
}

// 2. Schema do Mongoose
const LockerSchema = new Schema<ILocker>(
  {
    numero: {
      type: String,
      required: [true, "O número do armário é obrigatório."],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "overdue"],
      default: "available",
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "O curso associado ao armário é obrigatório."],
    },
    // --- MODIFICAÇÃO AQUI: Adicionando o campo 'building' ---
    building: {
      type: String,
      enum: ["A", "B", "C", "D", "E"], // Prédios do CIMOL
      required: [true, "O prédio do armário é obrigatório."],
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// 3. Exportar o modelo
const Locker = mongoose.models.Locker || model<ILocker>("Locker", LockerSchema);
export default Locker;
