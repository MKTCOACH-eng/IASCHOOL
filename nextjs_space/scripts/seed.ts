import { PrismaClient, Role, Priority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data in correct order
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
  await prisma.student.create({
    data: {
      firstName: "Sofía",
      lastName: "López",
      schoolId: school.id,
      groupId: group3A.id,
      parents: { connect: [{ id: maria.id }] },
    },
  });

  await prisma.student.create({
    data: {
      firstName: "Diego",
      lastName: "Martínez",
      schoolId: school.id,
      groupId: group3A.id,
      parents: { connect: [{ id: juan.id }] },
    },
  });

  await prisma.student.create({
    data: {
      firstName: "Valentina",
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
