// src/models/Locker.model.js
const mongoose = require("mongoose");

const LockerSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: [true, "O número do armário é obrigatório."],
      unique: true,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "overdue"], // Status pode ser disponível, ocupado ou em atraso
      default: "available",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Referência ao curso relacionado ao armário
      required: [true, "O curso associado ao armário é obrigatório."],
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  }
);

module.exports = mongoose.model("Locker", LockerSchema);