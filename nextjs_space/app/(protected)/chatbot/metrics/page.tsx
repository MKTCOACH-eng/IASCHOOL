'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bot,
  MessageSquare,
  Users,
  Star,
  Clock,
  TrendingUp,
  CheckCircle,
  Loader2,
  ArrowLeft,
  BarChart3
} from 'lucide-react';

interface DailyStat {
  date: string;
  count: number;
}

interface TopUser {
  userId: string;
  _count: { id: number };
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface RecentConversation {
  id: string;
  messageCount: number;
  resolved: boolean;
  rating: number | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  messages: { content: string }[];
}

interface MetricsData {
  summary: {
    totalConversations: number;
    totalMessages: number;
    resolvedConversations: number;
    resolutionRate: number;
    averageRating: number;
    ratingCount: number;
    averageResponseTime: number;
  };
  dailyStats: DailyStat[];
  topUsers: TopUser[];
  recentConversations: RecentConversation[];
}

const ROLES: Record<string, string> = {
  ADMIN: 'Administrador',
  PROFESOR: 'Profesor',
  PADRE: 'Padre de Familia',
  ALUMNO: 'Alumno',
  VOCAL: 'Vocal'
};

export default function ChatbotMetricsPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

  useEffect(() => {
    if (session && !isAdmin) {
      router.push('/dashboard');
    }
  }, [session, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchMetrics();
    }
  }, [period, isAdmin]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/chatbot/metrics?period=${period}`);
      if (!res.ok) throw new Error('Error al cargar métricas');
      const data = await res.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading || !metrics) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  const maxDailyCount = Math.max(...metrics.dailyStats.map(d => d.count), 1);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Link href="/chatbot" className="inline-flex items-center text-gray-600 hover:text-[#1B4079] mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Chatbot
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Métricas del Chatbot IA
          </h1>
          <p className="text-gray-600 mt-1">Análisis de uso y rendimiento del asistente virtual</p>
        </div>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
            <SelectItem value="90">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.summary.totalConversations}</p>
              <p className="text-sm text-gray-500">Conversaciones</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Bot className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.summary.totalMessages}</p>
              <p className="text-sm text-gray-500">Mensajes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.summary.resolutionRate}%</p>
              <p className="text-sm text-gray-500">Tasa de resolución</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {metrics.summary.averageRating > 0 ? metrics.summary.averageRating.toFixed(1) : '-'}
                <span className="text-sm font-normal text-gray-400">/5</span>
              </p>
              <p className="text-sm text-gray-500">
                Calificación ({metrics.summary.ratingCount})
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Daily Chart */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Conversaciones por Día (Últimos 7 días)
          </h2>
          <div className="h-48 flex items-end gap-2">
            {metrics.dailyStats.map((stat, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-[#1B4079] rounded-t transition-all hover:bg-[#2d5a9e]"
                  style={{ height: `${(stat.count / maxDailyCount) * 100}%`, minHeight: stat.count > 0 ? '8px' : '2px' }}
                  title={`${stat.count} conversaciones`}
                />
                <span className="text-xs text-gray-500 mt-2">
                  {new Date(stat.date).toLocaleDateString('es-MX', { weekday: 'short' })}
                </span>
                <span className="text-xs font-medium">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Response Time & Stats */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Rendimiento
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Tiempo de respuesta promedio</span>
              <span className="font-semibold">
                {metrics.summary.averageResponseTime > 0 
                  ? `${(metrics.summary.averageResponseTime / 1000).toFixed(1)}s`
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Mensajes por conversación</span>
              <span className="font-semibold">
                {metrics.summary.totalConversations > 0
                  ? (metrics.summary.totalMessages / metrics.summary.totalConversations).toFixed(1)
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Conversaciones resueltas</span>
              <span className="font-semibold text-green-600">
                {metrics.summary.resolvedConversations} de {metrics.summary.totalConversations}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios Más Activos
          </h2>
          {metrics.topUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay datos aún</p>
          ) : (
            <div className="space-y-3">
              {metrics.topUsers.map((item, index) => (
                <div key={item.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#1B4079] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.user?.name || 'Usuario'}</p>
                    <p className="text-xs text-gray-500">{ROLES[item.user?.role] || item.user?.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#1B4079]">{item._count.id}</p>
                    <p className="text-xs text-gray-500">conversaciones</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversaciones Recientes
          </h2>
          {metrics.recentConversations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay conversaciones aún</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {metrics.recentConversations.map((conv) => (
                <div key={conv.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-sm">{conv.user?.name || 'Usuario'}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(conv.createdAt).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.messages?.[0]?.content || 'Sin mensaje'}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="text-gray-500">{conv.messageCount} mensajes</span>
                    {conv.resolved && (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Resuelto
                      </span>
                    )}
                    {conv.rating && (
                      <span className="text-yellow-600 flex items-center gap-1">
                        <Star className="h-3 w-3" fill="currentColor" /> {conv.rating}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
