// application/src/models/Rental.model.ts
import { Document, Schema, model } from "mongoose";
import { ILocker } from "./Locker.model"; // Importa a interface do Locker
import { IStudent } from "./Student.model"; // Importa a interface do Student

// 1. Interface para o documento Rental
export interface IRental extends Document {
  lockerId: Schema.Types.ObjectId | ILocker; // Referência ao ID do armário ou ao objeto populado
  studentId: Schema.Types.ObjectId | IStudent; // Referência ao ID do estudante ou ao objeto populado
  datas: {
    inicio: Date;
    prevista: Date;
    real?: Date; // Opcional, pois só existe após a devolução
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Schema do Mongoose
const RentalSchema = new Schema<IRental>(
  {
    lockerId: {
      type: Schema.Types.ObjectId,
      ref: "Locker",
      required: [true, "O armário é obrigatório."],
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "O estudante é obrigatório."],
    },
    datas: {
      inicio: {
        type: Date,
        required: [true, "A data de início é obrigatória."],
      },
      prevista: {
        type: Date,
        required: [true, "A data prevista é obrigatória."],
      },
      real: {
        type: Date,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// 3. Exportar o modelo
const Rental = model<IRental>("Rental", RentalSchema);
export default Rental;
