// application/src/models/Rental.model.ts
import mongoose, { Document, Schema, model } from "mongoose";
import { ILocker } from "./Locker.model";
import { IStudent } from "./Student.model";
import "./Locker.model"; // --- MODIFICAÇÃO AQUI: Garante que o modelo Locker seja registrado
import "./Student.model"; // --- MODIFICAÇÃO AQUI: Garante que o modelo Student seja registrado

export interface IRental extends Document {
  lockerId: Schema.Types.ObjectId | ILocker;
  studentId: Schema.Types.ObjectId | IStudent;
  datas: {
    inicio: Date;
    prevista: Date;
    real?: Date;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RentalSchema = new Schema<IRental>(
  {
    lockerId: {
      type: Schema.Types.ObjectId,
      ref: "Locker", // Precisa do modelo 'Locker'
      required: [true, "O armário é obrigatório."],
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student", // Precisa do modelo 'Student'
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

const Rental = mongoose.models.Rental || model<IRental>("Rental", RentalSchema);
export default Rental;
