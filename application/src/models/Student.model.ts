// application/src/models/Student.model.ts
import mongoose, { Document, Schema, model } from "mongoose";
import { ICourse } from "./Course.model";

// --- MODIFICAÇÃO AQUI: Adicionando novos campos à interface ---
export interface IStudent extends Document {
  _id: string;
  nome: string;
  matricula: string;
  course: Schema.Types.ObjectId | ICourse;
  email?: string; // Opcional
  telefone?: string; // Opcional
  createdAt: Date;
  updatedAt: Date;
}

// --- MODIFICAÇÃO AQUI: Atualizando o Schema ---
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
      ref: "Course",
      required: [true, "O curso do estudante é obrigatório."],
    },
    email: {
      type: String,
      unique: true,
      // 'sparse: true' permite múltiplos documentos com valor nulo,
      // mas garante que, se um email for fornecido, ele seja único.
      sparse: true,
      trim: true,
      lowercase: true,
      // Validação de formato de email
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
