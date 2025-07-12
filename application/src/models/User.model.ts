// application/src/models/User.model.ts
import { Document, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { ICourse } from "./Course.model";

export interface IUser extends Document {
  nome: string;
  courseId: Schema.Types.ObjectId | ICourse;
  email: string;
  password?: string;
  role: "admin" | "coordinator";
  resetPasswordToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    nome: {
      type: String,
      required: [true, "O nome é obrigatório."],
      trim: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "O curso é obrigatório."],
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
  // --- MODIFICAÇÃO AQUI ---
  // Apenas continue se a senha foi modificada
  if (!this.isModified("password")) return next();

  // Guarda de tipo para garantir que a senha existe antes de hashear
  if (!this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    // Agora o TypeScript sabe que this.password é uma string
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(error);
    } else {
      // Handle the case where error is not an instance of Error
      next(new Error("An unknown error occurred"));
    }
  }
});

// Método para comparar senhas
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // --- MODIFICAÇÃO AQUI ---
  // Adicionamos uma verificação para o caso de a senha não estar presente no documento
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser>("User", UserSchema);
export default User;
