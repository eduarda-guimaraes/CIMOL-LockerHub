// application/src/lib/services/user.service.ts
import User, { IUser } from "@/models/User.model";

// --- MODIFICAÇÃO AQUI: Tipando o retorno da função ---

// Tipo para o usuário sem a senha
type SanitizedUser = Omit<IUser, "password" | "comparePassword">;

export const getAllUsers = async (): Promise<SanitizedUser[]> => {
  // O '-password' já remove a senha, mas a tipagem garante o contrato.
  const users = await User.find({}).select("-password").lean();
  return users as SanitizedUser[];
};
