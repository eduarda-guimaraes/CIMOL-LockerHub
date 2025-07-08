const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Definição do esquema de Usuário
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
      select: false, // Impede que a senha seja retornada nas consultas por padrão
    },
    role: {
      type: String,
      enum: ["admin", "coordinator"], // Definindo as permissões
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
    timestamps: true, // Garante que os campos createdAt e updatedAt sejam criados automaticamente
  }
);

// Middleware de Mongoose: Criptografar a senha antes de salvar
UserSchema.pre("save", async function (next) {
  // Verifica se a senha foi modificada ou é nova
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12); // Gerar o salt
    this.password = await bcrypt.hash(this.password, salt); // Criptografar a senha
    next();
  } catch (error) {
    next(error); // Se houver erro, passa para o próximo middleware
  }
});

// Método para comparar senhas durante o login
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
