import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET - List import jobs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as { id: string; role: string; schoolId: string };
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const jobs = await db.bulkImportJob.findMany({
      where: { schoolId: user.schoolId },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching import jobs:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Process import
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as { id: string; role: string; schoolId: string };
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const body = await request.json();
    const { type, data, fileName } = body;

    if (!type || !data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // Create import job
    const job = await db.bulkImportJob.create({
      data: {
        schoolId: user.schoolId,
        type,
        fileName: fileName || `import_${type}_${Date.now()}.csv`,
        totalRows: data.length,
        status: 'PROCESSING',
        startedAt: new Date(),
        createdById: user.id,
      },
    });

    const errors: { row: number; error: string }[] = [];
    let successCount = 0;

    try {
      switch (type) {
        case 'STUDENTS':
          for (let i = 0; i < data.length; i++) {
            try {
              const row = data[i] as { firstName: string; lastName: string; groupName?: string };
              if (!row.firstName || !row.lastName) {
                errors.push({ row: i + 1, error: 'Nombre y apellido requeridos' });
                continue;
              }

              let groupId = null;
              if (row.groupName) {
                const group = await db.group.findFirst({
                  where: { name: row.groupName, schoolId: user.schoolId },
                });
                groupId = group?.id || null;
              }

              await db.student.create({
                data: {
                  firstName: row.firstName,
                  lastName: row.lastName,
                  schoolId: user.schoolId,
                  groupId,
                },
              });
              successCount++;
            } catch (e) {
              errors.push({ row: i + 1, error: String(e) });
            }
          }
          break;

        case 'PARENTS':
          for (let i = 0; i < data.length; i++) {
            try {
              const row = data[i] as { name: string; email: string; phone?: string; studentNames?: string };
              if (!row.name || !row.email) {
                errors.push({ row: i + 1, error: 'Nombre y email requeridos' });
                continue;
              }

              // Check if email exists
              const existing = await db.user.findUnique({ where: { email: row.email } });
              if (existing) {
                errors.push({ row: i + 1, error: `Email ya existe: ${row.email}` });
                continue;
              }

              const hashedPassword = await bcrypt.hash('temporal123', 10);
              const parent = await db.user.create({
                data: {
                  name: row.name,
                  email: row.email,
                  password: hashedPassword,
                  phone: row.phone,
                  role: 'PADRE',
                  schoolId: user.schoolId,
                  mustChangePassword: true,
                },
              });

              // Link to students if provided
              if (row.studentNames) {
                const names = row.studentNames.split(',').map(n => n.trim());
                for (const name of names) {
                  const [firstName, ...lastParts] = name.split(' ');
                  const lastName = lastParts.join(' ');
                  const student = await db.student.findFirst({
                    where: {
                      firstName: { contains: firstName, mode: 'insensitive' },
                      lastName: lastName ? { contains: lastName, mode: 'insensitive' } : undefined,
                      schoolId: user.schoolId,
                    },
                  });
                  if (student) {
                    await db.student.update({
                      where: { id: student.id },
                      data: {
                        parents: { connect: { id: parent.id } },
                      },
                    });
                  }
                }
              }
              successCount++;
            } catch (e) {
              errors.push({ row: i + 1, error: String(e) });
            }
          }
          break;

        case 'TEACHERS':
          for (let i = 0; i < data.length; i++) {
            try {
              const row = data[i] as { name: string; email: string; phone?: string };
              if (!row.name || !row.email) {
                errors.push({ row: i + 1, error: 'Nombre y email requeridos' });
                continue;
              }

              const existing = await db.user.findUnique({ where: { email: row.email } });
              if (existing) {
                errors.push({ row: i + 1, error: `Email ya existe: ${row.email}` });
                continue;
              }

              const hashedPassword = await bcrypt.hash('temporal123', 10);
              await db.user.create({
                data: {
                  name: row.name,
                  email: row.email,
                  password: hashedPassword,
                  phone: row.phone,
                  role: 'PROFESOR',
                  schoolId: user.schoolId,
                  mustChangePassword: true,
                },
              });
              successCount++;
            } catch (e) {
              errors.push({ row: i + 1, error: String(e) });
            }
          }
          break;

        case 'GROUPS':
          for (let i = 0; i < data.length; i++) {
            try {
              const row = data[i] as { name: string; grade?: string; section?: string; teacherEmail?: string };
              if (!row.name) {
                errors.push({ row: i + 1, error: 'Nombre de grupo requerido' });
                continue;
              }

              const existing = await db.group.findFirst({
                where: { name: row.name, schoolId: user.schoolId },
              });
              if (existing) {
                errors.push({ row: i + 1, error: `Grupo ya existe: ${row.name}` });
                continue;
              }

              let teacherId = null;
              if (row.teacherEmail) {
                const teacher = await db.user.findFirst({
                  where: { email: row.teacherEmail, schoolId: user.schoolId, role: 'PROFESOR' },
                });
                teacherId = teacher?.id || null;
              }

              await db.group.create({
                data: {
                  name: row.name,
                  grade: row.grade,
                  section: row.section,
                  schoolId: user.schoolId,
                  teacherId,
                },
              });
              successCount++;
            } catch (e) {
              errors.push({ row: i + 1, error: String(e) });
            }
          }
          break;

        case 'SUBJECTS':
          for (let i = 0; i < data.length; i++) {
            try {
              const row = data[i] as { name: string; color?: string };
              if (!row.name) {
                errors.push({ row: i + 1, error: 'Nombre de materia requerido' });
                continue;
              }

              const existing = await db.subject.findFirst({
                where: { name: row.name, schoolId: user.schoolId },
              });
              if (existing) {
                errors.push({ row: i + 1, error: `Materia ya existe: ${row.name}` });
                continue;
              }

              await db.subject.create({
                data: {
                  name: row.name,
                  color: row.color || '#1B4079',
                  schoolId: user.schoolId,
                },
              });
              successCount++;
            } catch (e) {
              errors.push({ row: i + 1, error: String(e) });
            }
          }
          break;

        default:
          throw new Error(`Tipo de importación no soportado: ${type}`);
      }

      // Update job status
      const finalStatus = errors.length === 0 ? 'COMPLETED' : errors.length === data.length ? 'FAILED' : 'PARTIALLY_COMPLETED';
      await db.bulkImportJob.update({
        where: { id: job.id },
        data: {
          status: finalStatus,
          successCount,
          errorCount: errors.length,
          errors: errors.length > 0 ? JSON.stringify(errors) : null,
          completedAt: new Date(),
        },
      });

      return NextResponse.json({
        jobId: job.id,
        status: finalStatus,
        totalRows: data.length,
        successCount,
        errorCount: errors.length,
        errors: errors.slice(0, 10), // Return first 10 errors
      });
    } catch (processError) {
      await db.bulkImportJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          errors: JSON.stringify([{ error: String(processError) }]),
          completedAt: new Date(),
        },
      });
      throw processError;
    }
  } catch (error) {
    console.error('Error processing import:', error);
    return NextResponse.json({ error: 'Error procesando importación' }, { status: 500 });
  }
}
