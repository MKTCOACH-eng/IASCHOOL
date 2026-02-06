"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users,
  GraduationCap,
  MessageSquare,
  FileText,
  DollarSign,
  Bot,
  CalendarCheck,
  Download,
  ArrowLeft,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  PieChart,
  ClipboardList,
  BookOpen,
} from "lucide-react";

interface Metrics {
  overview: {
    totalUsers: number;
    totalStudents: number;
    totalGroups: number;
    totalParents: number;
    totalTeachers: number;
  };
  communication: {
    messagesCount: number;
    announcementsCount: number;
  };
  academic: {
    tasksCreated: number;
    submissionsCount: number;
    averageAttendance: number;
  };
  payments: {
    chargesTotal: number;
    chargesCount: number;
    paymentsTotal: number;
    paymentsCount: number;
    pendingTotal: number;
    pendingCount: number;
    collectionRate: number;
  };
  chatbot: {
    totalQueries: number;
    resolvedQueries: number;
    resolutionRate: number;
  };
  appointments: {
    scheduled: number;
    completed: number;
    completionRate: number;
  };
  trends: {
    date: string;
    dayName: string;
    messages: number;
    tasks: number;
    payments: number;
  }[];
  period: string;
}

export default function MetricsPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [exporting, setExporting] = useState(false);

  const user = session?.user as any;

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/metrics?period=${period}`);
      if (!res.ok) throw new Error("Error al cargar métricas");
      const data = await res.json();
      setMetrics(data);
    } catch (error) {
      toast.error("Error al cargar métricas");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: "metrics" | "report", reportType?: string) => {
    setExporting(true);
    try {
      let url = "";
      if (type === "metrics") {
        url = `/api/admin/metrics?period=${period}&export=csv`;
      } else {
        url = `/api/admin/metrics/report?type=${reportType}&export=csv`;
      }

      const res = await fetch(url);
      const blob = await res.blob();
      const urlObj = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlObj;
      a.download = type === "metrics" 
        ? `metricas_${period}_${new Date().toISOString().split("T")[0]}.csv`
        : `reporte_${reportType}_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      toast.success("Reporte exportado exitosamente");
    } catch (error) {
      toast.error("Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: any) => (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {trend > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : trend < 0 ? (
            <TrendingDown className="h-4 w-4 text-red-500" />
          ) : (
            <Minus className="h-4 w-4 text-gray-400" />
          )}
          <span className={`text-xs ${trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-500"}`}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        </div>
      )}
    </div>
  );

  const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  if (!metrics) return null;

  const maxTrendValue = Math.max(
    ...metrics.trends.map(t => Math.max(t.messages, t.tasks, t.payments / 100))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/directory")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Métricas y Reportes</h1>
            <p className="text-gray-600">Análisis completo del rendimiento escolar</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => handleExport("metrics")}
            disabled={exporting}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Total Alumnos"
          value={metrics.overview.totalStudents}
          icon={GraduationCap}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Total Padres"
          value={metrics.overview.totalParents}
          icon={Users}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Total Profesores"
          value={metrics.overview.totalTeachers}
          icon={BookOpen}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Total Grupos"
          value={metrics.overview.totalGroups}
          icon={ClipboardList}
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          title="Total Usuarios"
          value={metrics.overview.totalUsers}
          icon={Users}
          color="bg-gray-100 text-gray-600"
        />
      </div>

      {/* Main Metrics Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Communication */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#1B4079]" />
              Comunicación
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{metrics.communication.messagesCount}</p>
              <p className="text-sm text-gray-600">Mensajes enviados</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{metrics.communication.announcementsCount}</p>
              <p className="text-sm text-gray-600">Anuncios publicados</p>
            </div>
          </div>
        </div>

        {/* Academic */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#1B4079]" />
              Académico
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport("report", "academic")}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Exportar
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tareas creadas</span>
              <span className="font-semibold">{metrics.academic.tasksCreated}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Entregas recibidas</span>
              <span className="font-semibold">{metrics.academic.submissionsCount}</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Asistencia promedio</span>
                <span className="font-semibold text-green-600">{metrics.academic.averageAttendance}%</span>
              </div>
              <ProgressBar value={metrics.academic.averageAttendance} max={100} color="bg-green-500" />
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#1B4079]" />
              Pagos y Cobranza
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport("report", "payments")}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Exportar
            </Button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(metrics.payments.chargesTotal)}</p>
                <p className="text-xs text-gray-500">Total cargos ({metrics.payments.chargesCount})</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">{formatCurrency(metrics.payments.paymentsTotal)}</p>
                <p className="text-xs text-gray-500">Total recibido ({metrics.payments.paymentsCount})</p>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(metrics.payments.pendingTotal)}</p>
                  <p className="text-xs text-gray-500">Saldo pendiente ({metrics.payments.pendingCount} cargos)</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#1B4079]">{metrics.payments.collectionRate}%</p>
                  <p className="text-xs text-gray-500">Tasa de cobranza</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chatbot & Appointments */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bot className="h-5 w-5 text-[#1B4079]" />
              Chatbot y Citas
            </h3>
          </div>
          <div className="space-y-6">
            {/* Chatbot */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Chatbot IA</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">{metrics.chatbot.resolvedQueries} resueltas de {metrics.chatbot.totalQueries}</span>
                    <span className="text-xs font-medium text-[#1B4079]">{metrics.chatbot.resolutionRate}%</span>
                  </div>
                  <ProgressBar value={metrics.chatbot.resolutionRate} max={100} color="bg-[#1B4079]" />
                </div>
              </div>
            </div>
            
            {/* Appointments */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CalendarCheck className="h-4 w-4" />
                Citas Padre-Profesor
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">{metrics.appointments.completed} completadas de {metrics.appointments.scheduled}</span>
                    <span className="text-xs font-medium text-green-600">{metrics.appointments.completionRate}%</span>
                  </div>
                  <ProgressBar value={metrics.appointments.completionRate} max={100} color="bg-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trends Chart */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#1B4079]" />
            Tendencias (Últimos 7 días)
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded"></span> Mensajes
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded"></span> Tareas
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-500 rounded"></span> Pagos (x100)
            </span>
          </div>
        </div>
        
        <div className="flex items-end gap-2 h-48">
          {metrics.trends.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center gap-1 h-40">
                <div
                  className="w-3 bg-blue-500 rounded-t transition-all"
                  style={{ height: `${maxTrendValue > 0 ? (day.messages / maxTrendValue) * 100 : 0}%`, minHeight: day.messages > 0 ? '4px' : '0' }}
                  title={`${day.messages} mensajes`}
                />
                <div
                  className="w-3 bg-green-500 rounded-t transition-all"
                  style={{ height: `${maxTrendValue > 0 ? (day.tasks / maxTrendValue) * 100 : 0}%`, minHeight: day.tasks > 0 ? '4px' : '0' }}
                  title={`${day.tasks} tareas`}
                />
                <div
                  className="w-3 bg-yellow-500 rounded-t transition-all"
                  style={{ height: `${maxTrendValue > 0 ? ((day.payments / 100) / maxTrendValue) * 100 : 0}%`, minHeight: day.payments > 0 ? '4px' : '0' }}
                  title={`$${day.payments} pagos`}
                />
              </div>
              <span className="text-xs text-gray-500 capitalize">{day.dayName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Reports */}
      <div className="mt-6 bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Reportes rápidos</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: "general", label: "Reporte General", icon: PieChart },
            { type: "attendance", label: "Reporte de Asistencia", icon: ClipboardList },
            { type: "payments", label: "Reporte de Pagos", icon: DollarSign },
            { type: "academic", label: "Reporte Académico", icon: BookOpen },
          ].map((report) => (
            <Button
              key={report.type}
              variant="outline"
              onClick={() => handleExport("report", report.type)}
              disabled={exporting}
              className="h-auto py-4 flex-col gap-2"
            >
              <report.icon className="h-6 w-6 text-[#1B4079]" />
              <span className="text-sm">{report.label}</span>
              <span className="text-xs text-gray-400">Descargar CSV</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
