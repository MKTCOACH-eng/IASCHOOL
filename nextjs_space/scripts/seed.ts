import { PrismaClient, Role, Priority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.announcementRead.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  // Create Vermont School
  const school = await prisma.school.create({
    data: {
      name: "Vermont School",
      logoUrl: "/vermont-logo.svg",
      primaryColor: "#1B4079",
    },
  });
  console.log("Created school:", school.name);

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
    },
  });

  const juan = await prisma.user.create({
    data: {
      email: "juan.martinez@email.com",
      password: padrePassword,
      name: "Juan Martínez",
      role: Role.PADRE,
      schoolId: school.id,
    },
  });

  const ana = await prisma.user.create({
    data: {
      email: "ana.rodriguez@email.com",
      password: padrePassword,
      name: "Ana Rodríguez",
      role: Role.PADRE,
      schoolId: school.id,
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
