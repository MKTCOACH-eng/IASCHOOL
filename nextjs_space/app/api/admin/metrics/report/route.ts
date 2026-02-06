import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string;
}

// GET - Generar reporte detallado
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "general";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const exportFormat = searchParams.get("export") || "json";

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    let reportData: any = {};

    switch (reportType) {
      case "attendance":
        reportData = await generateAttendanceReport(user.schoolId, dateFilter);
        break;
      case "payments":
        reportData = await generatePaymentsReport(user.schoolId, dateFilter);
        break;
      case "academic":
        reportData = await generateAcademicReport(user.schoolId, dateFilter);
        break;
      default:
        reportData = await generateGeneralReport(user.schoolId, dateFilter);
    }

    if (exportFormat === "csv") {
      const csv = convertToCSV(reportData, reportType);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="reporte_${reportType}_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

async function generateAttendanceReport(schoolId: string, dateFilter: any) {
  const groups = await prisma.group.findMany({
    where: { schoolId, isActive: true },
    include: {
      students: { where: { isActive: true } },
      teacher: { select: { name: true } },
    },
  });

  const report = await Promise.all(
    groups.map(async (group: any) => {
      const attendanceStats = await prisma.attendance.groupBy({
        by: ["status"],
        where: {
          groupId: group.id,
          ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
        },
        _count: true,
      });

      const total = attendanceStats.reduce((acc: number, s: any) => acc + s._count, 0);
      const presente = attendanceStats.find((s: any) => s.status === "PRESENTE")?._count || 0;
      const ausente = attendanceStats.find((s: any) => s.status === "AUSENTE")?._count || 0;
      const tardanza = attendanceStats.find((s: any) => s.status === "TARDANZA")?._count || 0;
      const justificado = attendanceStats.find((s: any) => s.status === "JUSTIFICADO")?._count || 0;

      return {
        grupo: group.name,
        profesor: group.teacher?.name || "Sin asignar",
        totalAlumnos: group.students.length,
        registrosAsistencia: total,
        presente,
        ausente,
        tardanza,
        justificado,
        porcentajeAsistencia: total > 0 ? Math.round((presente / total) * 100) : 0,
      };
    })
  );

  return { type: "attendance", data: report };
}

async function generatePaymentsReport(schoolId: string, dateFilter: any) {
  const charges = await prisma.charge.findMany({
    where: {
      schoolId,
      ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
    },
    include: {
      student: { select: { firstName: true, lastName: true, group: { select: { name: true } } } },
      payments: true,
    },
    orderBy: { dueDate: "desc" },
  });

  const report = charges.map((charge: any) => {
    const totalPagado = charge.payments.reduce((acc: number, p: any) => acc + p.amount, 0);
    return {
      concepto: charge.concept,
      tipo: charge.type,
      alumno: `${charge.student.firstName} ${charge.student.lastName}`,
      grupo: charge.student.group?.name || "Sin grupo",
      monto: charge.amount,
      pagado: totalPagado,
      pendiente: charge.amount - totalPagado,
      estado: charge.status,
      vencimiento: charge.dueDate.toISOString().split("T")[0],
    };
  });

  const summary = {
    totalCargos: charges.length,
    montoTotal: charges.reduce((acc: number, c: any) => acc + c.amount, 0),
    montoPagado: report.reduce((acc: number, r: any) => acc + r.pagado, 0),
    montoPendiente: report.reduce((acc: number, r: any) => acc + r.pendiente, 0),
  };

  return { type: "payments", data: report, summary };
}

async function generateAcademicReport(schoolId: string, dateFilter: any) {
  const groups = await prisma.group.findMany({
    where: { schoolId, isActive: true },
    include: {
      students: { where: { isActive: true } },
      teacher: { select: { name: true } },
      tasks: {
        where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
        include: {
          submissions: true,
          subject: { select: { name: true } },
        },
      },
    },
  });

  const report = groups.map((group: any) => {
    const totalTareas = group.tasks.length;
    const totalEntregas = group.tasks.reduce((acc: number, t: any) => acc + t.submissions.length, 0);
    const tareasCalificadas = group.tasks.filter((t: any) => 
      t.submissions.some((s: any) => s.score !== null)
    ).length;
    
    const promedioGeneral = group.tasks.length > 0
      ? group.tasks.reduce((acc: number, t: any) => {
          const submissionsWithScore = t.submissions.filter((s: any) => s.score !== null);
          if (submissionsWithScore.length === 0) return acc;
          const taskAvg = submissionsWithScore.reduce((a: number, s: any) => a + (s.score || 0), 0) / submissionsWithScore.length;
          return acc + taskAvg;
        }, 0) / Math.max(tareasCalificadas, 1)
      : 0;

    return {
      grupo: group.name,
      profesor: group.teacher?.name || "Sin asignar",
      totalAlumnos: group.students.length,
      tareasAsignadas: totalTareas,
      entregasRecibidas: totalEntregas,
      tasaEntrega: totalTareas > 0 && group.students.length > 0
        ? Math.round((totalEntregas / (totalTareas * group.students.length)) * 100)
        : 0,
      promedioGeneral: Math.round(promedioGeneral * 100) / 100,
    };
  });

  return { type: "academic", data: report };
}

async function generateGeneralReport(schoolId: string, dateFilter: any) {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      _count: {
        select: {
          users: true,
          students: true,
          groups: true,
          announcements: true,
        },
      },
    },
  });

  const [parents, teachers, activeStudents, activeGroups] = await Promise.all([
    prisma.user.count({ where: { schoolId, role: "PADRE" } }),
    prisma.user.count({ where: { schoolId, role: "PROFESOR" } }),
    prisma.student.count({ where: { schoolId, isActive: true } }),
    prisma.group.count({ where: { schoolId, isActive: true } }),
  ]);

  return {
    type: "general",
    data: {
      escuela: school?.name,
      codigo: school?.code,
      totalUsuarios: school?._count.users || 0,
      totalPadres: parents,
      totalProfesores: teachers,
      totalAlumnos: activeStudents,
      totalGrupos: activeGroups,
      totalAnuncios: school?._count.announcements || 0,
    },
  };
}

function convertToCSV(reportData: any, reportType: string): string {
  const lines = [`Reporte: ${reportType}`, `Fecha: ${new Date().toLocaleDateString("es-MX")}`, ""];

  if (reportData.summary) {
    lines.push("RESUMEN");
    Object.entries(reportData.summary).forEach(([key, value]) => {
      lines.push(`${key},${value}`);
    });
    lines.push("");
  }

  if (Array.isArray(reportData.data) && reportData.data.length > 0) {
    lines.push("DETALLE");
    const headers = Object.keys(reportData.data[0]);
    lines.push(headers.join(","));
    reportData.data.forEach((row: any) => {
      lines.push(headers.map(h => row[h]).join(","));
    });
  } else if (typeof reportData.data === "object") {
    lines.push("DATOS");
    Object.entries(reportData.data).forEach(([key, value]) => {
      lines.push(`${key},${value}`);
    });
  }

  return lines.join("\n");
}
