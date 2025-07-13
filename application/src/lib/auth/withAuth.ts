// application/src/lib/auth/withAuth.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User, { IUser } from "@/models/User.model";
import connectDB from "@/lib/db";

type AuthenticatedRouteHandler<T> = (
  req: NextRequest,
  user: IUser,
  context: T
) => Promise<NextResponse>;

export function withAuth<T>(handler: AuthenticatedRouteHandler<T>) {
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
      };

      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return NextResponse.json(
          { message: "Usuário não encontrado." },
          { status: 401 }
        );
      }

      return handler(req, user, context);
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      return NextResponse.json(
        { message: "Token inválido ou expirado." },
        { status: 401 }
      );
    }
  };
}
