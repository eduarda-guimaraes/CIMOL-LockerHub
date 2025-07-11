// src/models/Student.model.js
const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome do estudante é obrigatório."],
    },
    matricula: {
      type: String,
      required: [true, "A matrícula do estudante é obrigatória."],
      unique: true,
    },
    curso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Referência ao curso do estudante
      required: [true, "O curso do estudante é obrigatório."],
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  }
);

module.exports = mongoose.model("Student", StudentSchema);