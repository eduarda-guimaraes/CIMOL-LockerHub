// src/models/Rental.model.js
const mongoose = require("mongoose");

const RentalSchema = new mongoose.Schema(
  {
    lockerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Locker", // Referência ao armário alugado
      required: [true, "O armário é obrigatório."],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // Referência ao estudante que alugou o armário
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
      default: true, // Indica se o aluguel está ativo
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  }
);

module.exports = mongoose.model("Rental", RentalSchema);
