import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string;
}

// POST - Previsualizar CSV
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const action = formData.get("action") as string; // "preview" | "import"

    if (!file || !type) {
      return NextResponse.json({ error: "Archivo y tipo requeridos" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: "El archivo debe tener al menos una fila de datos" }, { status: 400 });
    }

    // Parsear headers y datos
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map((line, index) => {
      const values = line.split(",").map(v => v.trim());
      const row: Record<string, any> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] || "";
      });
      row._rowNumber = index + 2;
      return row;
    });

    // Validar estructura según tipo
    const validation = validateStructure(type, headers);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error, expectedHeaders: validation.expectedHeaders }, { status: 400 });
    }

    // Si es solo preview, devolver datos
    if (action === "preview") {
      const previewData = rows.slice(0, 10).map(row => {
        const errors = validateRow(type, row);
        return { ...row, _errors: errors };
      });

      return NextResponse.json({
        preview: previewData,
        totalRows: rows.length,
        headers,
        type,
      });
    }

    // Procesar importación
    if (action === "import") {
      const result = await processImport(type, rows, user);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    console.error("Error processing import:", error);
    return NextResponse.json({ error: "Error procesando archivo" }, { status: 500 });
  }
}

function validateStructure(type: string, headers: string[]) {
  const requiredHeaders: Record<string, string[]> = {
    STUDENTS: ["nombre", "apellido", "grupo"],
    PARENTS: ["nombre", "email"],
    TEACHERS: ["nombre", "email"],
  };

  const required = requiredHeaders[type];
  if (!required) {
    return { valid: false, error: "Tipo de importación no válido" };
  }

  const missing = required.filter(h => !headers.includes(h));
  if (missing.length > 0) {
    return { 
      valid: false, 
      error: `Columnas requeridas faltantes: ${missing.join(", ")}`,
      expectedHeaders: required,
    };
  }

  return { valid: true };
}

function validateRow(type: string, row: Record<string, any>): string[] {
  const errors: string[] = [];

  if (type === "STUDENTS") {
    if (!row.nombre) errors.push("Nombre requerido");
    if (!row.apellido) errors.push("Apellido requerido");
    if (!row.grupo) errors.push("Grupo requerido");
    if (row.emailpadre && !isValidEmail(row.emailpadre)) errors.push("Email de padre inválido");
  } else if (type === "PARENTS" || type === "TEACHERS") {
    if (!row.nombre) errors.push("Nombre requerido");
    if (!row.email) errors.push("Email requerido");
    if (row.email && !isValidEmail(row.email)) errors.push("Email inválido");
  }

  return errors;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function processImport(type: string, rows: Record<string, any>[], user: SessionUser) {
  const errors: { row: number; errors: string[] }[] = [];
  let successCount = 0;
  let errorCount = 0;

  // Crear log de importación
  const importLog = await prisma.importLog.create({
    data: {
      schoolId: user.schoolId,
      type: type as any,
      status: "PROCESSING",
      totalRows: rows.length,
      fileName: `import_${type.toLowerCase()}_${Date.now()}.csv`,
      importedById: user.id,
      startedAt: new Date(),
    },
  });

  try {
    if (type === "STUDENTS") {
      // Obtener grupos existentes
      const existingGroups = await prisma.group.findMany({
        where: { schoolId: user.schoolId },
        select: { id: true, name: true },
      });
      const groupMap = new Map(existingGroups.map(g => [g.name.toLowerCase(), g.id]));

      for (const row of rows) {
        const rowErrors = validateRow(type, row);
        if (rowErrors.length > 0) {
          errors.push({ row: row._rowNumber, errors: rowErrors });
          errorCount++;
          continue;
        }

        let groupId = groupMap.get(row.grupo.toLowerCase());
        if (!groupId) {
          // Crear grupo si no existe
          const newGroup = await prisma.group.create({
            data: {
              name: row.grupo,
              schoolId: user.schoolId,
            },
          });
          groupId = newGroup.id;
          groupMap.set(row.grupo.toLowerCase(), groupId);
        }

        // Verificar si ya existe el estudiante
        const existingStudent = await prisma.student.findFirst({
          where: {
            schoolId: user.schoolId,
            firstName: row.nombre,
            lastName: row.apellido,
          },
        });

        if (existingStudent) {
          errors.push({ row: row._rowNumber, errors: ["Estudiante ya existe"] });
          errorCount++;
          continue;
        }

        // Crear estudiante
        const student = await prisma.student.create({
          data: {
            firstName: row.nombre,
            lastName: row.apellido,
            schoolId: user.schoolId,
            groupId,
          },
        });

        // Si hay email de padre, crear o vincular
        if (row.emailpadre && isValidEmail(row.emailpadre)) {
          let parent = await prisma.user.findFirst({
            where: { email: row.emailpadre, schoolId: user.schoolId },
          });

          if (!parent) {
            const hashedPassword = await bcrypt.hash("cambiar123", 10);
            parent = await prisma.user.create({
              data: {
                email: row.emailpadre,
                name: row.nombrepadre || row.emailpadre.split("@")[0],
                phone: row.telefonopadre || null,
                password: hashedPassword,
                role: "PADRE",
                schoolId: user.schoolId,
                mustChangePassword: true,
              },
            });
          }

          await prisma.student.update({
            where: { id: student.id },
            data: { parents: { connect: { id: parent.id } } },
          });
        }

        successCount++;
      }
    } else if (type === "PARENTS") {
      for (const row of rows) {
        const rowErrors = validateRow(type, row);
        if (rowErrors.length > 0) {
          errors.push({ row: row._rowNumber, errors: rowErrors });
          errorCount++;
          continue;
        }

        const existingUser = await prisma.user.findFirst({
          where: { email: row.email },
        });

        if (existingUser) {
          errors.push({ row: row._rowNumber, errors: ["Email ya registrado"] });
          errorCount++;
          continue;
        }

        const password = row.password || "cambiar123";
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
          data: {
            email: row.email,
            name: row.nombre,
            phone: row.telefono || null,
            password: hashedPassword,
            role: "PADRE",
            schoolId: user.schoolId,
            mustChangePassword: !row.password,
          },
        });

        successCount++;
      }
    } else if (type === "TEACHERS") {
      for (const row of rows) {
        const rowErrors = validateRow(type, row);
        if (rowErrors.length > 0) {
          errors.push({ row: row._rowNumber, errors: rowErrors });
          errorCount++;
          continue;
        }

        const existingUser = await prisma.user.findFirst({
          where: { email: row.email },
        });

        if (existingUser) {
          errors.push({ row: row._rowNumber, errors: ["Email ya registrado"] });
          errorCount++;
          continue;
        }

        const password = row.password || "cambiar123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const teacher = await prisma.user.create({
          data: {
            email: row.email,
            name: row.nombre,
            phone: row.telefono || null,
            password: hashedPassword,
            role: "PROFESOR",
            schoolId: user.schoolId,
            mustChangePassword: !row.password,
          },
        });

        // Asignar grupos si se especifican
        if (row.grupos) {
          const groupNames = row.grupos.split(",").map((g: string) => g.trim());
          for (const groupName of groupNames) {
            const group = await prisma.group.findFirst({
              where: { schoolId: user.schoolId, name: { equals: groupName, mode: "insensitive" } },
            });
            if (group) {
              await prisma.group.update({
                where: { id: group.id },
                data: { teacherId: teacher.id },
              });
            }
          }
        }

        successCount++;
      }
    }

    // Actualizar log de importación
    const finalStatus = errorCount === 0 ? "COMPLETED" : (successCount === 0 ? "FAILED" : "PARTIAL");
    await prisma.importLog.update({
      where: { id: importLog.id },
      data: {
        status: finalStatus,
        successRows: successCount,
        errorRows: errorCount,
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      importId: importLog.id,
      totalRows: rows.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 20), // Mostrar solo los primeros 20 errores
    };
  } catch (error) {
    await prisma.importLog.update({
      where: { id: importLog.id },
      data: { status: "FAILED", completedAt: new Date() },
    });
    throw error;
  }
}

// GET - Obtener historial de importaciones
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const imports = await prisma.importLog.findMany({
      where: { schoolId: user.schoolId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ imports });
  } catch (error) {
    console.error("Error fetching import history:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
