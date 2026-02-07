import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role: string; schoolId: string };

    const reportCard = await db.reportCard.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            group: true,
            parents: { select: { name: true } },
          },
        },
        grades: {
          include: { subject: true },
          orderBy: { subject: { name: 'asc' } },
        },
        school: true,
      },
    });

    if (!reportCard || reportCard.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Boleta no encontrada' }, { status: 404 });
    }

    const periodLabels: Record<string, string> = {
      BIMESTRE_1: 'Primer Bimestre',
      BIMESTRE_2: 'Segundo Bimestre',
      BIMESTRE_3: 'Tercer Bimestre',
      BIMESTRE_4: 'Cuarto Bimestre',
      BIMESTRE_5: 'Quinto Bimestre',
      TRIMESTRE_1: 'Primer Trimestre',
      TRIMESTRE_2: 'Segundo Trimestre',
      TRIMESTRE_3: 'Tercer Trimestre',
      SEMESTRE_1: 'Primer Semestre',
      SEMESTRE_2: 'Segundo Semestre',
      ANUAL: 'Evaluación Anual',
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1B4079; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #1B4079; }
    .school-info { text-align: right; font-size: 12px; color: #666; }
    .title { text-align: center; font-size: 22px; font-weight: bold; color: #1B4079; margin-bottom: 5px; }
    .subtitle { text-align: center; font-size: 16px; color: #666; margin-bottom: 30px; }
    .student-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .student-info h3 { color: #1B4079; margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .info-item { font-size: 14px; }
    .info-label { font-weight: 600; color: #555; }
    .grades-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .grades-table th { background: #1B4079; color: white; padding: 12px; text-align: left; font-size: 14px; }
    .grades-table td { padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px; }
    .grades-table tr:nth-child(even) { background: #f8f9fa; }
    .grade-cell { text-align: center; font-weight: bold; }
    .grade-high { color: #22c55e; }
    .grade-mid { color: #f59e0b; }
    .grade-low { color: #ef4444; }
    .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .summary-card { background: linear-gradient(135deg, #1B4079, #2d5a9e); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-value { font-size: 32px; font-weight: bold; }
    .summary-label { font-size: 12px; margin-top: 5px; opacity: 0.9; }
    .comments { background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 30px; }
    .comments h4 { color: #b45309; margin-bottom: 10px; }
    .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 50px; text-align: center; }
    .signature-line { border-top: 1px solid #333; padding-top: 10px; margin-top: 60px; }
    .date { text-align: right; font-size: 12px; color: #666; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${reportCard.school.name}</div>
    <div class="school-info">
      ${reportCard.school.address || ''}<br>
      ${reportCard.school.phone || ''}<br>
      ${reportCard.school.email || ''}
    </div>
  </div>
  
  <h1 class="title">BOLETA DE CALIFICACIONES</h1>
  <p class="subtitle">${periodLabels[reportCard.period]} - Ciclo Escolar ${reportCard.schoolYear}</p>
  
  <div class="student-info">
    <h3>Información del Estudiante</h3>
    <div class="info-grid">
      <div class="info-item"><span class="info-label">Nombre:</span> ${reportCard.student.firstName} ${reportCard.student.lastName}</div>
      <div class="info-item"><span class="info-label">Grupo:</span> ${reportCard.student.group?.name || 'N/A'}</div>
      <div class="info-item"><span class="info-label">Padre/Tutor:</span> ${reportCard.student.parents[0]?.name || 'N/A'}</div>
      <div class="info-item"><span class="info-label">Ciclo Escolar:</span> ${reportCard.schoolYear}</div>
    </div>
  </div>
  
  <table class="grades-table">
    <thead>
      <tr>
        <th>Materia</th>
        <th style="text-align: center;">Calificación</th>
        <th>Observaciones</th>
      </tr>
    </thead>
    <tbody>
      ${reportCard.grades.map(g => {
        const gradeClass = g.grade >= 9 ? 'grade-high' : g.grade >= 7 ? 'grade-mid' : 'grade-low';
        return `
          <tr>
            <td>${g.subject.name}</td>
            <td class="grade-cell ${gradeClass}">${g.grade.toFixed(1)}</td>
            <td>${g.comments || '-'}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>
  
  <div class="summary">
    <div class="summary-card">
      <div class="summary-value">${reportCard.finalAverage?.toFixed(1) || 'N/A'}</div>
      <div class="summary-label">Promedio General</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${reportCard.attendance?.toFixed(0) || 'N/A'}%</div>
      <div class="summary-label">Asistencia</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${reportCard.absences} / ${reportCard.tardies}</div>
      <div class="summary-label">Faltas / Retardos</div>
    </div>
  </div>
  
  ${reportCard.teacherComments ? `
  <div class="comments">
    <h4>Observaciones del Profesor</h4>
    <p>${reportCard.teacherComments}</p>
  </div>
  ` : ''}
  
  ${reportCard.principalComments ? `
  <div class="comments" style="background: #d1e7dd; border-color: #22c55e;">
    <h4 style="color: #166534;">Observaciones de Dirección</h4>
    <p>${reportCard.principalComments}</p>
  </div>
  ` : ''}
  
  <div class="footer">
    <div>
      <div class="signature-line">Firma del Profesor</div>
    </div>
    <div>
      <div class="signature-line">Firma del Director</div>
    </div>
  </div>
  
  <p class="date">Fecha de generación: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
</body>
</html>
    `;

    // Call HTML2PDF API
    const pdfResponse = await fetch(`${process.env.PDF_API_URL}/api/v1/pdf/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PDF_API_KEY}`,
      },
      body: JSON.stringify({
        html: htmlContent,
        options: {
          format: 'Letter',
          margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        },
      }),
    });

    if (!pdfResponse.ok) {
      // Return HTML as fallback
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    const pdfData = await pdfResponse.json();

    // Update report card with PDF URL
    await db.reportCard.update({
      where: { id },
      data: {
        pdfUrl: pdfData.url,
        generatedAt: new Date(),
      },
    });

    return NextResponse.json({ pdfUrl: pdfData.url });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 });
  }
}
