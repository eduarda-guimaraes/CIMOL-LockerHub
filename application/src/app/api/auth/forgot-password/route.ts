import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import { createPasswordReset } from "@/lib/services/passwordReset";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email("Email inválido.") });

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos.", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.APP_URL ??
      `${req.nextUrl.protocol}//${req.headers.get("host") ?? ""}`;

    const link = await createPasswordReset(parsed.data.email, baseUrl);

    // Nunca revelar se o email existe.
    // Em DEV, devolvemos também o link para facilitar testes locais.
    const payload: Record<string, unknown> = {
      message: "Se o email existir, enviaremos um link de redefinição.",
    };
    if (process.env.NODE_ENV !== "production" && link) {
      payload.devLink = link;
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (e) {
    console.error("Erro em /api/auth/forgot-password:", e);
    return NextResponse.json({ message: "Erro interno no servidor." }, { status: 500 });
  }
}
