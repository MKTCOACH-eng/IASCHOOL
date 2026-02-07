"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  UserCheck,
  Building2,
  DollarSign,
  MessageSquare,
  ClipboardCheck,
  Star,
  UserPlus,
  Calendar,
  Bell,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface DashboardData {
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalParents: number;
    totalGroups: number;
    attendanceRate: number;
    collectionRate: number;
  };
  financial: {
    totalRevenue: number;
    collectedRevenue: number;
    pendingRevenue: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    revenueGrowth: number;
  };
  engagement: {
    messagesThisMonth: number;
    messagesLastMonth: number;
    messageGrowth: number;
    totalTasks: number;
    completedSubmissions: number;
  };
  nps: {
    score: number | null;
    category: string | null;
    responses: number;
    surveyTitle: string | null;
  };
  pipeline: {
    pendingEnrollments: number;
  };
  recentAnnouncements: Array<{
    id: string;
    title: string;
    priority: string;
    createdAt: string;
    _count: { reads: number };
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    startDate: string;
    type: string;
  }>;
}

export default function ExecutiveDashboardPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [session, status, userRole]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/executive-dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short'
    });
  };

  const GrowthIndicator = ({ value }: { value: number }) => {
    if (value > 0) {
      return (
        <span className="flex items-center text-green-600 text-sm font-medium">
          <ArrowUpRight className="w-4 h-4" />
          +{value}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center text-red-600 text-sm font-medium">
          <ArrowDownRight className="w-4 h-4" />
          {value}%
        </span>
      );
    }
    return (
      <span className="flex items-center text-gray-500 text-sm font-medium">
        <Minus className="w-4 h-4" />
        0%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se pudieron cargar los datos</p>
        <Button onClick={handleRefresh} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Ejecutivo</h1>
          <p className="text-gray-500">Vista general de métricas clave</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <GraduationCap className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{data.overview.totalStudents}</p>
              <p className="text-sm opacity-80">Alumnos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <Users className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{data.overview.totalTeachers}</p>
              <p className="text-sm opacity-80">Profesores</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <UserCheck className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{data.overview.totalParents}</p>
              <p className="text-sm opacity-80">Padres</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-4">
              <Building2 className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{data.overview.totalGroups}</p>
              <p className="text-sm opacity-80">Grupos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
            <CardContent className="p-4">
              <ClipboardCheck className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{data.overview.attendanceRate}%</p>
              <p className="text-sm opacity-80">Asistencia</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <DollarSign className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{data.overview.collectionRate}%</p>
              <p className="text-sm opacity-80">Cobranza</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Financial Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
                Finanzas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Recaudación este mes</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.financial.revenueThisMonth)}
                  </p>
                  <GrowthIndicator value={data.financial.revenueGrowth} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-gray-500">Cobrado total</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(data.financial.collectedRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pendiente</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(data.financial.pendingRevenue)}
                  </p>
                </div>
              </div>
              
              <Link href="/payments" className="block">
                <Button variant="outline" className="w-full" size="sm">
                  Ver detalles
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Mensajes este mes</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-900">
                    {data.engagement.messagesThisMonth.toLocaleString()}
                  </p>
                  <GrowthIndicator value={data.engagement.messageGrowth} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-gray-500">Tareas activas</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.engagement.totalTasks}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Entregas calificadas</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.engagement.completedSubmissions}
                  </p>
                </div>
              </div>
              
              <Link href="/messages" className="block">
                <Button variant="outline" className="w-full" size="sm">
                  Ver mensajes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* NPS & Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="w-5 h-5 text-yellow-500" />
                Satisfacción & Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.nps.score !== null ? (
                <div>
                  <p className="text-sm text-gray-500">NPS Score</p>
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-bold text-gray-900">
                      {data.nps.score}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      data.nps.category === 'Promotor' 
                        ? 'bg-green-100 text-green-700'
                        : data.nps.category === 'Neutral'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {data.nps.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{data.nps.responses} respuestas</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500">NPS Score</p>
                  <p className="text-gray-400 text-sm">Sin encuestas aún</p>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Solicitudes de inscripción</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {data.pipeline.pendingEnrollments}
                    </p>
                  </div>
                  <UserPlus className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
              </div>
              
              <Link href="/surveys" className="block">
                <Button variant="outline" className="w-full" size="sm">
                  Ver encuestas
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-lg">
                  <Bell className="w-5 h-5 text-orange-500" />
                  Anuncios Recientes
                </span>
                <Link href="/announcements">
                  <Button variant="ghost" size="sm">Ver todos</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentAnnouncements.length > 0 ? (
                <div className="space-y-3">
                  {data.recentAnnouncements.map((ann) => (
                    <div key={ann.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        {ann.priority === 'URGENT' && (
                          <span className="w-2 h-2 bg-red-500 rounded-full" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{ann.title}</p>
                          <p className="text-xs text-gray-400">{formatDate(ann.createdAt)}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {ann._count.reads} lecturas
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">Sin anuncios recientes</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Próximos Eventos
                </span>
                <Link href="/calendar">
                  <Button variant="ghost" size="sm">Ver todos</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {data.upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                        <p className="text-xs text-gray-400">{event.type}</p>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        {formatDate(event.startDate)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">Sin eventos próximos</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
