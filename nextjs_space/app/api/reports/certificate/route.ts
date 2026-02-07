import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const user = session.user as any;
    const { studentId, type } = await request.json();
    
    if (!studentId || !type) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }
    
    // Get student data
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        school: true,
        group: true,
        parents: { select: { name: true } }
      }
    });
    
    if (!student || student.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }
    
    // Generate HTML based on type
    let htmlContent = '';
    let title = '';
    const today = new Date().toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const commonStyles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; color: #1a1a1a; padding: 40px; }
        .container { max-width: 700px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #1B4079; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 700; color: #1B4079; }
        .school-name { font-size: 14px; color: #666; margin-top: 5px; }
        .title { font-size: 28px; font-weight: 700; color: #1B4079; margin: 30px 0; text-align: center; text-transform: uppercase; letter-spacing: 2px; }
        .content { line-height: 1.8; font-size: 14px; text-align: justify; }
        .student-name { font-weight: 600; color: #1B4079; }
        .info-box { background: #f8f9fa; border-left: 4px solid #1B4079; padding: 15px 20px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .info-label { color: #666; font-size: 12px; }
        .info-value { font-weight: 500; }
        .footer { margin-top: 60px; text-align: center; }
        .signature { border-top: 1px solid #333; width: 200px; margin: 60px auto 10px; padding-top: 10px; }
        .date { font-size: 12px; color: #666; margin-top: 30px; }
        .seal { color: #1B4079; font-weight: 600; }
      </style>
    `;
    
    if (type === 'enrollment') {
      title = 'Constancia de Inscripción';
      htmlContent = `
        <!DOCTYPE html>
        <html><head>${commonStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">IA School</div>
              <div class="school-name">${student.school.name}</div>
            </div>
            
            <h1 class="title">Constancia de Inscripción</h1>
            
            <div class="content">
              <p>Por medio de la presente, se hace constar que el/la alumno(a):</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Nombre completo:</span>
                  <span class="info-value student-name">${student.firstName} ${student.lastName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Grupo:</span>
                  <span class="info-value">${student.group?.name || 'No asignado'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Ciclo escolar:</span>
                  <span class="info-value">2025-2026</span>
                </div>
              </div>
              
              <p>Se encuentra debidamente inscrito(a) en esta institución educativa y cumple con todos los requisitos establecidos para su nivel académico.</p>
              
              <p style="margin-top: 20px;">Se expide la presente constancia para los fines legales que al interesado convengan.</p>
            </div>
            
            <div class="footer">
              <div class="signature">Dirección Escolar</div>
              <p class="date">${student.school.address || 'Ciudad de México'}, a ${today}</p>
              <p class="seal">Sello de la Institución</p>
            </div>
          </div>
        </body></html>
      `;
    } else if (type === 'conduct') {
      title = 'Constancia de Buena Conducta';
      htmlContent = `
        <!DOCTYPE html>
        <html><head>${commonStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">IA School</div>
              <div class="school-name">${student.school.name}</div>
            </div>
            
            <h1 class="title">Constancia de Buena Conducta</h1>
            
            <div class="content">
              <p>A quien corresponda:</p>
              
              <p style="margin-top: 20px;">Por medio de la presente, hacemos constar que el/la alumno(a) <span class="student-name">${student.firstName} ${student.lastName}</span>, inscrito(a) en el grupo <strong>${student.group?.name || 'N/A'}</strong> de esta institución, ha mantenido una conducta ejemplar durante su permanencia en nuestro plantel.</p>
              
              <div class="info-box">
                <p>El/La estudiante ha demostrado:</p>
                <ul style="margin-top: 10px; padding-left: 20px;">
                  <li>Respeto hacia compañeros y personal docente</li>
                  <li>Cumplimiento del reglamento escolar</li>
                  <li>Participación positiva en actividades escolares</li>
                  <li>Comportamiento adecuado en todas las áreas</li>
                </ul>
              </div>
              
              <p>Se expide la presente para los fines que al interesado convengan.</p>
            </div>
            
            <div class="footer">
              <div class="signature">Dirección Escolar</div>
              <p class="date">${student.school.address || 'Ciudad de México'}, a ${today}</p>
            </div>
          </div>
        </body></html>
      `;
    } else if (type === 'studies') {
      title = 'Constancia de Estudios';
      htmlContent = `
        <!DOCTYPE html>
        <html><head>${commonStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">IA School</div>
              <div class="school-name">${student.school.name}</div>
            </div>
            
            <h1 class="title">Constancia de Estudios</h1>
            
            <div class="content">
              <p>A quien corresponda:</p>
              
              <p style="margin-top: 20px;">Se hace constar que <span class="student-name">${student.firstName} ${student.lastName}</span> es alumno(a) regular de esta institución educativa.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Grado:</span>
                  <span class="info-value">${student.group?.name || 'No asignado'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Ciclo escolar:</span>
                  <span class="info-value">2025-2026</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Turno:</span>
                  <span class="info-value">Matutino</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Horario:</span>
                  <span class="info-value">7:30 - 14:30 hrs</span>
                </div>
              </div>
              
              <p>El/La alumno(a) se encuentra cursando sus estudios de manera regular y satisfactoria.</p>
              
              <p style="margin-top: 20px;">Se expide la presente constancia a petición del interesado para los fines legales que convengan.</p>
            </div>
            
            <div class="footer">
              <div class="signature">Dirección Escolar</div>
              <p class="date">${student.school.address || 'Ciudad de México'}, a ${today}</p>
            </div>
          </div>
        </body></html>
      `;
    } else {
      return NextResponse.json({ error: "Tipo de constancia inválido" }, { status: 400 });
    }
    
    // Create PDF request
    const createResponse = await fetch('https://apps.abacus.ai/api/createConvertHtmlToPdfRequest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        html_content: htmlContent,
        pdf_options: { 
          format: 'Letter',
          margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
          print_background: true
        }
      })
    });
    
    if (!createResponse.ok) {
      return NextResponse.json({ error: "Error al crear PDF" }, { status: 500 });
    }
    
    const { request_id } = await createResponse.json();
    if (!request_id) {
      return NextResponse.json({ error: "No se obtuvo ID de solicitud" }, { status: 500 });
    }
    
    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch('https://apps.abacus.ai/api/getConvertHtmlToPdfStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          request_id,
          deployment_token: process.env.ABACUSAI_API_KEY 
        })
      });
      
      const statusResult = await statusResponse.json();
      
      if (statusResult?.status === 'SUCCESS' && statusResult?.result?.result) {
        const pdfBuffer = Buffer.from(statusResult.result.result, 'base64');
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${title.replace(/ /g, '_')}_${student.lastName}.pdf"`
          }
        });
      } else if (statusResult?.status === 'FAILED') {
        return NextResponse.json({ error: "Error al generar PDF" }, { status: 500 });
      }
      
      attempts++;
    }
    
    return NextResponse.json({ error: "Tiempo de espera agotado" }, { status: 500 });
    
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
