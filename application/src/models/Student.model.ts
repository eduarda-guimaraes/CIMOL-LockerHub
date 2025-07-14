// application/src/models/Student.model.ts
import mongoose, { Document, Schema, model } from "mongoose";
import { ICourse } from "./Course.model";
import "./Course.model"; // --- MODIFICAÇÃO AQUI: Garante que o modelo Course seja registrado

export interface IStudent extends Document {
  _id: string;
  nome: string;
  matricula: string;
  course: Schema.Types.ObjectId | ICourse;
  email?: string;
  telefone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    nome: {
      type: String,
      required: [true, "O nome do estudante é obrigatório."],
      trim: true,
    },
    matricula: {
      type: String,
      required: [true, "A matrícula do estudante é obrigatória."],
      unique: true,
      trim: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course", // Esta referência precisa que o modelo 'Course' esteja registrado
      required: [true, "O curso do estudante é obrigatório."],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Por favor, insira um email válido."],
    },
    telefone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Student =
  mongoose.models.Student || model<IStudent>("Student", StudentSchema);
export default Student;
