import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// GET - Obtener configuración de reminders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
    }

    const configs = await prisma.reminderConfig.findMany({
      where: { schoolId: user.schoolId },
      orderBy: { reminderType: 'asc' }
    });

    // Obtener logs recientes
    const recentLogs = await prisma.reminderLog.findMany({
      where: { schoolId: user.schoolId },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { sentAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ configs, recentLogs });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json({ error: 'Error al obtener reminders' }, { status: 500 });
  }
}

// POST - Crear o actualizar configuración de reminder
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
    }

    const body = await request.json();
    const {
      reminderType,
      targetRoles,
      enabled,
      daysBeforeDue,
      sendTime,
      sendEmail,
      sendPush,
      sendInApp,
      customSubject,
      customMessage,
      maxReminders,
      intervalDays
    } = body;

    if (!reminderType) {
      return NextResponse.json({ error: 'Tipo de reminder requerido' }, { status: 400 });
    }

    // Upsert - crear o actualizar
    const config = await prisma.reminderConfig.upsert({
      where: {
        schoolId_reminderType: {
          schoolId: user.schoolId!,
          reminderType
        }
      },
      create: {
        schoolId: user.schoolId!,
        reminderType,
        targetRoles: targetRoles || ['PADRE'],
        enabled: enabled ?? true,
        daysBeforeDue: daysBeforeDue || 1,
        sendTime: sendTime || '09:00',
        sendEmail: sendEmail ?? true,
        sendPush: sendPush ?? true,
        sendInApp: sendInApp ?? true,
        customSubject,
        customMessage,
        maxReminders: maxReminders || 3,
        intervalDays: intervalDays || 1
      },
      update: {
        targetRoles,
        enabled,
        daysBeforeDue,
        sendTime,
        sendEmail,
        sendPush,
        sendInApp,
        customSubject,
        customMessage,
        maxReminders,
        intervalDays
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error saving reminder config:', error);
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 });
  }
}
