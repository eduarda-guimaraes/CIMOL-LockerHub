// src/models/Course.model.js
const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome do curso é obrigatório."],
    },
    codigo: {
      type: String,
      required: [true, "O código do curso é obrigatório."],
      unique: true,
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  }
);

module.exports = mongoose.model("Course", CourseSchema);