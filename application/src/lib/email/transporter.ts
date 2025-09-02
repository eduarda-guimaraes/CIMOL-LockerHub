import "server-only";

let cachedTransporter: import("nodemailer").Transporter | null = null;

export async function getTransporter(): Promise<import("nodemailer").Transporter> {
  if (cachedTransporter) return cachedTransporter;

  // Import dinâmico garante que só será carregado no server
  const nodemailer = await import("nodemailer");

  const host = process.env.MAIL_HOST;
  const port = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : undefined;
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (host && port && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return cachedTransporter;
  }

  // Fallback DEV: Ethereal (sem conta)
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("📧 Usando Ethereal (DEV). Credenciais temporárias criadas.");
  return cachedTransporter;
}
