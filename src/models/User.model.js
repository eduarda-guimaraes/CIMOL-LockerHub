// CIMOL-LockerHub/src/models/User.model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "O email é obrigatório."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, "Por favor, insira um email válido."],
    },
    password: {
      type: String,
      required: [true, "A senha é obrigatória."],
      minlength: [8, "A senha deve ter no mínimo 8 caracteres."],
      select: false, // Impede que a senha seja retornada em queries por padrão
    },
    role: {
      type: String,
      enum: ["admin", "coordinator"], // Conforme a documentação principal do projeto
      default: "coordinator",
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetTokenExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // Adiciona os campos createdAt e updatedAt automaticamente
  }
);

// Middleware (hook) do Mongoose que roda ANTES de salvar o documento
UserSchema.pre("save", async function (next) {
  // Roda esta função apenas se a senha foi modificada (ou é nova)
  if (!this.isModified("password")) {
    return next();
  }

  // Gera o hash da senha com um custo de processamento de 12
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", UserSchema);
