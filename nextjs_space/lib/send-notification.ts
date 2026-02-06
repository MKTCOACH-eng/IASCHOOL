// Utility functions for sending email notifications

interface NotificationParams {
  email: string;
  subject: string;
  htmlBody: string;
  notificationId: string;
}

export async function sendNotificationEmail({
  email,
  subject,
  htmlBody,
  notificationId,
}: NotificationParams): Promise<boolean> {
  try {
    const response = await fetch(
      "https://apps.abacus.ai/api/sendNotificationEmail",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deployment_token: process.env.ABACUSAI_API_KEY,
          app_id: process.env.WEB_APP_ID,
          notification_id: notificationId,
          subject,
          html_body: htmlBody,
          to_email: email,
          from_email: `noreply@${new URL(process.env.NEXTAUTH_URL || "http://localhost:3000").hostname}`,
          from_alias: "IA School",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Email notification error:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return false;
  }
}

// Email template wrapper
function emailTemplate(content: string, schoolName: string = "IA School") {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1B4079 0%, #2d5a9e 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${schoolName}</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 12px; margin: 0;">
                    Este correo fue enviado automáticamente por ${schoolName}.
                    <br>Por favor no responda a este correo.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Send notification for new task assigned
export async function sendNewTaskNotification({
  parentEmail,
  parentName,
  studentName,
  taskTitle,
  teacherName,
  subjectName,
  dueDate,
  schoolName,
}: {
  parentEmail: string;
  parentName: string;
  studentName: string;
  taskTitle: string;
  teacherName: string;
  subjectName?: string;
  dueDate?: Date | null;
  schoolName: string;
}): Promise<boolean> {
  const dueDateStr = dueDate
    ? new Date(dueDate).toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Sin fecha límite";

  const content = `
    <h2 style="color: #1B4079; margin: 0 0 20px 0; font-size: 20px;">Nueva tarea asignada</h2>
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hola <strong>${parentName}</strong>,
    </p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Se ha asignado una nueva tarea a <strong>${studentName}</strong>:
    </p>
    <div style="background-color: #f0f9ff; border-left: 4px solid #1B4079; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h3 style="color: #1B4079; margin: 0 0 10px 0; font-size: 18px;">${taskTitle}</h3>
      ${subjectName ? `<p style="color: #6b7280; margin: 5px 0;"><strong>Materia:</strong> ${subjectName}</p>` : ""}
      <p style="color: #6b7280; margin: 5px 0;"><strong>Profesor:</strong> ${teacherName}</p>
      <p style="color: #6b7280; margin: 5px 0;"><strong>Fecha de entrega:</strong> ${dueDateStr}</p>
    </div>
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
      Ingresa a la plataforma para ver los detalles y entregar la tarea.
    </p>
    <a href="${process.env.NEXTAUTH_URL}/tasks" style="display: inline-block; background-color: #1B4079; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 10px;">Ver Tarea</a>
  `;

  return sendNotificationEmail({
    email: parentEmail,
    subject: `Nueva tarea para ${studentName}: ${taskTitle}`,
    htmlBody: emailTemplate(content, schoolName),
    notificationId: process.env.NOTIF_ID_NUEVA_TAREA_ASIGNADA || "",
  });
}

// Send notification for graded task
export async function sendTaskGradedNotification({
  parentEmail,
  parentName,
  studentName,
  taskTitle,
  score,
  maxScore,
  feedback,
  schoolName,
}: {
  parentEmail: string;
  parentName: string;
  studentName: string;
  taskTitle: string;
  score: number;
  maxScore: number;
  feedback?: string | null;
  schoolName: string;
}): Promise<boolean> {
  const percentage = Math.round((score / maxScore) * 100);
  const scoreColor = percentage >= 70 ? "#16a34a" : percentage >= 50 ? "#ca8a04" : "#dc2626";

  const content = `
    <h2 style="color: #1B4079; margin: 0 0 20px 0; font-size: 20px;">Tarea calificada</h2>
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hola <strong>${parentName}</strong>,
    </p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      La tarea de <strong>${studentName}</strong> ha sido calificada:
    </p>
    <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center;">
      <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">${taskTitle}</h3>
      <div style="font-size: 48px; font-weight: 700; color: ${scoreColor}; margin: 10px 0;">
        ${score}<span style="font-size: 24px; color: #6b7280;">/${maxScore}</span>
      </div>
      <p style="color: #6b7280; margin: 5px 0;">${percentage}%</p>
    </div>
    ${feedback ? `
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="color: #92400e; margin: 0; font-size: 14px;"><strong>Retroalimentación del profesor:</strong></p>
        <p style="color: #78350f; margin: 10px 0 0 0;">${feedback}</p>
      </div>
    ` : ""}
    <a href="${process.env.NEXTAUTH_URL}/tasks" style="display: inline-block; background-color: #1B4079; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 10px;">Ver Detalles</a>
  `;

  return sendNotificationEmail({
    email: parentEmail,
    subject: `Calificación de ${studentName}: ${taskTitle} - ${score}/${maxScore}`,
    htmlBody: emailTemplate(content, schoolName),
    notificationId: process.env.NOTIF_ID_TAREA_CALIFICADA || "",
  });
}

// Send notification for payment due soon
export async function sendPaymentDueNotification({
  parentEmail,
  parentName,
  studentName,
  concept,
  amount,
  dueDate,
  schoolName,
}: {
  parentEmail: string;
  parentName: string;
  studentName: string;
  concept: string;
  amount: number;
  dueDate: Date;
  schoolName: string;
}): Promise<boolean> {
  const dueDateStr = new Date(dueDate).toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const content = `
    <h2 style="color: #1B4079; margin: 0 0 20px 0; font-size: 20px;">Recordatorio de pago</h2>
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hola <strong>${parentName}</strong>,
    </p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Le recordamos que tiene un pago próximo a vencer para <strong>${studentName}</strong>:
    </p>
    <div style="background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 25px; margin: 20px 0;">
      <h3 style="color: #991b1b; margin: 0 0 15px 0; font-size: 18px;">${concept}</h3>
      <div style="display: flex; justify-content: space-between; margin-top: 15px;">
        <div>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">Monto:</p>
          <p style="color: #1B4079; margin: 5px 0 0 0; font-size: 28px; font-weight: 700;">$${amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
        <div style="text-align: right;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">Fecha límite:</p>
          <p style="color: #dc2626; margin: 5px 0 0 0; font-size: 16px; font-weight: 600;">${dueDateStr}</p>
        </div>
      </div>
    </div>
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
      Por favor realice su pago antes de la fecha límite para evitar recargos.
    </p>
    <a href="${process.env.NEXTAUTH_URL}/payments" style="display: inline-block; background-color: #1B4079; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 10px;">Ver Pagos</a>
  `;

  return sendNotificationEmail({
    email: parentEmail,
    subject: `⚠️ Recordatorio: ${concept} - Vence ${dueDateStr}`,
    htmlBody: emailTemplate(content, schoolName),
    notificationId: process.env.NOTIF_ID_PAGO_PRXIMO_A_VENCER || "",
  });
}

// Send notification for important announcement
export async function sendAnnouncementNotification({
  parentEmail,
  parentName,
  title,
  content: announcementContent,
  priority,
  schoolName,
}: {
  parentEmail: string;
  parentName: string;
  title: string;
  content: string;
  priority: "NORMAL" | "URGENT";
  schoolName: string;
}): Promise<boolean> {
  const isUrgent = priority === "URGENT";
  const bgColor = isUrgent ? "#fef2f2" : "#f0fdf4";
  const borderColor = isUrgent ? "#dc2626" : "#16a34a";
  const labelColor = isUrgent ? "#991b1b" : "#166534";

  const emailContent = `
    <h2 style="color: #1B4079; margin: 0 0 20px 0; font-size: 20px;">
      ${isUrgent ? "🚨 " : "📢 "}Nuevo anuncio del colegio
    </h2>
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hola <strong>${parentName}</strong>,
    </p>
    <div style="background-color: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      ${isUrgent ? `<span style="background-color: #dc2626; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">URGENTE</span>` : ""}
      <h3 style="color: ${labelColor}; margin: ${isUrgent ? "15px" : "0"} 0 10px 0; font-size: 18px;">${title}</h3>
      <p style="color: #374151; margin: 0; line-height: 1.6; white-space: pre-wrap;">${announcementContent}</p>
    </div>
    <a href="${process.env.NEXTAUTH_URL}/announcements" style="display: inline-block; background-color: #1B4079; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 10px;">Ver Anuncios</a>
  `;

  return sendNotificationEmail({
    email: parentEmail,
    subject: `${isUrgent ? "🚨 URGENTE: " : ""}${title}`,
    htmlBody: emailTemplate(emailContent, schoolName),
    notificationId: process.env.NOTIF_ID_NUEVO_ANUNCIO_IMPORTANTE || "",
  });
}
