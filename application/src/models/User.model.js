const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome é obrigatório."],
      trim: true,
    },
    curso: {
      type: String,
      required: [true, "O curso é obrigatório."],
      enum: [
        "Eletrônica",
        "Eletrotécnica",
        "Mecânica",
        "Design de móveis",
        "Móveis",
        "Informática",
        "Química",
        "Meio Ambiente",
      ],
    },
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
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "coordinator"],
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
    timestamps: true,
  }
);

// Criptografar a senha antes de salvar
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senhas
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
