import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string;
}

// GET - Obtener métricas del chatbot (solo admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden ver métricas' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // días
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Estadísticas generales
    const [totalConversations, totalMessages, resolvedConversations, ratedConversations] = await Promise.all([
      prisma.chatbotConversation.count({
        where: {
          schoolId: user.schoolId,
          createdAt: { gte: startDate }
        }
      }),
      prisma.chatbotMessage.count({
        where: {
          conversation: {
            schoolId: user.schoolId,
            createdAt: { gte: startDate }
          }
        }
      }),
      prisma.chatbotConversation.count({
        where: {
          schoolId: user.schoolId,
          resolved: true,
          createdAt: { gte: startDate }
        }
      }),
      prisma.chatbotConversation.aggregate({
        where: {
          schoolId: user.schoolId,
          rating: { not: null },
          createdAt: { gte: startDate }
        },
        _avg: { rating: true },
        _count: { rating: true }
      })
    ]);

    // Conversaciones por día (últimos 7 días)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await prisma.chatbotConversation.count({
        where: {
          schoolId: user.schoolId,
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      });
      
      last7Days.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    // Usuarios más activos
    const topUsers = await prisma.chatbotConversation.groupBy({
      by: ['userId'],
      where: {
        schoolId: user.schoolId,
        createdAt: { gte: startDate }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    // Obtener detalles de usuarios
    const userIds = topUsers.map(u => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true }
    });

    const topUsersWithDetails = topUsers.map(u => {
      const userDetails = users.find(user => user.id === u.userId);
      return {
        ...u,
        user: userDetails
      };
    });

    // Tiempo promedio de respuesta
    const avgResponseTime = await prisma.chatbotMessage.aggregate({
      where: {
        role: 'assistant',
        responseTime: { not: null },
        conversation: {
          schoolId: user.schoolId,
          createdAt: { gte: startDate }
        }
      },
      _avg: { responseTime: true }
    });

    // Conversaciones recientes
    const recentConversations = await prisma.chatbotConversation.findMany({
      where: {
        schoolId: user.schoolId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      summary: {
        totalConversations,
        totalMessages,
        resolvedConversations,
        resolutionRate: totalConversations > 0 
          ? Math.round((resolvedConversations / totalConversations) * 100) 
          : 0,
        averageRating: ratedConversations._avg.rating || 0,
        ratingCount: ratedConversations._count.rating || 0,
        averageResponseTime: avgResponseTime._avg.responseTime 
          ? Math.round(avgResponseTime._avg.responseTime) 
          : 0
      },
      dailyStats: last7Days,
      topUsers: topUsersWithDetails,
      recentConversations
    });
  } catch (error) {
    console.error('Error fetching chatbot metrics:', error);
    return NextResponse.json(
      { error: 'Error al obtener métricas' },
      { status: 500 }
    );
  }
}
