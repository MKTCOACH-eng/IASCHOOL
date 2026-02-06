import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string;
  name: string;
}

function generateReportCardHTML(data: {
  student: {
    firstName: string;
    lastName: string;
    group?: { name: string; grade?: string | null; section?: string | null } | null;
  };
  school: { name: string; logoUrl?: string | null };
  period: string;
  grades: {
    subject: string;
    color: string;
    tasks: { title: string; score: number | null; maxScore: number; dueDate: string | null }[];
    average: number | null;
  }[];
  generalAverage: number | null;
  generatedAt: string;
  generatedBy: string;
}): string {
  const { student, school, period, grades, generalAverage, generatedAt, generatedBy } = data;

  const getGradeColor = (score: number | null): string => {
    if (score === null) return '#6B7280';
    if (score >= 90) return '#059669';
    if (score >= 80) return '#10B981';
    if (score >= 70) return '#F59E0B';
    if (score >= 60) return '#F97316';
    return '#EF4444';
  };

  const getGradeLabel = (score: number | null): string => {
    if (score === null) return 'Sin calificar';
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Muy Bien';
    if (score >= 70) return 'Bien';
    if (score >= 60) return 'Suficiente';
    return 'Insuficiente';
  };

  const subjectRows = grades.map(g => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${g.color};"></div>
          <span style="font-weight: 500;">${g.subject}</span>
        </div>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; text-align: center;">
        ${g.tasks.length}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; text-align: center;">
        <span style="font-size: 24px; font-weight: 700; color: ${getGradeColor(g.average)};">
          ${g.average !== null ? g.average.toFixed(1) : 'N/A'}
        </span>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; text-align: center;">
        <span style="padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; background-color: ${getGradeColor(g.average)}20; color: ${getGradeColor(g.average)};">
          ${getGradeLabel(g.average)}
        </span>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Boleta de Calificaciones - ${student.firstName} ${student.lastName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #1F2937;
          background-color: #FFFFFF;
          padding: 40px;
          line-height: 1.5;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 3px solid #1B4079;
        }
        .school-info h1 {
          font-size: 28px;
          color: #1B4079;
          margin-bottom: 4px;
        }
        .document-title {
          font-size: 18px;
          color: #6B7280;
          font-weight: 500;
        }
        .period-badge {
          background-color: #1B4079;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
        }
        .student-card {
          background: linear-gradient(135deg, #1B4079 0%, #2563EB 100%);
          color: white;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 32px;
        }
        .student-name {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .student-group {
          font-size: 16px;
          opacity: 0.9;
        }
        .grades-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 24px;
        }
        .grades-table th {
          background-color: #F3F4F6;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .grades-table th:nth-child(2),
        .grades-table th:nth-child(3),
        .grades-table th:nth-child(4) {
          text-align: center;
        }
        .summary-box {
          background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
          border: 2px solid #10B981;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          margin-bottom: 32px;
        }
        .summary-label {
          font-size: 14px;
          color: #065F46;
          font-weight: 500;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .summary-value {
          font-size: 56px;
          font-weight: 800;
          color: #059669;
        }
        .summary-status {
          font-size: 18px;
          color: #065F46;
          font-weight: 600;
          margin-top: 8px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6B7280;
        }
        .signature-section {
          display: flex;
          justify-content: space-around;
          margin-top: 48px;
          padding-top: 24px;
        }
        .signature-box {
          text-align: center;
          width: 200px;
        }
        .signature-line {
          border-top: 1px solid #1F2937;
          margin-bottom: 8px;
          margin-top: 60px;
        }
        .signature-label {
          font-size: 12px;
          color: #6B7280;
        }
        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="school-info">
            <h1>${school.name}</h1>
            <div class="document-title">Boleta de Calificaciones</div>
          </div>
          <div class="period-badge">Período: ${period}</div>
        </div>

        <div class="student-card">
          <div class="student-name">${student.firstName} ${student.lastName}</div>
          <div class="student-group">
            ${student.group ? `${student.group.name}${student.group.grade ? ` • ${student.group.grade}` : ''}` : 'Sin grupo asignado'}
          </div>
        </div>

        <table class="grades-table">
          <thead>
            <tr>
              <th>Materia</th>
              <th>Tareas</th>
              <th>Promedio</th>
              <th>Evaluación</th>
            </tr>
          </thead>
          <tbody>
            ${subjectRows || '<tr><td colspan="4" style="padding: 24px; text-align: center; color: #6B7280;">No hay calificaciones registradas para este período</td></tr>'}
          </tbody>
        </table>

        <div class="summary-box">
          <div class="summary-label">Promedio General</div>
          <div class="summary-value">${generalAverage !== null ? generalAverage.toFixed(1) : 'N/A'}</div>
          <div class="summary-status">${getGradeLabel(generalAverage)}</div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Profesor(a) Titular</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Director(a)</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Padre/Madre de Familia</div>
          </div>
        </div>

        <div class="footer">
          <div>Generado el: ${generatedAt}</div>
          <div>Por: ${generatedBy}</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { studentId } = params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || new Date().getFullYear().toString();

    // Verificar acceso al estudiante
    const student = await db.student.findFirst({
      where: {
        id: studentId,
        schoolId: user.schoolId,
        ...(user.role === 'PADRE' ? {
          parents: { some: { id: user.id } }
        } : {}),
        ...(user.role === 'PROFESOR' ? {
          group: { teacherId: user.id }
        } : {})
      },
      include: {
        school: true,
        group: {
          include: {
            teacher: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Estudiante no encontrado o sin acceso' }, { status: 404 });
    }

    // Obtener todas las entregas calificadas del estudiante
    const submissions = await db.submission.findMany({
      where: {
        studentId,
        status: 'REVIEWED',
        task: {
          status: { in: ['PUBLISHED', 'CLOSED'] },
          // Filtrar por año si el periodo es un año
          ...(period.match(/^\d{4}$/) ? {
            dueDate: {
              gte: new Date(`${period}-01-01`),
              lt: new Date(`${parseInt(period) + 1}-01-01`)
            }
          } : {})
        }
      },
      include: {
        task: {
          include: {
            subject: true
          }
        }
      },
      orderBy: {
        task: {
          dueDate: 'asc'
        }
      }
    });

    // Agrupar por materia
    const gradesBySubject: Map<string, {
      subject: string;
      color: string;
      tasks: { title: string; score: number | null; maxScore: number; dueDate: string | null }[];
      totalScore: number;
      totalMaxScore: number;
      count: number;
    }> = new Map();

    for (const submission of submissions) {
      const subjectName = submission.task.subject?.name || 'Sin materia';
      const subjectColor = submission.task.subject?.color || '#6B7280';
      
      if (!gradesBySubject.has(subjectName)) {
        gradesBySubject.set(subjectName, {
          subject: subjectName,
          color: subjectColor,
          tasks: [],
          totalScore: 0,
          totalMaxScore: 0,
          count: 0
        });
      }

      const subjectData = gradesBySubject.get(subjectName)!;
      const normalizedScore = submission.score !== null 
        ? (submission.score / submission.task.maxScore) * 100 
        : null;
      
      subjectData.tasks.push({
        title: submission.task.title,
        score: normalizedScore,
        maxScore: 100,
        dueDate: submission.task.dueDate?.toISOString() || null
      });

      if (submission.score !== null) {
        subjectData.totalScore += normalizedScore!;
        subjectData.count++;
      }
    }

    // Calcular promedios por materia
    const grades = Array.from(gradesBySubject.values()).map(g => ({
      subject: g.subject,
      color: g.color,
      tasks: g.tasks,
      average: g.count > 0 ? g.totalScore / g.count : null
    }));

    // Calcular promedio general
    const validGrades = grades.filter(g => g.average !== null);
    const generalAverage = validGrades.length > 0
      ? validGrades.reduce((sum, g) => sum + g.average!, 0) / validGrades.length
      : null;

    // Generar HTML
    const htmlContent = generateReportCardHTML({
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        group: student.group
      },
      school: { name: student.school.name, logoUrl: student.school.logoUrl },
      period,
      grades,
      generalAverage,
      generatedAt: new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      generatedBy: user.name
    });

    // Crear solicitud de PDF
    const createResponse = await fetch('https://apps.abacus.ai/api/createConvertHtmlToPdfRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        html_content: htmlContent,
        pdf_options: {
          format: 'Letter',
          margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
          print_background: true
        },
        base_url: process.env.NEXTAUTH_URL || '',
      }),
    });

    if (!createResponse.ok) {
      console.error('Error creating PDF request:', await createResponse.text());
      return NextResponse.json({ error: 'Error al crear solicitud de PDF' }, { status: 500 });
    }

    const { request_id } = await createResponse.json();
    if (!request_id) {
      return NextResponse.json({ error: 'No se recibió ID de solicitud' }, { status: 500 });
    }

    // Polling para obtener el PDF
    const maxAttempts = 60; // 1 minuto máximo
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const statusResponse = await fetch('https://apps.abacus.ai/api/getConvertHtmlToPdfStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          request_id, 
          deployment_token: process.env.ABACUSAI_API_KEY 
        }),
      });

      const statusResult = await statusResponse.json();
      const status = statusResult?.status || 'FAILED';
      const result = statusResult?.result || null;

      if (status === 'SUCCESS') {
        if (result && result.result) {
          const pdfBuffer = Buffer.from(result.result, 'base64');
          const fileName = `Boleta_${student.firstName}_${student.lastName}_${period}.pdf`;
          
          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${fileName}"`,
            },
          });
        }
        return NextResponse.json({ error: 'PDF generado pero sin datos' }, { status: 500 });
      } else if (status === 'FAILED') {
        console.error('PDF generation failed:', result);
        return NextResponse.json({ error: 'Error al generar PDF' }, { status: 500 });
      }

      attempts++;
    }

    return NextResponse.json({ error: 'Tiempo de espera agotado' }, { status: 500 });
  } catch (error) {
    console.error('Error generating report card:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
