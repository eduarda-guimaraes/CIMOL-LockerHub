// application/src/models/Locker.model.ts
import mongoose, { Document, Schema, model } from "mongoose";
import { ICourse } from "./Course.model";
import "./Course.model"; // --- MODIFICAÇÃO AQUI: Garante que o modelo Course seja registrado

export interface ILocker extends Document {
  _id: string;
  numero: string;
  status: "available" | "occupied" | "overdue";
  courseId: Schema.Types.ObjectId | ICourse;
  building: "A" | "B" | "C" | "D" | "E";
  createdAt: Date;
  updatedAt: Date;
}

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
      ref: "Course", // Esta referência também precisa do modelo 'Course'
      required: [true, "O curso associado ao armário é obrigatório."],
    },
    building: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      required: [true, "O prédio do armário é obrigatório."],
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

const Locker = mongoose.models.Locker || model<ILocker>("Locker", LockerSchema);
export default Locker;
