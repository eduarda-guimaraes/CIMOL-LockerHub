// application/src/models/Course.model.ts
import { Document, Schema, model } from "mongoose";

// 1. Interface para o documento Course
export interface ICourse extends Document {
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
      trim: true, // Adicionado trim para remover espaços em branco
    },
    codigo: {
      type: String,
      required: [true, "O código do curso é obrigatório."],
      unique: true,
      uppercase: true, // Adicionado uppercase para padronizar códigos
      trim: true,
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  }
);

// 3. Exportar o modelo
const Course = model<ICourse>("Course", CourseSchema);
export default Course;
