import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import { resetPasswordByToken } from "@/lib/services/passwordReset";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(1, "Token obrigatório."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

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

    const { token, password } = parsed.data;
    await resetPasswordByToken(token, password);

    return NextResponse.json({ message: "Senha redefinida com sucesso!" }, { status: 200 });
  } catch (err: unknown) {
    // type narrowing seguro
    let message = "Erro ao redefinir a senha.";
    if (err instanceof Error) {
      if (/Token inválido|expirado/i.test(err.message)) {
        message = err.message;
      }
    }
    return NextResponse.json({ message }, { status: 400 });
  }
}
