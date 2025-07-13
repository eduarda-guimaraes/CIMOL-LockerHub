// application/src/models/Course.model.ts
import mongoose, { Document, Schema, model } from "mongoose";

// 1. Interface para o documento Course
export interface ICourse extends Document {
  // --- MODIFICAÇÃO AQUI: Adicionando _id à interface ---
  _id: string; // O _id é um ObjectId no Mongoose, mas é frequentemente usado como string.
  nome: string;
  codigo: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Schema do Mongoose
const CourseSchema = new Schema<ICourse>(
  {
    nome: {
      type: String,
      required: [true, "O nome do curso é obrigatório."],
      trim: true,
    },
    codigo: {
      type: String,
      required: [true, "O código do curso é obrigatório."],
      unique: true,
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// 3. Exportar o modelo
const Course = mongoose.models.Course || model<ICourse>("Course", CourseSchema);
export default Course;
