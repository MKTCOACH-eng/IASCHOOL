import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const templates: Record<string, { headers: string[]; example: string[][] }> = {
  STUDENTS: {
    headers: ['firstName', 'lastName', 'groupName'],
    example: [
      ['Juan', 'Pérez García', '3ro Primaria A'],
      ['María', 'López Hernández', '3ro Primaria A'],
      ['Carlos', 'Martínez', '4to Primaria B'],
    ],
  },
  PARENTS: {
    headers: ['name', 'email', 'phone', 'studentNames'],
    example: [
      ['Roberto Pérez', 'roberto@email.com', '5512345678', 'Juan Pérez'],
      ['Ana López', 'ana@email.com', '5587654321', 'María López, Pedro López'],
    ],
  },
  TEACHERS: {
    headers: ['name', 'email', 'phone'],
    example: [
      ['Prof. Martínez', 'martinez@school.edu', '5511223344'],
      ['Prof. Sánchez', 'sanchez@school.edu', '5544332211'],
    ],
  },
  GROUPS: {
    headers: ['name', 'grade', 'section', 'teacherEmail'],
    example: [
      ['3ro Primaria A', '3ro Primaria', 'A', 'martinez@school.edu'],
      ['3ro Primaria B', '3ro Primaria', 'B', 'sanchez@school.edu'],
    ],
  },
  SUBJECTS: {
    headers: ['name', 'color'],
    example: [
      ['Matemáticas', '#3B82F6'],
      ['Español', '#22C55E'],
      ['Ciencias', '#F59E0B'],
    ],
  },
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const format = searchParams.get('format') || 'json';

    if (!type || !templates[type]) {
      return NextResponse.json({ 
        error: 'Tipo inválido',
        availableTypes: Object.keys(templates),
      }, { status: 400 });
    }

    const template = templates[type];

    if (format === 'csv') {
      const csvContent = [
        template.headers.join(','),
        ...template.example.map(row => row.join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="template_${type.toLowerCase()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      type,
      headers: template.headers,
      example: template.example,
      instructions: {
        STUDENTS: 'El campo groupName debe coincidir exactamente con el nombre del grupo existente.',
        PARENTS: 'studentNames puede contener múltiples estudiantes separados por coma. El email debe ser único.',
        TEACHERS: 'El email debe ser único. Se creará con contraseña temporal "temporal123".',
        GROUPS: 'El nombre del grupo debe ser único. teacherEmail debe ser de un profesor existente.',
        SUBJECTS: 'El nombre de la materia debe ser único. El color es opcional (formato hex).',
      }[type],
    });
  } catch (error) {
    console.error('Error getting template:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
