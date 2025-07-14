// application/src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { serialize } from "cookie";

// --- MODIFICAÇÃO AQUI: Implementação da API Route de Logout ---

export async function POST() {
  // Cria um cookie com data de expiração no passado para removê-lo
  const cookie = serialize("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0), // Data no passado
    path: "/",
  });

  return new NextResponse(JSON.stringify({ message: "Logout bem-sucedido!" }), {
    status: 200,
    headers: { "Set-Cookie": cookie },
  });
}
