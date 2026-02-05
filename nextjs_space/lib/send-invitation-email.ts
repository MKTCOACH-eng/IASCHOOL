export async function sendInvitationEmail({
  email,
  schoolName,
  schoolCode,
  tempPassword,
  token,
  role,
}: {
  email: string;
  schoolName: string;
  schoolCode: string;
  tempPassword: string;
  token: string;
  role: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL || "";
  const enrollLink = `${baseUrl}/enroll?token=${token}`;

  const getRoleName = (r: string) => {
    switch (r) {
      case "ADMIN": return "Administrador";
      case "PROFESOR": return "Profesor";
      case "PADRE": return "Padre de familia";
      default: return r;
    }
  };

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #1B4079 0%, #4D7C8A 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">IA School</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Plataforma Educativa</p>
      </div>
      
      <div style="background: white; padding: 40px 30px;">
        <h2 style="color: #1B4079; margin: 0 0 20px 0; font-size: 22px;">
          ¡Bienvenido a ${schoolName}!
        </h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Has sido invitado a unirte a la plataforma de <strong>${schoolName}</strong> como <strong>${getRoleName(role)}</strong>.
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          Para activar tu cuenta, necesitarás los siguientes datos:
        </p>
        
        <div style="background: #f1f5f9; border-radius: 12px; padding: 25px; margin: 0 0 30px 0;">
          <div style="margin-bottom: 15px;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Código del colegio</p>
            <p style="color: #1B4079; font-size: 20px; font-weight: 700; margin: 0; font-family: monospace;">${schoolCode}</p>
          </div>
          <div>
            <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Contraseña temporal</p>
            <p style="color: #1B4079; font-size: 20px; font-weight: 700; margin: 0; font-family: monospace;">${tempPassword}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${enrollLink}" style="display: inline-block; background: #1B4079; color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Activar mi cuenta
          </a>
        </div>
        
        <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
          Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
          <a href="${enrollLink}" style="color: #4D7C8A; word-break: break-all;">${enrollLink}</a>
        </p>
      </div>
      
      <div style="background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          Este enlace expira en 7 días. Si tienes problemas, contacta al administrador de tu colegio.
        </p>
        <p style="color: #cbd5e1; font-size: 11px; margin: 15px 0 0 0;">
          Powered by IA School
        </p>
      </div>
    </div>
  `;

  try {
    const appUrl = process.env.NEXTAUTH_URL || "";
    const hostname = appUrl ? new URL(appUrl).hostname : "iaschool.app";

    const response = await fetch("https://apps.abacus.ai/api/sendNotificationEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        app_id: process.env.WEB_APP_ID,
        notification_id: process.env.NOTIF_ID_INVITACIN_DE_USUARIO,
        subject: `Invitación a ${schoolName} - IA School`,
        body: htmlBody,
        is_html: true,
        recipient_email: email,
        sender_email: `noreply@${hostname}`,
        sender_alias: "IA School",
      }),
    });

    const result = await response.json();
    
    if (!result.success && !result.notification_disabled) {
      console.error("Failed to send invitation email:", result);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending invitation email:", error);
    return false;
  }
}
