/**
 * Script: Recordatorios de Pago - IA School
 * Envía emails a padres cuando un cargo está próximo a vencer (3 días antes)
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para enviar email de notificación
async function sendPaymentNotification(params: {
  parentEmail: string;
  parentName: string;
  studentName: string;
  concept: string;
  amount: number;
  dueDate: Date;
  schoolName: string;
}): Promise<boolean> {
  const dueDateStr = new Date(params.dueDate).toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const htmlBody = `
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
              <tr>
                <td style="background: linear-gradient(135deg, #1B4079 0%, #2d5a9e 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${params.schoolName}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1B4079; margin: 0 0 20px 0; font-size: 20px;">Recordatorio de pago</h2>
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hola <strong>${params.parentName}</strong>,
                  </p>
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Le recordamos que tiene un pago próximo a vencer para <strong>${params.studentName}</strong>:
                  </p>
                  <div style="background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 25px; margin: 20px 0;">
                    <h3 style="color: #991b1b; margin: 0 0 15px 0; font-size: 18px;">${params.concept}</h3>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Monto:</p>
                    <p style="color: #1B4079; margin: 5px 0 0 0; font-size: 28px; font-weight: 700;">$${params.amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
                    <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 14px;">Fecha límite:</p>
                    <p style="color: #dc2626; margin: 5px 0 0 0; font-size: 16px; font-weight: 600;">${dueDateStr}</p>
                  </div>
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                    Por favor realice su pago antes de la fecha límite para evitar recargos.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 12px; margin: 0;">
                    Este correo fue enviado automáticamente por ${params.schoolName}.<br>Por favor no responda a este correo.
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

  try {
    const response = await fetch("https://apps.abacus.ai/api/sendNotificationEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        app_id: process.env.WEB_APP_ID,
        notification_id: process.env.NOTIF_ID_PAGO_PRXIMO_A_VENCER,
        subject: `⚠️ Recordatorio: ${params.concept} - Vence ${dueDateStr}`,
        html_body: htmlBody,
        to_email: params.parentEmail,
        from_email: "noreply@iaschool.app",
        from_alias: "IA School",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Error enviando a ${params.parentEmail}:`, error);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Error enviando a ${params.parentEmail}:`, error);
    return false;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log(`[${new Date().toISOString()}] Iniciando recordatorios de pago...`);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  threeDaysLater.setHours(23, 59, 59, 999);

  console.log(`Buscando cargos con vencimiento entre ${today.toISOString()} y ${threeDaysLater.toISOString()}`);

  // Consultar cargos próximos a vencer con datos de estudiante, padres y escuela
  const charges = await prisma.charge.findMany({
    where: {
      status: { in: ['PENDIENTE', 'PARCIAL'] },
      dueDate: {
        gte: today,
        lte: threeDaysLater,
      },
    },
    include: {
      student: {
        include: {
          parents: true,
          school: true,
        },
      },
      school: true,
    },
  });

  console.log(`Encontrados ${charges.length} cargos próximos a vencer`);

  let successCount = 0;
  let errorCount = 0;
  const results: Array<{
    chargeId: string;
    studentName: string;
    parentEmail: string;
    status: string;
    error?: string;
  }> = [];

  for (const charge of charges) {
    const studentName = `${charge.student.firstName} ${charge.student.lastName}`;
    const schoolName = charge.school.name;
    const remainingAmount = charge.amount - charge.amountPaid;

    // Enviar a cada padre del estudiante
    for (const parent of charge.student.parents) {
      const parentName = parent.name || 'Padre/Tutor';
      
      console.log(`Enviando recordatorio a ${parent.email} para cargo ${charge.concept}`);
      
      const success = await sendPaymentNotification({
        parentEmail: parent.email,
        parentName,
        studentName,
        concept: charge.concept,
        amount: remainingAmount,
        dueDate: charge.dueDate,
        schoolName,
      });

      results.push({
        chargeId: charge.id,
        studentName,
        parentEmail: parent.email,
        status: success ? 'SUCCESS' : 'ERROR',
      });

      if (success) {
        successCount++;
        console.log(`✓ Enviado exitosamente a ${parent.email}`);
      } else {
        errorCount++;
        console.log(`✗ Error enviando a ${parent.email}`);
      }

      // Pequeña pausa entre envíos para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`Resumen: ${successCount} enviados, ${errorCount} errores`);
  console.log(`[${new Date().toISOString()}] Tarea completada`);
  console.log("=".repeat(60));

  await prisma.$disconnect();
  
  return { success: successCount, errors: errorCount, details: results };
}

main()
  .then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error("Error fatal:", error);
    process.exit(1);
  });
