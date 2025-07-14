// application/src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { loginUser } from "@/lib/services/auth.service";
import { z } from "zod";
import { serialize } from "cookie";

const loginSchema = z.object({
  email: z.string().email("Formato de email inválido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Dados de entrada inválidos.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const { accessToken, refreshToken, user } = await loginUser(
      email,
      password
    );

    const cookie = serialize("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });

    return new NextResponse(
      JSON.stringify({
        message: "Login bem-sucedido!",
        accessToken,
        user, // O objeto 'user' agora vem no formato correto do serviço
      }),
      {
        status: 200,
        headers: { "Set-Cookie": cookie },
      }
    );
  } catch (error) {
    console.error("Erro na rota /api/auth/login:", error);

    if (
      error instanceof Error &&
      error.message.includes("Credenciais inválidas")
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Ocorreu um erro interno no servidor." },
      { status: 500 }
    );
  }
}
