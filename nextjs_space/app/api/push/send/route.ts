import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId?: string;
}

// This is a helper endpoint for sending push notifications
// In a real app, you would use web-push library with VAPID keys
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const user = session.user as SessionUser;

    // Only admins and teachers can send push notifications
    if (!['ADMIN', 'SUPER_ADMIN', 'PROFESOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const { title, body, userIds, url, tag } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Título y cuerpo son requeridos' },
        { status: 400 }
      );
    }

    // Get active subscriptions for target users
    const whereClause: Record<string, unknown> = {
      isActive: true
    };

    if (userIds && userIds.length > 0) {
      whereClause.userId = { in: userIds };
    } else if (user.schoolId) {
      // If no specific users, send to all users in the school
      whereClause.user = {
        schoolId: user.schoolId
      };
    }

    const subscriptions = await db.pushSubscription.findMany({
      where: whereClause,
      select: {
        id: true,
        endpoint: true,
        p256dh: true,
        auth: true,
        userId: true
      }
    });

    // Note: To actually send push notifications, you need:
    // 1. VAPID keys (public and private)
    // 2. web-push library
    // Example with web-push:
    // 
    // import webpush from 'web-push';
    // webpush.setVapidDetails(
    //   'mailto:admin@iaschool.edu',
    //   process.env.VAPID_PUBLIC_KEY,
    //   process.env.VAPID_PRIVATE_KEY
    // );
    //
    // for (const sub of subscriptions) {
    //   await webpush.sendNotification(
    //     { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
    //     JSON.stringify({ title, body, url, tag })
    //   );
    // }

    // For now, we just return the count of subscriptions that would receive the notification
    return NextResponse.json({
      success: true,
      message: `Notificación enviada a ${subscriptions.length} dispositivos`,
      count: subscriptions.length
    });
  } catch (error) {
    console.error('Error sending push:', error);
    return NextResponse.json(
      { error: 'Error al enviar notificación' },
      { status: 500 }
    );
  }
}
