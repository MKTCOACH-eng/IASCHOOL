import { PrismaClient, Role, Priority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data in correct order
  await prisma.payment.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.eventAttendee.deleteMany();
  await prisma.event.deleteMany();
  await prisma.submissionAttachment.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.taskAttachment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.messageReaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.student.deleteMany();
  await prisma.group.deleteMany();
  await prisma.announcementRead.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.user.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.school.deleteMany();

  // Create Vermont School
  const school = await prisma.school.create({
    data: {
      name: "Vermont School",
      code: "VERMONT2026",
      logoUrl: "/vermont-logo.svg",
      primaryColor: "#1B4079",
      isActive: true,
    },
  });
  console.log("Created school:", school.name, "Code:", school.code);

  // Hash passwords
  const adminPassword = await bcrypt.hash("admin123", 10);
  const padrePassword = await bcrypt.hash("padre123", 10);
  const testPassword = await bcrypt.hash("johndoe123", 10);

  // Create admin user (test account)
  const testAdmin = await prisma.user.create({
    data: {
      email: "john@doe.com",
      password: testPassword,
      name: "John Doe",
      role: Role.ADMIN,
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@vermontschool.edu",
      password: adminPassword,
      name: "Director García",
      role: Role.ADMIN,
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });
  console.log("Created admin:", admin.name);

  // Create padre users
  const maria = await prisma.user.create({
    data: {
      email: "maria.lopez@email.com",
      password: padrePassword,
      name: "María López",
      role: Role.PADRE,
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });

  const juan = await prisma.user.create({
    data: {
      email: "juan.martinez@email.com",
      password: padrePassword,
      name: "Juan Martínez",
      role: Role.PADRE,
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });

  const ana = await prisma.user.create({
    data: {
      email: "ana.rodriguez@email.com",
      password: padrePassword,
      name: "Ana Rodríguez",
      role: Role.PADRE,
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });
  console.log("Created 3 padres");

  // Create announcements
  const now = new Date();
  
  const announcement1 = await prisma.announcement.create({
    data: {
      schoolId: school.id,
      title: "Bienvenida al ciclo escolar 2026",
      content: "Estimadas familias, les damos la más cordial bienvenida al nuevo ciclo escolar 2026. Estamos emocionados de iniciar este nuevo año lleno de aprendizajes y experiencias. Les recordamos que las clases inician el día 3 de febrero. ¡Nos vemos pronto!",
      priority: Priority.NORMAL,
      createdById: admin.id,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  const announcement2 = await prisma.announcement.create({
    data: {
      schoolId: school.id,
      title: "Reunión de padres - Viernes 14 de Febrero",
      content: "IMPORTANTE: Se convoca a todos los padres de familia a la reunión general que se llevará a cabo el viernes 14 de febrero a las 5:00 PM en el auditorio principal. Se tratarán temas importantes sobre el reglamento y actividades del semestre. Su asistencia es indispensable.",
      priority: Priority.URGENT,
      createdById: admin.id,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  const announcement3 = await prisma.announcement.create({
    data: {
      schoolId: school.id,
      title: "Recordatorio: Pago de colegiatura",
      content: "Les recordamos que el periodo de pago de colegiatura del mes de febrero vence el día 10. Pueden realizar su pago en las oficinas administrativas de 8:00 AM a 3:00 PM o mediante transferencia bancaria. Para dudas, comunicarse a administración.",
      priority: Priority.NORMAL,
      createdById: admin.id,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  const announcement4 = await prisma.announcement.create({
    data: {
      schoolId: school.id,
      title: "Suspensión de clases por día festivo",
      content: "AVISO IMPORTANTE: Les informamos que el próximo lunes 10 de febrero no habrá clases debido al día festivo oficial. Las actividades escolares se reanudarán el martes 11 de febrero en horario normal.",
      priority: Priority.URGENT,
      createdById: admin.id,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  const announcement5 = await prisma.announcement.create({
    data: {
      schoolId: school.id,
      title: "Torneo deportivo interescolar",
      content: "Con mucho gusto les informamos que el próximo sábado 15 de febrero se llevará a cabo el Torneo Deportivo Interescolar. Nuestros estudiantes participarán en fútbol, basquetbol y voleibol. ¡Los invitamos a asistir y apoyar a nuestros equipos!",
      priority: Priority.NORMAL,
      createdById: admin.id,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
  });

  const announcement6 = await prisma.announcement.create({
    data: {
      schoolId: school.id,
      title: "Actualización del reglamento escolar",
      content: "Estimados padres de familia, les informamos que se ha actualizado el reglamento escolar para el ciclo 2026. Pueden consultar la versión completa en nuestra plataforma o solicitar una copia impresa en dirección. Los cambios principales se comunicarán en la próxima reunión.",
      priority: Priority.NORMAL,
      createdById: admin.id,
      createdAt: now,
    },
  });
  console.log("Created 6 announcements");

  // Create varied read statuses
  // Maria has read announcements 1, 2, 3
  await prisma.announcementRead.createMany({
    data: [
      { announcementId: announcement1.id, userId: maria.id },
      { announcementId: announcement2.id, userId: maria.id },
      { announcementId: announcement3.id, userId: maria.id },
    ],
  });

  // Juan has read announcements 1, 4
  await prisma.announcementRead.createMany({
    data: [
      { announcementId: announcement1.id, userId: juan.id },
      { announcementId: announcement4.id, userId: juan.id },
    ],
  });

  // Ana has read all announcements except 5 and 6
  await prisma.announcementRead.createMany({
    data: [
      { announcementId: announcement1.id, userId: ana.id },
      { announcementId: announcement2.id, userId: ana.id },
      { announcementId: announcement3.id, userId: ana.id },
      { announcementId: announcement4.id, userId: ana.id },
    ],
  });
  console.log("Created read statuses");

  // Create profesores
  const profesorPassword = await bcrypt.hash("profesor123", 10);

  const profesorMath = await prisma.user.create({
    data: {
      email: "prof.sanchez@vermontschool.edu",
      password: profesorPassword,
      name: "Laura Sánchez",
      role: Role.PROFESOR,
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });

  const profesorSpanish = await prisma.user.create({
    data: {
      email: "prof.ramirez@vermontschool.edu",
      password: profesorPassword,
      name: "Carlos Ramírez",
      role: Role.PROFESOR,
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });
  console.log("Created 2 profesores");

  // Create groups
  const group3A = await prisma.group.create({
    data: {
      name: "3ro Primaria A",
      grade: "3ro Primaria",
      section: "A",
      schoolId: school.id,
      teacherId: profesorMath.id,
    },
  });

  const group3B = await prisma.group.create({
    data: {
      name: "3ro Primaria B",
      grade: "3ro Primaria",
      section: "B",
      schoolId: school.id,
      teacherId: profesorSpanish.id,
    },
  });
  console.log("Created 2 groups");

  // Create students
  const sofia = await prisma.student.create({
    data: {
      firstName: "Sofía",
      lastName: "López",
      schoolId: school.id,
      groupId: group3A.id,
      parents: { connect: [{ id: maria.id }] },
    },
  });

  const carlos = await prisma.student.create({
    data: {
      firstName: "Carlos",
      lastName: "Martínez",
      schoolId: school.id,
      groupId: group3A.id,
      parents: { connect: [{ id: juan.id }] },
    },
  });

  const mariana = await prisma.student.create({
    data: {
      firstName: "Mariana",
      lastName: "Rodríguez",
      schoolId: school.id,
      groupId: group3B.id,
      parents: { connect: [{ id: ana.id }] },
    },
  });
  console.log("Created 3 students");

  // Create subjects
  const mathSubject = await prisma.subject.create({
    data: {
      name: "Matemáticas",
      color: "#3B82F6",
      schoolId: school.id,
    },
  });

  const spanishSubject = await prisma.subject.create({
    data: {
      name: "Español",
      color: "#EF4444",
      schoolId: school.id,
    },
  });

  const scienceSubject = await prisma.subject.create({
    data: {
      name: "Ciencias Naturales",
      color: "#22C55E",
      schoolId: school.id,
    },
  });

  const historySubject = await prisma.subject.create({
    data: {
      name: "Historia",
      color: "#F59E0B",
      schoolId: school.id,
    },
  });
  console.log("Created 4 subjects");

  // Create sample tasks
  const task1 = await prisma.task.create({
    data: {
      title: "Ejercicios de multiplicación - Capítulo 3",
      description: "Resolver los ejercicios del capítulo 3 del libro de matemáticas.",
      instructions: "1. Resolver los ejercicios 1 al 15 de la página 45.\n2. Mostrar todos los procedimientos.\n3. Verificar las respuestas con la calculadora.",
      status: "PUBLISHED",
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 días
      publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      groupId: group3A.id,
      teacherId: profesorMath.id,
      subjectId: mathSubject.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Lectura comprensiva - Cuento 'El principito'",
      description: "Leer el capítulo 5 de El Principito y responder las preguntas.",
      instructions: "1. Leer el capítulo 5 completo.\n2. Responder las 10 preguntas del anexo.\n3. Escribir un pequeño resumen de 5 líneas.",
      status: "PUBLISHED",
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 días
      publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      groupId: group3B.id,
      teacherId: profesorSpanish.id,
      subjectId: spanishSubject.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Proyecto: El sistema solar",
      description: "Elaborar una maqueta o dibujo del sistema solar.",
      instructions: "Pueden usar materiales reciclados para la maqueta o dibujar en una cartulina.\nDeben incluir todos los planetas con sus nombres.",
      status: "DRAFT",
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 días
      maxScore: 100,
      groupId: group3A.id,
      teacherId: profesorMath.id,
      subjectId: scienceSubject.id,
    },
  });
  console.log("Created 3 tasks");

  // Create sample conversations
  // Conversation: María with Profesora Laura
  const conv1 = await prisma.conversation.create({
    data: {
      type: "DIRECT",
      schoolId: school.id,
      participants: {
        create: [
          { userId: maria.id },
          { userId: profesorMath.id },
        ],
      },
      lastMessageAt: now,
    },
  });

  // Add sample messages
  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: maria.id,
      content: "Buenos días profesora, ¿cómo está Sofía en la clase de matemáticas?",
      createdAt: new Date(now.getTime() - 60 * 60 * 1000),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: profesorMath.id,
      content: "¡Buenos días! Sofía está muy bien, participa mucho en clase y ha mejorado en las operaciones básicas. 👍",
      createdAt: new Date(now.getTime() - 30 * 60 * 1000),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: maria.id,
      content: "¡Qué bueno escuchar eso! Gracias por la información.",
      createdAt: now,
    },
  });

  // Conversation: Juan with Admin
  const conv2 = await prisma.conversation.create({
    data: {
      type: "DIRECT",
      schoolId: school.id,
      participants: {
        create: [
          { userId: juan.id },
          { userId: admin.id },
        ],
      },
      lastMessageAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv2.id,
      senderId: juan.id,
      content: "Buenas tardes, tengo una duda sobre el pago de la colegiatura.",
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv2.id,
      senderId: admin.id,
      content: "Con gusto le ayudo. ¿Cuál es su duda?",
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
  });

  console.log("Created sample conversations and messages");

  // Create sample events
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  // Event 1: Reunion de padres
  await prisma.event.create({
    data: {
      title: "Reunión de padres de familia - 3ro A",
      description: "Reunión informativa sobre el avance académico del primer trimestre. Se discutirán temas como calificaciones, proyectos y actividades extracurriculares.",
      startDate: new Date(now.getFullYear(), now.getMonth(), 15, 16, 0),
      endDate: new Date(now.getFullYear(), now.getMonth(), 15, 18, 0),
      allDay: false,
      type: "REUNION",
      color: "#7C3AED",
      location: "Sala de juntas - Edificio A",
      isPublic: false,
      schoolId: school.id,
      createdById: admin.id,
      groupId: group3A.id,
      attendees: {
        create: [
          { userId: maria.id },
          { userId: juan.id },
        ],
      },
    },
  });

  // Event 2: Festival cultural
  await prisma.event.create({
    data: {
      title: "Festival Cultural 2026",
      description: "Festival anual con presentaciones de música, danza, teatro y exposición de arte de todos los grados.",
      startDate: new Date(now.getFullYear(), now.getMonth(), 25, 9, 0),
      endDate: new Date(now.getFullYear(), now.getMonth(), 25, 14, 0),
      allDay: false,
      type: "EXTRACURRICULAR",
      color: "#0891B2",
      location: "Auditorio principal",
      isPublic: true,
      schoolId: school.id,
      createdById: admin.id,
    },
  });

  // Event 3: Día festivo
  await prisma.event.create({
    data: {
      title: "Día del Maestro - Sin clases",
      description: "Suspensión de clases por celebración del Día del Maestro",
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
      allDay: true,
      type: "FESTIVO",
      color: "#DC2626",
      isPublic: true,
      schoolId: school.id,
      createdById: admin.id,
    },
  });

  // Event 4: Exámenes
  await prisma.event.create({
    data: {
      title: "Inicio de exámenes trimestrales",
      description: "Comienzan los exámenes del primer trimestre para todos los grados.",
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 12),
      allDay: true,
      type: "ACADEMICO",
      color: "#EA580C",
      isPublic: true,
      schoolId: school.id,
      createdById: admin.id,
    },
  });

  // Event 5: Cita individual
  await prisma.event.create({
    data: {
      title: "Cita: Revisión de calificaciones",
      description: "Cita individual para revisar el desempeño académico.",
      startDate: new Date(now.getFullYear(), now.getMonth(), 20, 10, 0),
      endDate: new Date(now.getFullYear(), now.getMonth(), 20, 10, 30),
      allDay: false,
      type: "CITA",
      color: "#059669",
      location: "Dirección académica",
      isPublic: false,
      schoolId: school.id,
      createdById: profesorMath.id,
      attendees: {
        create: [
          { userId: maria.id },
        ],
      },
    },
  });

  // Event 6: Evento escolar general
  await prisma.event.create({
    data: {
      title: "Ceremonia de inicio de ciclo",
      description: "Ceremonia oficial de bienvenida al nuevo ciclo escolar con presentación del cuerpo docente.",
      startDate: new Date(now.getFullYear(), now.getMonth(), 8, 8, 0),
      endDate: new Date(now.getFullYear(), now.getMonth(), 8, 10, 0),
      allDay: false,
      type: "ESCOLAR",
      color: "#1B4079",
      location: "Patio central",
      isPublic: true,
      schoolId: school.id,
      createdById: admin.id,
    },
  });

  console.log("Created sample events");

  // Create sample charges
  // Colegiatura Febrero 2026 for Sofía (María's child)
  await prisma.charge.create({
    data: {
      concept: "Colegiatura Febrero 2026",
      type: "COLEGIATURA",
      amount: 5500,
      amountPaid: 5500,
      status: "PAGADO",
      dueDate: new Date(now.getFullYear(), 1, 10), // Feb 10
      periodMonth: 2,
      periodYear: 2026,
      studentId: sofia.id,
      schoolId: school.id,
      createdById: admin.id,
      payments: {
        create: {
          amount: 5500,
          method: "TRANSFERENCIA",
          reference: "TRF-20260205-001",
          recordedById: admin.id,
          paidAt: new Date(now.getFullYear(), 1, 5),
        },
      },
    },
  });

  // Colegiatura Marzo 2026 for Sofía - Pendiente
  await prisma.charge.create({
    data: {
      concept: "Colegiatura Marzo 2026",
      type: "COLEGIATURA",
      amount: 5500,
      amountPaid: 0,
      status: "PENDIENTE",
      dueDate: new Date(now.getFullYear(), 2, 10), // Mar 10
      periodMonth: 3,
      periodYear: 2026,
      studentId: sofia.id,
      schoolId: school.id,
      createdById: admin.id,
    },
  });

  // Inscripción for Carlos (Juan's child)
  await prisma.charge.create({
    data: {
      concept: "Inscripción Ciclo 2025-2026",
      type: "INSCRIPCION",
      amount: 8000,
      amountPaid: 4000,
      status: "PARCIAL",
      dueDate: new Date(now.getFullYear(), 0, 15), // Jan 15
      studentId: carlos.id,
      schoolId: school.id,
      createdById: admin.id,
      payments: {
        create: {
          amount: 4000,
          method: "EFECTIVO",
          notes: "Primer abono",
          recordedById: admin.id,
          paidAt: new Date(now.getFullYear(), 0, 10),
        },
      },
    },
  });

  // Colegiatura vencida for Carlos
  await prisma.charge.create({
    data: {
      concept: "Colegiatura Enero 2026",
      type: "COLEGIATURA",
      amount: 5500,
      amountPaid: 0,
      status: "VENCIDO",
      dueDate: new Date(now.getFullYear(), 0, 10), // Jan 10
      periodMonth: 1,
      periodYear: 2026,
      studentId: carlos.id,
      schoolId: school.id,
      createdById: admin.id,
      notes: "Favor de ponerse al corriente lo antes posible",
    },
  });

  // Material escolar for Mariana
  await prisma.charge.create({
    data: {
      concept: "Material escolar - Segundo semestre",
      type: "MATERIAL",
      amount: 1200,
      amountPaid: 1200,
      status: "PAGADO",
      dueDate: new Date(now.getFullYear(), 1, 1), // Feb 1
      studentId: mariana.id,
      schoolId: school.id,
      createdById: admin.id,
      payments: {
        create: {
          amount: 1200,
          method: "TARJETA",
          reference: "CARD-4521",
          recordedById: admin.id,
          paidAt: new Date(now.getFullYear(), 0, 28),
        },
      },
    },
  });

  console.log("Created sample charges and payments");

  console.log("\n=== CREDENCIALES DE PRUEBA ===");
  console.log("Admin: john@doe.com / johndoe123");
  console.log("Admin: admin@vermontschool.edu / admin123");
  console.log("Profesor: prof.sanchez@vermontschool.edu / profesor123");
  console.log("Profesor: prof.ramirez@vermontschool.edu / profesor123");
  console.log("Padre: maria.lopez@email.com / padre123");
  console.log("Padre: juan.martinez@email.com / padre123");
  console.log("Padre: ana.rodriguez@email.com / padre123");
  console.log("==============================\n");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
