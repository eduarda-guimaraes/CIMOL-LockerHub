import crypto from "crypto";
import bcrypt from "bcryptjs";
import PasswordReset from "@/models/PasswordReset.model";
import User from "@/models/User.model";
import { getTransporter } from "@/lib/email/transporter";
import { resetPasswordHtml, resetPasswordText } from "@/lib/email/templates";
import nodemailer from "nodemailer";

// helpers sem libs externas
function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}
function isBefore(a: Date, b: Date) {
  return a.getTime() < b.getTime();
}

export async function createPasswordReset(email: string, baseUrl: string) {
  const user = await User.findOne({ email }).select("_id email");
  if (!user) return; // não revelar existência

  // invalida tokens antigos válidos
  await PasswordReset.updateMany(
    { userId: user._id, used: false, expiresAt: { $gt: new Date() } },
    { $set: { used: true } }
  );

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = addHours(new Date(), 1);

  await PasswordReset.create({ userId: user._id, token, expiresAt, used: false });

  const appUrl = baseUrl.replace(/\/+$/, "");
  const link = `${appUrl}/recuperar-senha/${token}`;

  const transporter = await getTransporter();
  const from = process.env.MAIL_FROM || "LockerHub <no-reply@lockerhub.local>";

  const info = await transporter.sendMail({
    from,
    to: user.email,
    subject: "Redefinição de senha - CIMOL LockerHub",
    text: resetPasswordText(link),
    html: resetPasswordHtml(link),
  });

  // Se estiver em Ethereal, loga a URL de preview
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log("🔗 Preview Ethereal:", preview);
  } else {
    console.log("📨 E-mail de redefinição enviado para:", user.email);
  }

  return link;
}

export async function resetPasswordByToken(token: string, newPassword: string) {
  const pr = await PasswordReset.findOne({ token });
  if (!pr || pr.used || isBefore(pr.expiresAt, new Date())) {
    throw new Error("Token inválido ou expirado.");
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ _id: pr.userId }, { $set: { password: hash } });

  pr.used = true;
  await pr.save();
}
