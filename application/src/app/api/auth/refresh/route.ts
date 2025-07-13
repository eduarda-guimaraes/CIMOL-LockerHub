// application/src/app/api/auth/refresh/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User.model";
import connectDB from "@/lib/db";

export async function POST() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token não encontrado." },
        { status: 401 }
      );
    }

    if (!process.env.JWT_REFRESH_SECRET || !process.env.JWT_SECRET) {
      throw new Error("Chaves JWT não configuradas no ambiente.");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    ) as { userId: string };

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const newAccessToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return NextResponse.json(
      {
        accessToken: newAccessToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro na rota /api/auth/refresh:", error);
    return NextResponse.json(
      { message: "Sessão inválida ou expirada." },
      { status: 401 }
    );
  }
}
