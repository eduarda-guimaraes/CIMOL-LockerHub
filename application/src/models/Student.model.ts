// application/src/models/Student.model.ts
import mongoose, { Document, Schema, model } from "mongoose";
import { ICourse } from "./Course.model"; // Importa a interface do Course

// 1. Interface para o documento Student
export interface IStudent extends Document {
  nome: string;
  matricula: string;
  course: Schema.Types.ObjectId | ICourse; // Referência ao ID do curso ou ao objeto populado
  createdAt: Date;
  updatedAt: Date;
}

// 2. Schema do Mongoose
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
    // --- MODIFICAÇÃO AQUI: Renomeando 'curso' para 'course' para consistência com ref ---
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course", // Referência ao curso do estudante
      required: [true, "O curso do estudante é obrigatório."],
    },
  },
  {
    timestamps: true,
  }
);

// 3. Exportar o modelo
const Student =
  mongoose.models.Student || model<IStudent>("Student", StudentSchema);
export default Student;
