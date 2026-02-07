"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Bell,
  ChevronDown,
  ChevronUp,
  Loader2,
  User,
  TrendingUp,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ChildSummary {
  id: string;
  name: string;
  group: string;
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    upcoming: Array<{
      title: string;
      subject: string;
      dueDate: string;
    }>;
  };
  attendance: {
    total: number;
    present: number;
    absent: number;
    late: number;
    justified: number;
  };
  grades: {
    recent: Array<{
      taskTitle: string;
      subject: string;
      score: number | null;
      maxScore: number;
      reviewedAt: string | null;
    }>;
    averageScore: number | null;
  };
}

interface WeeklySummary {
  period: {
    startDate: string;
    endDate: string;
  };
  children: ChildSummary[];
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    priority: string;
    createdAt: string;
    author: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    type: string;
    startDate: string;
    endDate: string | null;
    location: string | null;
    group: string | null;
    allDay: boolean;
  }>;
  pendingPayments: {
    total: number;
    count: number;
    items: Array<{
      id: string;
      concept: string;
      type: string;
      amount: number;
      amountPaid: number;
      remaining: number;
      dueDate: string;
      status: string;
      studentName: string;
    }>;
  };
}

export default function WeeklySummaryPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [expandedChild, setExpandedChild] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user && (session.user as { role?: string }).role !== "PADRE") {
      router.push("/dashboard");
      return;
    }

    if (session?.user) {
      fetchSummary();
    }
  }, [session, status, router]);

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/reports/weekly-summary");
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        if (data.summary.children.length > 0) {
          setExpandedChild(data.summary.children[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const getAttendancePercentage = (attendance: ChildSummary["attendance"]) => {
    if (attendance.total === 0) return 100;
    return Math.round((attendance.present / attendance.total) * 100);
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Sin datos disponibles</h2>
          <p className="text-gray-500 mt-2">No hay información para mostrar en el resumen semanal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resumen Semanal</h1>
          <p className="text-gray-600 mt-1">
            {formatDate(summary.period.startDate)} - {formatDate(summary.period.endDate)}
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Volver al Dashboard</Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Hijos</p>
                <p className="text-xl font-bold">{summary.children.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tareas Completadas</p>
                <p className="text-xl font-bold">
                  {summary.children.reduce((sum, c) => sum + c.tasks.completed, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Bell className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Comunicados</p>
                <p className="text-xl font-bold">{summary.announcements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pagos Pendientes</p>
                <p className="text-xl font-bold">
                  ${summary.pendingPayments.total.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children Summaries */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Resumen por Hijo</h2>
        {summary.children.map((child) => (
          <Card key={child.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() =>
                setExpandedChild(expandedChild === child.id ? null : child.id)
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1B4079] text-white rounded-full">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{child.name}</CardTitle>
                    <p className="text-sm text-gray-500">{child.group}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {child.tasks.overdue > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {child.tasks.overdue} vencidas
                    </Badge>
                  )}
                  {expandedChild === child.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            {expandedChild === child.id && (
              <CardContent className="border-t">
                <div className="grid md:grid-cols-3 gap-6 pt-4">
                  {/* Tasks */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Tareas
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Completadas</span>
                        <span className="font-medium text-green-600">
                          {child.tasks.completed}/{child.tasks.total}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Pendientes</span>
                        <span className="font-medium text-yellow-600">
                          {child.tasks.pending}
                        </span>
                      </div>
                      {child.tasks.overdue > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Vencidas</span>
                          <span className="font-medium text-red-600">
                            {child.tasks.overdue}
                          </span>
                        </div>
                      )}
                      {child.tasks.upcoming.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500 mb-2">Próximas entregas:</p>
                          {child.tasks.upcoming.map((task, idx) => (
                            <div key={idx} className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">{task.title}</span>
                              <span className="text-gray-400">
                                {" "}
                                - {formatDate(task.dueDate)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attendance */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Asistencia
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Porcentaje</span>
                        <span
                          className={`text-lg font-bold ${
                            getAttendancePercentage(child.attendance) >= 90
                              ? "text-green-600"
                              : getAttendancePercentage(child.attendance) >= 80
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {getAttendancePercentage(child.attendance)}%
                        </span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-green-600">✓ Presentes</span>
                          <span>{child.attendance.present}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600">✗ Faltas</span>
                          <span>{child.attendance.absent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-600">• Tardanzas</span>
                          <span>{child.attendance.late}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">• Justificadas</span>
                          <span>{child.attendance.justified}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grades */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Calificaciones Recientes
                    </h4>
                    {child.grades.averageScore !== null && (
                      <div className="mb-3 p-2 bg-gray-50 rounded-lg text-center">
                        <span className="text-xs text-gray-500">Promedio</span>
                        <p
                          className={`text-xl font-bold ${
                            child.grades.averageScore >= 90
                              ? "text-green-600"
                              : child.grades.averageScore >= 70
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {child.grades.averageScore}%
                        </p>
                      </div>
                    )}
                    {child.grades.recent.length > 0 ? (
                      <div className="space-y-2">
                        {child.grades.recent.map((grade, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-sm"
                          >
                            <div className="truncate flex-1 pr-2">
                              <span className="font-medium">{grade.taskTitle}</span>
                              <span className="text-xs text-gray-400 block">
                                {grade.subject}
                              </span>
                            </div>
                            <span
                              className={`font-bold ${getScoreColor(
                                grade.score || 0,
                                grade.maxScore
                              )}`}
                            >
                              {grade.score}/{grade.maxScore}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Sin calificaciones recientes</p>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Two columns: Announcements and Events */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Comunicados Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.announcements.length > 0 ? (
              <div className="space-y-3">
                {summary.announcements.map((ann) => (
                  <div key={ann.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-gray-900">{ann.title}</h4>
                      {ann.priority === "URGENT" && (
                        <Badge variant="destructive" className="text-xs">
                          Urgente
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{ann.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {ann.author} • {formatDate(ann.createdAt)}
                    </p>
                  </div>
                ))}
                <Link href="/announcements">
                  <Button variant="outline" className="w-full mt-2">
                    Ver todos los comunicados
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Sin comunicados esta semana</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {summary.upcomingEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-center min-w-[50px]">
                      <p className="text-xs text-gray-500">
                        {new Date(event.startDate).toLocaleDateString("es-MX", {
                          month: "short",
                        })}
                      </p>
                      <p className="text-xl font-bold text-[#1B4079]">
                        {new Date(event.startDate).getDate()}
                      </p>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {event.type}
                        </Badge>
                        {event.location && <span>{event.location}</span>}
                        {event.group && <span>• {event.group}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/calendar">
                  <Button variant="outline" className="w-full mt-2">
                    Ver calendario completo
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Sin eventos próximos</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      {summary.pendingPayments.count > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <DollarSign className="h-5 w-5" /> Pagos Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.pendingPayments.items.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{payment.concept}</h4>
                    <p className="text-sm text-gray-500">
                      {payment.studentName} • Vence: {formatDate(payment.dueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      ${payment.remaining.toLocaleString()}
                    </p>
                    {payment.status === "VENCIDO" && (
                      <Badge variant="destructive" className="text-xs">
                        Vencido
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              <Link href="/payments">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Ir a Pagos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
