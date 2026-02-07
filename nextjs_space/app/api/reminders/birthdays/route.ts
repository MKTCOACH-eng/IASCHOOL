import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { sendBirthdayNotification } from "@/lib/send-notification";

// API para enviar notificaciones de cumpleaños
// Se ejecuta diariamente mediante un scheduled task
export async function POST(request: Request) {
  try {
    // Verificar API key para seguridad (scheduled tasks)
    const authHeader = request.headers.get("authorization");
    const apiKey = process.env.ABACUSAI_API_KEY;
    
    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() devuelve 0-11
    const currentDay = today.getDate();

    // Buscar estudiantes que cumplen años hoy
    const studentsWithBirthday = await prisma.student.findMany({
      where: {
        isActive: true,
        birthDate: {
          not: null,
        },
      },
      include: {
        school: true,
        parents: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tutors: {
          where: {
            isActive: true,
            canReceiveNotifications: true,
          },
          include: {
            tutor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Filtrar solo los que cumplen años hoy
    const birthdayStudents = studentsWithBirthday.filter((student) => {
      if (!student.birthDate) return false;
      const birthDate = new Date(student.birthDate);
      return (
        birthDate.getMonth() + 1 === currentMonth &&
        birthDate.getDate() === currentDay
      );
    });

    const notificationsSent: string[] = [];
    const errors: string[] = [];

    for (const student of birthdayStudents) {
      const studentFullName = `${student.firstName} ${student.lastName}`;
      const birthYear = new Date(student.birthDate!).getFullYear();
      const age = today.getFullYear() - birthYear;
      const schoolName = student.school.name;

      // Set para evitar enviar duplicados al mismo email
      const notifiedEmails = new Set<string>();

      // 1. Notificar a los padres (relación directa)
      for (const parent of student.parents) {
        if (parent.email && !notifiedEmails.has(parent.email)) {
          try {
            await sendBirthdayNotification({
              email: parent.email,
              recipientName: parent.name || "Estimado padre/tutor",
              studentName: studentFullName,
              studentAge: age,
              schoolName,
            });
            notifiedEmails.add(parent.email);
            notificationsSent.push(`${parent.email} (padre de ${studentFullName})`);
          } catch (error) {
            errors.push(`Error notificando a ${parent.email}: ${error}`);
          }
        }
      }

      // 2. Notificar a tutores adicionales (multi-tutor)
      for (const tutorRelation of student.tutors) {
        const tutor = tutorRelation.tutor;
        if (tutor.email && !notifiedEmails.has(tutor.email)) {
          try {
            await sendBirthdayNotification({
              email: tutor.email,
              recipientName: tutor.name || "Estimado tutor",
              studentName: studentFullName,
              studentAge: age,
              schoolName,
            });
            notifiedEmails.add(tutor.email);
            notificationsSent.push(`${tutor.email} (tutor de ${studentFullName})`);
          } catch (error) {
            errors.push(`Error notificando a ${tutor.email}: ${error}`);
          }
        }
      }

      // 3. Si el estudiante tiene cuenta propia, notificarle también
      if (student.user?.email && !notifiedEmails.has(student.user.email)) {
        try {
          await sendBirthdayNotification({
            email: student.user.email,
            recipientName: studentFullName,
            studentName: studentFullName,
            studentAge: age,
            schoolName,
            personalizedMessage: "¡Hoy es tu día especial! Que todos tus sueños se hagan realidad. 🌟",
          });
          notifiedEmails.add(student.user.email);
          notificationsSent.push(`${student.user.email} (estudiante)`);
        } catch (error) {
          errors.push(`Error notificando a ${student.user.email}: ${error}`);
        }
      }
    }

    // Log para auditoría
    console.log(`[Birthday Notifications] ${new Date().toISOString()}`);
    console.log(`  - Estudiantes con cumpleaños hoy: ${birthdayStudents.length}`);
    console.log(`  - Notificaciones enviadas: ${notificationsSent.length}`);
    if (errors.length > 0) {
      console.error(`  - Errores: ${errors.length}`);
    }

    return NextResponse.json({
      success: true,
      date: today.toISOString().split("T")[0],
      birthdaysFound: birthdayStudents.length,
      notificationsSent: notificationsSent.length,
      details: notificationsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error processing birthday notifications:", error);
    return NextResponse.json(
      { error: "Error processing birthday notifications" },
      { status: 500 }
    );
  }
}

// GET para verificar estado y cumpleañeros del día
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    
    const targetDate = date ? new Date(date) : new Date();
    const currentMonth = targetDate.getMonth() + 1;
    const currentDay = targetDate.getDate();

    const studentsWithBirthday = await prisma.student.findMany({
      where: {
        isActive: true,
        birthDate: {
          not: null,
        },
      },
      include: {
        school: {
          select: { name: true },
        },
        group: {
          select: { name: true },
        },
      },
    });

    const birthdayStudents = studentsWithBirthday
      .filter((student) => {
        if (!student.birthDate) return false;
        const birthDate = new Date(student.birthDate);
        return (
          birthDate.getMonth() + 1 === currentMonth &&
          birthDate.getDate() === currentDay
        );
      })
      .map((student) => {
        const birthYear = new Date(student.birthDate!).getFullYear();
        const age = targetDate.getFullYear() - birthYear;
        return {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          age,
          school: student.school.name,
          group: student.group?.name || "Sin grupo",
        };
      });

    return NextResponse.json({
      date: targetDate.toISOString().split("T")[0],
      totalBirthdays: birthdayStudents.length,
      students: birthdayStudents,
    });
  } catch (error) {
    console.error("Error fetching birthdays:", error);
    return NextResponse.json(
      { error: "Error fetching birthdays" },
      { status: 500 }
    );
  }
}
