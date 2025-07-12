// application/src/lib/services/auth.service.ts
import jwt from "jsonwebtoken";
import User, { IUser } from "@/models/User.model";
import { Types } from "mongoose";

// --- MODIFICAÇÃO AQUI: Ajustando o tipo de entrada para aceitar string ---
// Este é o "Data Transfer Object" (DTO) para registro.
// Ele representa os dados que vêm da camada de API.
type RegisterUserDTO = Pick<IUser, "nome" | "email" | "password"> & {
  courseId: string; // A API nos envia uma string, não um ObjectId.
};

// O tipo de usuário que retornamos para o cliente (sem dados sensíveis).
type SanitizedUser = Omit<IUser, "password" | "comparePassword">;

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: "admin" | "coordinator";
  };
}

export const registerUser = async (
  userData: RegisterUserDTO
): Promise<SanitizedUser> => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("Este email já está cadastrado.");
  }

  const userCount = await User.countDocuments();
  // Mongoose converte a string 'courseId' para ObjectId automaticamente.
  const newUser = new User(userData);

  if (userCount === 0) {
    newUser.role = "admin";
    console.log(
      `Primeiro usuário detectado. Registrando ${newUser.email} como administrador.`
    );
  }

  await newUser.save();

  // --- MODIFICAÇÃO AQUI: Tipando toObject() para remover 'any' ---
  const userObject = newUser.toObject<IUser>();
  delete userObject.password; // Agora podemos deletar a senha sem 'any'
  return userObject;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Credenciais inválidas");
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new Error("Credenciais inválidas");
  }

  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("Chaves JWT não configuradas no ambiente.");
  }

  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return {
    accessToken,
    refreshToken,
    // --- MODIFICAÇÃO AQUI: Resolvendo o erro 'unknown' de forma robusta ---
    user: {
      id: (user._id as Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
    },
  };
};

export const refreshAccessToken = async (
  token: string
): Promise<{ accessToken: string }> => {
  if (!token) {
    throw new Error("Refresh token não fornecido.");
  }
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("Chaves JWT não configuradas no ambiente.");
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET) as {
    userId: string;
    role: string;
  };

  const newAccessToken = jwt.sign(
    { userId: decoded.userId, role: decoded.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  return { accessToken: newAccessToken };
};
