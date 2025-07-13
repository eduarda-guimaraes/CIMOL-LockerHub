// application/src/lib/auth/withAdminAuth.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User, { IUser } from "@/models/User.model";
import connectDB from "@/lib/db";

// --- MODIFICAÇÃO AQUI: Tornando o handler genérico e buscando o usuário ---
type RouteHandler<T> = (
  req: NextRequest,
  user: IUser,
  context: T
) => Promise<NextResponse>;

export function withAdminAuth<T>(handler: RouteHandler<T>) {
  return async (req: NextRequest, context: T) => {
    try {
      await connectDB();
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { message: "Token de autenticação não fornecido." },
          { status: 401 }
        );
      }

      const token = authHeader.split(" ")[1];
      if (!process.env.JWT_SECRET) {
        throw new Error("Chave JWT não configurada no ambiente.");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: string;
        role: "admin" | "coordinator";
      };

      if (decoded.role !== "admin") {
        return NextResponse.json(
          { message: "Acesso proibido. Requer privilégios de administrador." },
          { status: 403 }
        );
      }

      // Buscar o usuário no banco para passar o documento completo
      const adminUser = await User.findById(decoded.userId);
      if (!adminUser) {
        return NextResponse.json(
          { message: "Usuário administrador não encontrado." },
          { status: 401 }
        );
      }

      return handler(req, adminUser, context);
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      return NextResponse.json(
        { message: "Token inválido ou expirado." },
        { status: 401 }
      );
    }
  };
}
