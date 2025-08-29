export function resetPasswordHtml(link: string) {
  return `
  <div style="font-family: Arial, sans-serif; line-height:1.5; color:#111">
    <h2>Redefinição de senha</h2>
    <p>Recebemos uma solicitação para redefinir sua senha no <strong>CIMOL LockerHub</strong>.</p>
    <p>Clique no botão abaixo para criar uma nova senha:</p>
    <p>
      <a href="${link}"
         style="display:inline-block;background:#153e90;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">
        Redefinir senha
      </a>
    </p>
    <p style="font-size:12px;color:#666;margin-top:16px">
      Este link expira em 1 hora. Se você não solicitou, ignore este e-mail.
    </p>
  </div>`;
}

export function resetPasswordText(link: string) {
  // versão texto (clientes que não renderizam HTML ainda precisam de um fallback)
  return `Redefinição de senha - CIMOL LockerHub

Para redefinir, acesse: ${link}

O link expira em 1 hora. Se não foi você, ignore este e-mail.`;
}
