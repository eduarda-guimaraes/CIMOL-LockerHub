// application/src/lib/services/auth.service.ts
import jwt from "jsonwebtoken";
import User, { IUser } from "@/models/User.model";
import { UserSession } from "@/types";

type RegisterUserDTO = Pick<IUser, "nome" | "email" | "password"> & {
  courseId: string;
};

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserSession;
}

export const registerUser = async (
  userData: RegisterUserDTO
): Promise<IUser> => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("Este email já está cadastrado.");
  }

  const userCount = await User.countDocuments();
  const newUser = new User(userData);

  if (userCount === 0) {
    newUser.role = "admin";
    console.log(
      `Primeiro usuário detectado. Registrando ${newUser.email} como administrador.`
    );
  }

  await newUser.save();
  return newUser;
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
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      nome: user.nome,
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
