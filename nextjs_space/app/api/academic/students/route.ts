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

// GET - Get students for the current user (parents see their children)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;

    if (user.role === 'PADRE') {
      // Parents see their children
      const students = await db.student.findMany({
        where: {
          schoolId: user.schoolId,
          isActive: true,
          parents: { some: { id: user.id } }
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              grade: true
            }
          }
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      });

      return NextResponse.json({ students });
    } else if (user.role === 'PROFESOR') {
      // Teachers see students in their groups
      const students = await db.student.findMany({
        where: {
          schoolId: user.schoolId,
          isActive: true,
          group: { teacherId: user.id }
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              grade: true
            }
          }
        },
        orderBy: [
          { group: { name: 'asc' } },
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      });

      return NextResponse.json({ students });
    } else {
      // Admins see all students
      const students = await db.student.findMany({
        where: {
          schoolId: user.schoolId,
          isActive: true
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              grade: true
            }
          }
        },
        orderBy: [
          { group: { name: 'asc' } },
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      });

      return NextResponse.json({ students });
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
