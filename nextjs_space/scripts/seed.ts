import { PrismaClient, Role, Priority, AdminSubRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data in correct order
  await prisma.chatbotMessage.deleteMany();
  await prisma.chatbotConversation.deleteMany();
  await prisma.documentSignature.deleteMany();
  await prisma.document.deleteMany();
  await prisma.pollVote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.eventAttendee.deleteMany();
  await prisma.event.deleteMany();
  await prisma.submissionAttachment.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.taskAttachment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.messageReaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  
  // Nuevos módulos - Limpiar antes de estudiantes
  await prisma.authorizedVehicle.deleteMany();
  await prisma.authorizedPickup.deleteMany();
  await prisma.psychologicalRecord.deleteMany();
  await prisma.studentScholarship.deleteMany();
  await prisma.scholarship.deleteMany();
  
  await prisma.student.deleteMany();
  await prisma.group.deleteMany();
  await prisma.announcementRead.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.systemAuditLog.deleteMany();
  await prisma.schoolSettings.deleteMany();
  await prisma.systemConfig.deleteMany();
  
  // Limpiar modelos de negocio
  await prisma.quoteNegotiation.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.affiliatePetitionSignature.deleteMany();
  await prisma.affiliateReferral.deleteMany();
  await prisma.userTermsAcceptance.deleteMany();
  await prisma.termsAndConditions.deleteMany();
  await prisma.parentSubscription.deleteMany();
  await prisma.schoolSubscription.deleteMany();
  await prisma.schoolAgreement.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.setupFeeTier.deleteMany();
  await prisma.stripeConnectAccount.deleteMany();
  await prisma.cafeteriaMenuItem.deleteMany();
  await prisma.cafeteriaMenu.deleteMany();
  
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
  const superAdminPassword = await bcrypt.hash("superadmin123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);
  const padrePassword = await bcrypt.hash("padre123", 10);
  const testPassword = await bcrypt.hash("johndoe123", 10);

  // Create Super Admin user (global system administrator)
  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@iaschool.edu",
      password: superAdminPassword,
      name: "Super Administrador",
      role: Role.SUPER_ADMIN,
      schoolId: null, // Super Admin no pertenece a ninguna escuela específica
      mustChangePassword: false,
      profileCompleted: true,
    },
  });
  console.log("Created super admin:", superAdmin.name, "Email:", superAdmin.email);

  // Create School Settings for Vermont School
  await prisma.schoolSettings.create({
    data: {
      schoolId: school.id,
      planType: "standard",
      maxUsers: 500,
      maxStudents: 1000,
      maxGroups: 50,
      storageLimit: 5120,
    },
  });

  // Create some system configurations
  await prisma.systemConfig.createMany({
    data: [
      { key: "maintenance_mode", value: "false", description: "Modo de mantenimiento del sistema", category: "general" },
      { key: "max_file_size_mb", value: "10", description: "Tamaño máximo de archivo en MB", category: "limits" },
      { key: "session_timeout_minutes", value: "60", description: "Tiempo de expiración de sesión", category: "security" },
    ],
  });

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

  // Create admin user (Dirección)
  const admin = await prisma.user.create({
    data: {
      email: "admin@vermontschool.edu",
      password: adminPassword,
      name: "Director García",
      role: Role.ADMIN,
      adminSubRoles: [AdminSubRole.DIRECCION],
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });
  console.log("Created admin (Dirección):", admin.name);

  // ==================== ADMINS CON SUBROLES ====================
  
  // Admin - Caja/Tesorería
  const adminCaja = await prisma.user.create({
    data: {
      email: "caja@vermontschool.edu",
      password: adminPassword,
      name: "Laura Mendoza",
      phone: "5551234001",
      role: Role.ADMIN,
      adminSubRoles: [AdminSubRole.CAJA],
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });
  console.log("Created admin (Caja):", adminCaja.name);

  // Admin - Enfermería
  const adminEnfermeria = await prisma.user.create({
    data: {
      email: "enfermeria@vermontschool.edu",
      password: adminPassword,
      name: "Dr. Roberto Salinas",
      phone: "5551234002",
      role: Role.ADMIN,
      adminSubRoles: [AdminSubRole.ENFERMERIA],
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });
  console.log("Created admin (Enfermería):", adminEnfermeria.name);

  // Admin - Psicología
  const adminPsicologia = await prisma.user.create({
    data: {
      email: "psicologia@vermontschool.edu",
      password: adminPassword,
      name: "Lic. Patricia Ruiz",
      phone: "5551234003",
      role: Role.ADMIN,
      adminSubRoles: [AdminSubRole.PSICOLOGIA],
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });
  console.log("Created admin (Psicología):", adminPsicologia.name);

  // Admin - Consejo/Comité
  const adminConsejo = await prisma.user.create({
    data: {
      email: "consejo@vermontschool.edu",
      password: adminPassword,
      name: "Mtro. Fernando Vega",
      phone: "5551234004",
      role: Role.ADMIN,
      adminSubRoles: [AdminSubRole.CONSEJO_COMITE],
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });
  console.log("Created admin (Consejo):", adminConsejo.name);

  // Admin - Coordinación Académica
  const adminCoordinacion = await prisma.user.create({
    data: {
      email: "coordinacion@vermontschool.edu",
      password: adminPassword,
      name: "Mtra. Gabriela Torres",
      phone: "5551234005",
      role: Role.ADMIN,
      adminSubRoles: [AdminSubRole.COORDINACION],
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });
  console.log("Created admin (Coordinación):", adminCoordinacion.name);

  // Admin - Recepción
  const adminRecepcion = await prisma.user.create({
    data: {
      email: "recepcion@vermontschool.edu",
      password: adminPassword,
      name: "Sandra Herrera",
      phone: "5551234006",
      role: Role.ADMIN,
      adminSubRoles: [AdminSubRole.RECEPCION],
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });
  console.log("Created admin (Recepción):", adminRecepcion.name);

  // Admin - Sistemas
  const adminSistemas = await prisma.user.create({
    data: {
      email: "sistemas@vermontschool.edu",
      password: adminPassword,
      name: "Ing. Carlos Ramírez",
      phone: "5551234007",
      role: Role.ADMIN,
      adminSubRoles: [AdminSubRole.SISTEMAS],
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });
  console.log("Created admin (Sistemas):", adminSistemas.name);

  // Admin con múltiples subroles (Dirección + Caja)
  const adminMultiple = await prisma.user.create({
    data: {
      email: "subdirector@vermontschool.edu",
      password: adminPassword,
      name: "Lic. Miguel Ángel Soto",
      phone: "5551234008",
      role: Role.ADMIN,
      adminSubRoles: [AdminSubRole.DIRECCION, AdminSubRole.CAJA, AdminSubRole.COORDINACION],
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });
  console.log("Created admin (Múltiple):", adminMultiple.name);

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

  // Create student user account (ALUMNO)
  const alumnoPassword = await bcrypt.hash("alumno123", 10);
  const alumnoUser = await prisma.user.create({
    data: {
      email: "sofia.lopez@vermontschool.edu",
      password: alumnoPassword,
      name: "Sofía López",
      role: "ALUMNO",
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });

  // Connect alumno user to student
  await prisma.student.update({
    where: { id: sofia.id },
    data: { userId: alumnoUser.id },
  });
  console.log("Created alumno user and linked to student");

  // Create vocal user (VOCAL)
  const vocalPassword = await bcrypt.hash("vocal123", 10);
  const vocalUser = await prisma.user.create({
    data: {
      email: "vocal@email.com",
      password: vocalPassword,
      name: "Roberto Vocal",
      role: "VOCAL",
      schoolId: school.id,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });

  // Create a student for the vocal (vocal is also a parent)
  await prisma.student.create({
    data: {
      firstName: "Diego",
      lastName: "Vocal",
      schoolId: school.id,
      groupId: group3A.id,
      parents: { connect: [{ id: vocalUser.id }] },
    },
  });

  // Assign vocal to group
  await prisma.group.update({
    where: { id: group3A.id },
    data: { vocalId: vocalUser.id },
  });
  console.log("Created vocal user");

  // Create sample attendance records
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // Attendance for Sofia
  await prisma.attendance.createMany({
    data: [
      {
        studentId: sofia.id,
        groupId: group3A.id,
        date: twoDaysAgo,
        status: "PRESENTE",
        recordedById: profesorMath.id,
      },
      {
        studentId: sofia.id,
        groupId: group3A.id,
        date: yesterday,
        status: "PRESENTE",
        recordedById: profesorMath.id,
      },
    ],
  });

  // Attendance for Carlos
  await prisma.attendance.createMany({
    data: [
      {
        studentId: carlos.id,
        groupId: group3A.id,
        date: twoDaysAgo,
        status: "TARDANZA",
        notes: "Llegó 10 minutos tarde",
        recordedById: profesorMath.id,
      },
      {
        studentId: carlos.id,
        groupId: group3A.id,
        date: yesterday,
        status: "AUSENTE",
        notes: "Cita médica",
        recordedById: profesorMath.id,
      },
    ],
  });
  console.log("Created sample attendance records");

  // Create sample poll
  const poll = await prisma.poll.create({
    data: {
      title: "¿Qué día prefieren para la convivencia del grupo?",
      description: "Estamos organizando una convivencia familiar. Por favor voten por el día que más les convenga.",
      groupId: group3A.id,
      createdById: vocalUser.id,
      allowMultiple: false,
      isAnonymous: false,
      endsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 días
      options: {
        create: [
          { text: "Sábado 15 de febrero" },
          { text: "Sábado 22 de febrero" },
          { text: "Domingo 23 de febrero" },
        ],
      },
    },
    include: { options: true },
  });

  // Add some votes
  await prisma.pollVote.create({
    data: {
      optionId: poll.options[0].id,
      userId: maria.id,
    },
  });
  await prisma.pollVote.create({
    data: {
      optionId: poll.options[1].id,
      userId: juan.id,
    },
  });
  console.log("Created sample poll with votes");

  // ==================== DOCUMENTOS ====================
  // Documento 1: Autorización pendiente de firma
  const doc1 = await prisma.document.create({
    data: {
      title: "Autorización Salida Educativa - Museo de Historia",
      description: "Permiso para la salida educativa al Museo Nacional de Historia el día 20 de febrero de 2026",
      content: `<h2>AUTORIZACIÓN DE SALIDA EDUCATIVA</h2>
<p><strong>Vermont School</strong></p>
<p>Por medio de la presente, autorizo a mi hijo(a) a participar en la salida educativa organizada por el colegio con los siguientes detalles:</p>
<ul>
  <li><strong>Destino:</strong> Museo Nacional de Historia</li>
  <li><strong>Fecha:</strong> 20 de febrero de 2026</li>
  <li><strong>Horario:</strong> 8:00 AM - 3:00 PM</li>
  <li><strong>Transporte:</strong> Autobús escolar</li>
  <li><strong>Costo:</strong> $250 MXN (incluye entrada y transporte)</li>
</ul>
<p>Me comprometo a:</p>
<ol>
  <li>Proporcionar lunch y agua para mi hijo(a)</li>
  <li>Asegurar la puntualidad en el horario de salida</li>
  <li>Mantener mis datos de contacto actualizados para cualquier emergencia</li>
</ol>
<p>En caso de emergencia médica, autorizo al personal del colegio a tomar las decisiones necesarias para el bienestar de mi hijo(a).</p>`,
      type: "PERMISO",
      status: "PENDING",
      targetRole: "PADRE",
      groupId: group3A.id,
      expiresAt: new Date("2026-02-18"),
      schoolId: school.id,
      createdById: admin.id,
    },
  });

  // Documento 2: Reglamento firmado por algunos
  const doc2 = await prisma.document.create({
    data: {
      title: "Reglamento de Conducta Escolar 2026",
      description: "Normativa de comportamiento y disciplina escolar para el ciclo 2025-2026",
      content: `<h2>REGLAMENTO DE CONDUCTA ESCOLAR</h2>
<h3>Ciclo Escolar 2025-2026</h3>
<p>Vermont School establece el siguiente reglamento con el objetivo de mantener un ambiente de respeto, orden y convivencia armónica:</p>
<h4>1. Puntualidad</h4>
<p>Los alumnos deberán presentarse a las 7:45 AM. Después de las 8:00 AM se considerará retardo.</p>
<h4>2. Uniforme</h4>
<p>El uso del uniforme completo es obligatorio. No se permiten modificaciones ni accesorios adicionales.</p>
<h4>3. Uso de dispositivos electrónicos</h4>
<p>Los teléfonos celulares deberán permanecer apagados durante las horas de clase.</p>
<h4>4. Respeto</h4>
<p>Se espera trato respetuoso hacia compañeros, maestros y personal del colegio.</p>
<h4>5. Tareas y trabajos</h4>
<p>Las tareas deberán entregarse en tiempo y forma. Las entregas tardías tendrán penalización.</p>
<p><strong>El incumplimiento de estas normas resultará en las sanciones correspondientes según la gravedad de la falta.</strong></p>`,
      type: "REGLAMENTO",
      status: "PARTIALLY_SIGNED",
      targetRole: "PADRE",
      schoolId: school.id,
      createdById: admin.id,
    },
  });

  // Agregar firmas al reglamento
  await prisma.documentSignature.create({
    data: {
      documentId: doc2.id,
      userId: maria.id,
      signatureType: "ACCEPT",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      verificationCode: "reglamento-maria-2026",
    },
  });

  // Documento 3: Circular completada
  const doc3 = await prisma.document.create({
    data: {
      title: "Circular: Cambio de Horario Semana Santa",
      description: "Información sobre modificaciones al horario durante Semana Santa",
      content: `<h2>CIRCULAR INFORMATIVA</h2>
<p><strong>Asunto:</strong> Horario Especial Semana Santa 2026</p>
<p>Estimados padres de familia,</p>
<p>Les informamos que durante la semana del 30 de marzo al 3 de abril de 2026, el horario escolar será modificado de la siguiente manera:</p>
<table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
  <tr><th>Día</th><th>Entrada</th><th>Salida</th></tr>
  <tr><td>Lunes 30</td><td>8:00 AM</td><td>1:00 PM</td></tr>
  <tr><td>Martes 31</td><td>8:00 AM</td><td>1:00 PM</td></tr>
  <tr><td>Miércoles 1 - Viernes 3</td><td colspan="2">VACACIONES</td></tr>
</table>
<p>Las clases se reanudan normalmente el lunes 6 de abril.</p>
<p>Agradecemos su comprensión y colaboración.</p>
<p><em>Atentamente,<br/>Dirección General</em></p>`,
      type: "CIRCULAR",
      status: "COMPLETED",
      schoolId: school.id,
      createdById: admin.id,
      completedAt: new Date("2026-02-01"),
    },
  });

  // Agregar firmas a la circular completada
  await prisma.documentSignature.create({
    data: {
      documentId: doc3.id,
      userId: maria.id,
      signatureType: "ACCEPT",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 Chrome/120",
      verificationCode: "circular-maria-2026",
    },
  });
  await prisma.documentSignature.create({
    data: {
      documentId: doc3.id,
      userId: juan.id,
      signatureType: "ACCEPT",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 Safari/17",
      verificationCode: "circular-juan-2026",
    },
  });
  await prisma.documentSignature.create({
    data: {
      documentId: doc3.id,
      userId: ana.id,
      signatureType: "ACCEPT",
      ipAddress: "192.168.1.102",
      userAgent: "Mozilla/5.0 Firefox/121",
      verificationCode: "circular-ana-2026",
    },
  });

  // Documento 4: Borrador (solo visible para admin)
  await prisma.document.create({
    data: {
      title: "Contrato de Servicios Educativos 2026-2027",
      description: "Borrador del contrato para el próximo ciclo escolar",
      content: `<h2>CONTRATO DE PRESTACIÓN DE SERVICIOS EDUCATIVOS</h2>
<p>Este contrato se celebra entre Vermont School y el padre/tutor del alumno inscrito...</p>
<p><em>[Documento en proceso de elaboración]</em></p>`,
      type: "CONTRATO",
      status: "DRAFT",
      schoolId: school.id,
      createdById: admin.id,
    },
  });

  console.log("Created sample documents with signatures");

  // ========== FASE 4C: TIENDA Y GALERÍA ==========
  console.log("Creating store categories and products...");

  // Crear categorías de tienda
  const uniformes = await prisma.storeCategory.create({
    data: {
      schoolId: school.id,
      name: "Uniformes",
      description: "Uniformes escolares oficiales",
      order: 1,
    },
  });

  const libros = await prisma.storeCategory.create({
    data: {
      schoolId: school.id,
      name: "Libros",
      description: "Libros de texto y material de lectura",
      order: 2,
    },
  });

  const materiales = await prisma.storeCategory.create({
    data: {
      schoolId: school.id,
      name: "Materiales",
      description: "Útiles escolares y materiales didácticos",
      order: 3,
    },
  });

  // Crear productos
  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: uniformes.id,
      name: "Playera Polo Blanca",
      description: "Playera polo de algodón con logo bordado de Vermont School",
      price: 350,
      stock: 50,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Blanco"],
      isRequired: true,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: uniformes.id,
      name: "Pantalón Escolar Azul",
      description: "Pantalón de vestir azul marino, tela gabardina",
      price: 450,
      stock: 30,
      sizes: ["4", "6", "8", "10", "12", "14", "16"],
      colors: ["Azul Marino"],
      isRequired: true,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: uniformes.id,
      name: "Sudadera Deportiva",
      description: "Sudadera con cierre y capucha, logo bordado",
      price: 650,
      stock: 25,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Azul Marino", "Gris"],
      isRequired: false,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: libros.id,
      name: "Libro Matemáticas 3°",
      description: "Libro de texto oficial de Matemáticas para tercer grado",
      price: 280,
      stock: 40,
      isRequired: true,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: libros.id,
      name: "Libro Español 3°",
      description: "Libro de texto oficial de Español para tercer grado",
      price: 250,
      stock: 35,
      isRequired: true,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: materiales.id,
      name: "Paquete de Útiles Básicos",
      description: "Incluye: 5 cuadernos, lápices, colores, pegamento y tijeras",
      price: 320,
      stock: 60,
      isRequired: false,
    },
  });

  // Más productos de uniformes
  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: uniformes.id,
      name: "Falda Escolar Azul",
      description: "Falda tableada azul marino, largo a la rodilla",
      price: 380,
      stock: 40,
      sizes: ["4", "6", "8", "10", "12", "14"],
      colors: ["Azul Marino"],
      isRequired: true,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: uniformes.id,
      name: "Short Deportivo",
      description: "Short deportivo con logo, ideal para educación física",
      price: 280,
      stock: 45,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Azul Marino", "Blanco"],
      isRequired: true,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: uniformes.id,
      name: "Playera Deportiva",
      description: "Playera dry-fit para educación física",
      price: 320,
      stock: 55,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Blanco", "Gris"],
      isRequired: true,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: uniformes.id,
      name: "Chaleco Escolar",
      description: "Chaleco de lana con logo bordado, ideal para temporada fría",
      price: 520,
      stock: 30,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Azul Marino"],
      isRequired: false,
    },
  });

  // Más productos de libros
  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: libros.id,
      name: "Libro Ciencias Naturales 3°",
      description: "Libro de texto oficial de Ciencias Naturales",
      price: 260,
      stock: 38,
      isRequired: true,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: libros.id,
      name: "Libro Historia 3°",
      description: "Libro de texto oficial de Historia de México",
      price: 240,
      stock: 42,
      isRequired: true,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: libros.id,
      name: "Libro Inglés - Level 3",
      description: "Libro de inglés con actividades interactivas y acceso digital",
      price: 450,
      stock: 35,
      isRequired: true,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: libros.id,
      name: "Cuaderno de Caligrafía",
      description: "Cuaderno para practicar escritura y mejorar letra",
      price: 85,
      stock: 70,
      isRequired: false,
    },
  });

  // Más productos de materiales
  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: materiales.id,
      name: "Calculadora Científica",
      description: "Calculadora científica Casio FX-82, autorizada para exámenes",
      price: 380,
      stock: 25,
      isRequired: false,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: materiales.id,
      name: "Mochila Escolar Vermont",
      description: "Mochila ergonómica con logo del colegio, múltiples compartimentos",
      price: 750,
      stock: 20,
      colors: ["Azul Marino", "Negro"],
      isRequired: false,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: materiales.id,
      name: "Lonchera Térmica Vermont",
      description: "Lonchera con aislamiento térmico y logo del colegio",
      price: 320,
      stock: 35,
      colors: ["Azul", "Rosa", "Verde"],
      isRequired: false,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: materiales.id,
      name: "Kit de Geometría",
      description: "Incluye: regla, escuadras, compás y transportador",
      price: 150,
      stock: 50,
      isRequired: false,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: materiales.id,
      name: "Colores Profesionales (36 pzas)",
      description: "Caja de colores de madera de alta calidad",
      price: 280,
      stock: 40,
      isRequired: false,
    },
  });

  await prisma.storeProduct.create({
    data: {
      schoolId: school.id,
      categoryId: materiales.id,
      name: "Botella de Agua Vermont",
      description: "Botella reutilizable de acero inoxidable 500ml con logo",
      price: 220,
      stock: 45,
      colors: ["Azul", "Plata", "Rosa"],
      isRequired: false,
    },
  });

  console.log("Created store categories and products");

  // Crear álbum de fotos de ejemplo
  console.log("Creating sample photo albums...");

  await prisma.photoAlbum.create({
    data: {
      schoolId: school.id,
      title: "Día del Niño 2026",
      description: "Celebración del Día del Niño con actividades y juegos",
      eventDate: new Date("2026-04-30"),
      visibility: "PUBLIC",
      createdById: admin.id,
    },
  });

  await prisma.photoAlbum.create({
    data: {
      schoolId: school.id,
      groupId: group3A.id,
      title: "Clase de Ciencias - Experimentos",
      description: "Los alumnos de 3A realizando experimentos de química",
      eventDate: new Date("2026-02-15"),
      visibility: "GROUP_ONLY",
      createdById: profesorMath.id,
    },
  });

  console.log("Created sample photo albums");

  console.log("\n=== CREDENCIALES DE PRUEBA ===");
  // ==================== BECAS DE PRUEBA ====================
  
  // Crear tipos de becas
  const becaAcademica = await prisma.scholarship.create({
    data: {
      schoolId: school.id,
      name: "Beca Excelencia Académica",
      type: "BECA_ACADEMICA",
      description: "Beca para estudiantes con promedio superior a 9.5",
      discountType: "PERCENTAGE",
      discountValue: 25,
      applyTo: "COLEGIATURA",
      minGPA: 9.5,
      requirements: "Mantener promedio mínimo de 9.5 durante el ciclo escolar",
      isActive: true,
      maxBeneficiaries: 20,
      createdById: adminCaja.id,
    },
  });

  const descuentoHermanos = await prisma.scholarship.create({
    data: {
      schoolId: school.id,
      name: "Descuento por Hermanos",
      type: "DESCUENTO_HERMANOS",
      description: "15% de descuento para el segundo hijo inscrito, 20% para tercero",
      discountType: "PERCENTAGE",
      discountValue: 15,
      applyTo: "COLEGIATURA",
      isActive: true,
      createdById: adminCaja.id,
    },
  });

  const becaNecesidad = await prisma.scholarship.create({
    data: {
      schoolId: school.id,
      name: "Beca Apoyo Económico",
      type: "BECA_NECESIDAD",
      description: "Beca para familias con necesidad económica comprobada",
      discountType: "PERCENTAGE",
      discountValue: 50,
      applyTo: "AMBOS",
      requirements: "Presentar estudio socioeconómico actualizado",
      isActive: true,
      maxBeneficiaries: 10,
      createdById: admin.id,
    },
  });

  const descuentoProntoPago = await prisma.scholarship.create({
    data: {
      schoolId: school.id,
      name: "Descuento Pronto Pago",
      type: "DESCUENTO_PRONTO_PAGO",
      description: "5% de descuento por pago antes del día 5 de cada mes",
      discountType: "PERCENTAGE",
      discountValue: 5,
      applyTo: "COLEGIATURA",
      isActive: true,
      createdById: adminCaja.id,
    },
  });

  console.log("Created 4 scholarship types");

  // Asignar beca a un estudiante
  const students = await prisma.student.findMany({ take: 3 });
  if (students.length > 0) {
    await prisma.studentScholarship.create({
      data: {
        studentId: students[0].id,
        scholarshipId: becaAcademica.id,
        status: "ACTIVA",
        validFrom: new Date("2026-01-01"),
        validUntil: new Date("2026-12-31"),
        notes: "Estudiante destacado con promedio 9.8",
        approvedAt: new Date(),
        approvedBy: admin.id,
      },
    });

    if (students.length > 1) {
      await prisma.studentScholarship.create({
        data: {
          studentId: students[1].id,
          scholarshipId: descuentoHermanos.id,
          status: "ACTIVA",
          validFrom: new Date("2026-01-01"),
          notes: "Hermano menor inscrito",
          approvedAt: new Date(),
          approvedBy: adminCaja.id,
        },
      });
    }
  }

  console.log("Created student scholarships");

  // ==================== REGISTROS PSICOEMOCIONALES ====================
  
  if (students.length > 0) {
    await prisma.psychologicalRecord.create({
      data: {
        studentId: students[0].id,
        schoolId: school.id,
        type: "SESION_INDIVIDUAL",
        alertLevel: "BAJO",
        date: new Date("2026-01-15"),
        duration: 45,
        emotionalState: "ESTABLE",
        reason: "Seguimiento rutinario de inicio de ciclo",
        description: "Estudiante se muestra adaptado al nuevo ciclo escolar. Reporta buena relación con compañeros y profesores. No presenta dificultades emocionales significativas.",
        observations: "Comunicación fluida y abierta durante la sesión",
        actionPlan: "Continuar monitoreo trimestral",
        followUpRequired: true,
        followUpDate: new Date("2026-04-15"),
        recordedById: adminPsicologia.id,
      },
    });

    await prisma.psychologicalRecord.create({
      data: {
        studentId: students[0].id,
        schoolId: school.id,
        type: "OBSERVACION_AULA",
        alertLevel: "BAJO",
        date: new Date("2026-01-20"),
        duration: 30,
        reason: "Observación de conducta en clase",
        description: "Se observó al estudiante durante clase de matemáticas. Muestra participación activa y buena interacción con pares.",
        visibleToTeachers: true,
        recordedById: adminPsicologia.id,
      },
    });

    if (students.length > 1) {
      await prisma.psychologicalRecord.create({
        data: {
          studentId: students[1].id,
          schoolId: school.id,
          type: "REPORTE_DOCENTE",
          alertLevel: "MEDIO",
          date: new Date("2026-01-25"),
          emotionalState: "ANSIOSO",
          reason: "Reporte de profesora por cambio de conducta",
          description: "La profesora reporta que el estudiante ha mostrado signos de ansiedad en las últimas semanas, especialmente antes de exámenes.",
          observations: "Se recomienda sesión individual y contacto con padres",
          actionPlan: "1. Sesión individual la próxima semana\n2. Llamar a padres\n3. Estrategias de manejo de ansiedad",
          followUpRequired: true,
          followUpDate: new Date("2026-02-01"),
          parentNotified: true,
          parentNotifiedAt: new Date("2026-01-26"),
          recordedById: adminPsicologia.id,
        },
      });
    }
  }

  console.log("Created psychological records");

  // ==================== PERSONAS Y VEHÍCULOS AUTORIZADOS ====================
  
  if (students.length > 0) {
    // Persona autorizada 1 - Abuela
    const authorized1 = await prisma.authorizedPickup.create({
      data: {
        studentId: students[0].id,
        fullName: "Rosa María González",
        relationship: "ABUELO_A",
        phone: "5559876543",
        email: "rosa.gonzalez@email.com",
        idType: "INE",
        idNumber: "GOGR600115HDFNNS09",
        canPickupAlone: true,
        requiresIdVerification: true,
        isActive: true,
        notes: "Abuela materna. Recoge los martes y jueves.",
      },
    });

    // Agregar vehículo a la persona autorizada
    await prisma.authorizedVehicle.create({
      data: {
        authorizedPickupId: authorized1.id,
        make: "Toyota",
        model: "Corolla",
        year: 2020,
        color: "Plata",
        licensePlate: "ABC-123-A",
        isActive: true,
      },
    });

    // Persona autorizada 2 - Chofer
    const authorized2 = await prisma.authorizedPickup.create({
      data: {
        studentId: students[0].id,
        fullName: "Pedro Hernández",
        relationship: "CHOFER",
        phone: "5551112233",
        idType: "INE",
        idNumber: "HEPD850320HDFRRD08",
        canPickupAlone: true,
        requiresIdVerification: true,
        isActive: true,
        notes: "Chofer de la familia. Autorizado de lunes a viernes.",
      },
    });

    await prisma.authorizedVehicle.create({
      data: {
        authorizedPickupId: authorized2.id,
        make: "Honda",
        model: "CR-V",
        year: 2022,
        color: "Negro",
        licensePlate: "XYZ-789-B",
        isActive: true,
      },
    });

    // Persona autorizada 3 - Tía (para segundo estudiante)
    if (students.length > 1) {
      const authorized3 = await prisma.authorizedPickup.create({
        data: {
          studentId: students[1].id,
          fullName: "Carmen Martínez López",
          relationship: "TIO_A",
          phone: "5553334455",
          email: "carmen.martinez@email.com",
          idType: "Pasaporte",
          idNumber: "G12345678",
          canPickupAlone: true,
          requiresIdVerification: true,
          isActive: true,
          activeUntil: new Date("2026-06-30"),
          notes: "Autorización temporal mientras padres viajan.",
        },
      });

      await prisma.authorizedVehicle.create({
        data: {
          authorizedPickupId: authorized3.id,
          make: "Volkswagen",
          model: "Jetta",
          year: 2021,
          color: "Blanco",
          licensePlate: "MNO-456-C",
          isActive: true,
        },
      });
    }
  }

  console.log("Created authorized pickups and vehicles");

  // ==========================================
  // CREAR PLANES DE SUSCRIPCIÓN
  // ==========================================
  console.log("Creating subscription plans...");

  await prisma.subscriptionPlan.createMany({
    data: [
      {
        name: "Básico",
        type: "BASIC",
        pricePerStudent: 149,
        iaSchoolShare: 50,
        schoolShare: 50,
        description: "Plan básico con funcionalidades esenciales para comunicación y seguimiento académico.",
        features: JSON.stringify([
          "Anuncios y comunicados",
          "Calendario de eventos",
          "Directorio de contactos",
          "Tareas y asignaciones",
          "Calificaciones y boletas",
          "Progreso académico",
          "Notificaciones push",
          "PWA instalable",
          "Multi-idioma (ES/EN)",
          "Mensajería básica (texto)",
          "Importación masiva CSV/Excel",
          "Invitaciones y onboarding"
        ]),
        annualDiscountMonths: 2,
      },
      {
        name: "Estándar",
        type: "STANDARD",
        pricePerStudent: 199,
        iaSchoolShare: 50,
        schoolShare: 50,
        description: "Plan completo con todas las herramientas de gestión escolar.",
        features: JSON.stringify([
          "Todo lo del plan Básico +",
          "Chat completo (archivos, reacciones, pins)",
          "Encuestas y votaciones en grupos",
          "Asistencia y horarios",
          "Documentos académicos",
          "Enfermería digital",
          "Autorizados para recoger",
          "Permisos y justificantes",
          "Disciplina",
          "Cargos y pagos básicos",
          "Galería de fotos",
          "Tienda escolar básica",
          "Vocal de grupo (colectas)",
          "Documentos firmables"
        ]),
        annualDiscountMonths: 2,
      },
      {
        name: "Premium",
        type: "PREMIUM",
        pricePerStudent: 299,
        iaSchoolShare: 50,
        schoolShare: 50,
        description: "Plan empresarial con todas las funcionalidades avanzadas e IA.",
        features: JSON.stringify([
          "Todo lo del plan Estándar +",
          "Videollamadas (citas con video)",
          "Chatbot IA asistente",
          "Análisis de sentimiento IA",
          "Dashboard ejecutivo",
          "Reportes semanales automáticos",
          "Auditoría de logs",
          "Subroles de administrador",
          "CRM escolar (campañas, segmentos)",
          "Módulo psicoemocional",
          "Encuestas de clima",
          "Pagos online (Stripe)",
          "Becas y descuentos",
          "Recibos PDF",
          "Reportes financieros",
          "Tienda con envíos (Envia.com)",
          "Comedor (menú + pagos)"
        ]),
        annualDiscountMonths: 2,
      },
    ],
  });

  console.log("Created subscription plans");

  // ==========================================
  // CREAR TARIFAS DE SETUP
  // ==========================================
  console.log("Creating setup fee tiers...");

  await prisma.setupFeeTier.createMany({
    data: [
      { name: "Micro", minStudents: 1, maxStudents: 100, setupFee: 8000 },
      { name: "Pequeño", minStudents: 101, maxStudents: 300, setupFee: 15000 },
      { name: "Mediano", minStudents: 301, maxStudents: 600, setupFee: 25000 },
      { name: "Grande", minStudents: 601, maxStudents: 1000, setupFee: 40000 },
      { name: "Enterprise", minStudents: 1001, maxStudents: null, setupFee: 60000 },
    ],
  });

  console.log("Created setup fee tiers");

  // ==========================================
  // CREAR TÉRMINOS Y CONDICIONES
  // ==========================================
  console.log("Creating terms and conditions...");

  await prisma.termsAndConditions.createMany({
    data: [
      {
        type: "GENERAL",
        version: "1.0",
        title: "Términos y Condiciones Generales",
        summary: "Términos generales de uso de la plataforma IA School.",
        content: `
# TÉRMINOS Y CONDICIONES GENERALES DE IA SCHOOL

## 1. ACEPTACIÓN DE LOS TÉRMINOS
Al acceder y utilizar la plataforma IA School, usted acepta estos términos y condiciones en su totalidad.

## 2. DESCRIPCIÓN DEL SERVICIO
IA School es una plataforma de gestión educativa que facilita la comunicación entre instituciones educativas, docentes, padres de familia y alumnos.

## 3. REGISTRO Y CUENTA
- Debe proporcionar información veraz y actualizada
- Es responsable de mantener la confidencialidad de sus credenciales
- Debe notificar inmediatamente cualquier uso no autorizado

## 4. USO ACEPTABLE
Se prohíbe:
- Usar el servicio para actividades ilegales
- Compartir contenido inapropiado o difamatorio
- Intentar acceder a cuentas de otros usuarios
- Interferir con el funcionamiento de la plataforma

## 5. PRIVACIDAD
El tratamiento de datos personales se rige por nuestra Política de Privacidad.

## 6. PROPIEDAD INTELECTUAL
Todo el contenido de la plataforma es propiedad de IA School o sus licenciantes.

## 7. LIMITACIÓN DE RESPONSABILIDAD
IA School no será responsable por daños indirectos, incidentales o consecuentes.

## 8. MODIFICACIONES
Nos reservamos el derecho de modificar estos términos con previo aviso.

## 9. LEY APLICABLE
Estos términos se rigen por las leyes de México.

Última actualización: ${new Date().toLocaleDateString('es-MX')}
        `,
        isMandatory: true,
      },
      {
        type: "PRIVACY_POLICY",
        version: "1.0",
        title: "Política de Privacidad",
        summary: "Cómo recopilamos, usamos y protegemos sus datos personales.",
        content: `
# POLÍTICA DE PRIVACIDAD DE IA SCHOOL

## 1. DATOS QUE RECOPILAMOS
- Información de registro (nombre, email, teléfono)
- Datos de estudiantes y relaciones familiares
- Información académica y de asistencia
- Comunicaciones dentro de la plataforma

## 2. USO DE LA INFORMACIÓN
Utilizamos sus datos para:
- Proveer los servicios de la plataforma
- Comunicaciones relacionadas con el servicio
- Mejora continua de nuestros servicios
- Cumplimiento de obligaciones legales

## 3. PROTECCIÓN DE DATOS
Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos.

## 4. DERECHOS ARCO
Usted tiene derecho a Acceder, Rectificar, Cancelar y Oponerse al tratamiento de sus datos.

## 5. TRANSFERENCIA DE DATOS
No vendemos ni compartimos sus datos con terceros sin su consentimiento.

## 6. CONTACTO
Para ejercer sus derechos: privacidad@iaschool.edu

Última actualización: ${new Date().toLocaleDateString('es-MX')}
        `,
        isMandatory: true,
      },
      {
        type: "ECOMMERCE",
        version: "1.0",
        title: "Términos de Tienda Escolar - Deslinde de Responsabilidad",
        summary: "IA School actúa únicamente como intermediario tecnológico en transacciones de la tienda escolar.",
        content: `
# TÉRMINOS Y CONDICIONES DE TIENDA ESCOLAR

## DESLINDE DE RESPONSABILIDAD - IA SCHOOL

### 1. NATURALEZA DEL SERVICIO
IA School proporciona ÚNICAMENTE la plataforma tecnológica que permite a las instituciones educativas ofrecer productos a sus comunidades. IA School NO es vendedor, distribuidor ni intermediario comercial de ningún producto.

### 2. RESPONSABILIDAD DE LA INSTITUCIÓN EDUCATIVA
La institución educativa (colegio) es el ÚNICO responsable de:
- Calidad y estado de los productos ofrecidos
- Precios, promociones y descuentos
- Inventario y disponibilidad
- Entrega de productos
- Políticas de devolución y garantías
- Atención al cliente
- Facturación y obligaciones fiscales

### 3. LIMITACIÓN DE RESPONSABILIDAD DE IA SCHOOL
IA School NO se hace responsable por:
- Calidad, seguridad o legalidad de los productos
- Veracidad de las descripciones de productos
- Cumplimiento de entregas
- Disputas entre compradores y vendedores
- Daños derivados del uso de productos adquiridos

### 4. PROCESAMIENTO DE PAGOS
Los pagos son procesados a través de proveedores de servicios de pago seguros. IA School no almacena datos de tarjetas de crédito.

### 5. POLÍTICA DE DEVOLUCIONES
Cada institución educativa define su propia política de devoluciones. Consulte directamente con su colegio.

### 6. RECLAMACIONES
Para cualquier reclamación relacionada con productos, contacte directamente a la institución educativa vendedora.

Última actualización: ${new Date().toLocaleDateString('es-MX')}
        `,
        isMandatory: true,
      },
      {
        type: "AFFILIATE",
        version: "1.0",
        title: "Términos del Programa de Afiliados",
        summary: "Condiciones para participar en el programa de referidos de IA School.",
        content: `
# TÉRMINOS DEL PROGRAMA DE AFILIADOS IA SCHOOL

## 1. DESCRIPCIÓN DEL PROGRAMA
El programa de afiliados permite a padres de familia existentes recomendar IA School a su colegio y obtener beneficios cuando el colegio se registra.

## 2. REQUISITOS DE PARTICIPACIÓN
- Ser padre/madre de familia registrado en un colegio
- Aceptar estos términos
- Proporcionar información veraz

## 3. BENEFICIOS PARA EL REFERENTE
- 10% del Setup Fee del colegio
- 1 año de membresía gratis (aplica para 1 hijo únicamente)
- Vigencia de 30 días para que el colegio se registre

## 4. BENEFICIOS PARA FIRMANTES
- $200 MXN de descuento en primer pago
- Aplica solo si el colegio contrata la plataforma

## 5. CONDICIONES
- El link debe ser usado por el colegio para su registro
- Los beneficios se activan únicamente cuando el colegio completa su registro y pago
- No se permiten prácticas fraudulentas o spam

## 6. CANCELACIÓN
IA School se reserva el derecho de cancelar participaciones por incumplimiento.

## 7. PAGO DE COMISIONES
Las comisiones se pagarán dentro de los 30 días siguientes a la activación del colegio.

Última actualización: ${new Date().toLocaleDateString('es-MX')}
        `,
        isMandatory: true,
      },
    ],
  });

  console.log("Created terms and conditions");

  console.log("\n==============================");
  console.log("CREDENCIALES DE PRUEBA:");
  console.log("==============================");
  console.log("\n--- SUPER ADMIN ---");
  console.log("superadmin@iaschool.edu / superadmin123");
  console.log("\n--- ADMINS POR SUBROL ---");
  console.log("Dirección: admin@vermontschool.edu / admin123");
  console.log("Caja: caja@vermontschool.edu / admin123");
  console.log("Enfermería: enfermeria@vermontschool.edu / admin123");
  console.log("Psicología: psicologia@vermontschool.edu / admin123");
  console.log("Consejo: consejo@vermontschool.edu / admin123");
  console.log("Coordinación: coordinacion@vermontschool.edu / admin123");
  console.log("Recepción: recepcion@vermontschool.edu / admin123");
  console.log("Sistemas: sistemas@vermontschool.edu / admin123");
  console.log("Subdirector (múltiple): subdirector@vermontschool.edu / admin123");
  console.log("\n--- PROFESORES ---");
  console.log("prof.sanchez@vermontschool.edu / profesor123");
  console.log("prof.ramirez@vermontschool.edu / profesor123");
  console.log("\n--- PADRES ---");
  console.log("maria.lopez@email.com / padre123");
  console.log("juan.martinez@email.com / padre123");
  console.log("ana.rodriguez@email.com / padre123");
  console.log("\n--- ALUMNO ---");
  console.log("sofia.lopez@vermontschool.edu / alumno123");
  console.log("\n--- VOCAL ---");
  console.log("vocal@email.com / vocal123");
  console.log("\n--- CUENTA DE PRUEBA ---");
  console.log("john@doe.com / johndoe123");
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
