"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
  Award,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardData {
  student: {
    id: string;
    name: string;
    group: string;
    grade: string;
    teacher: string;
    school: string;
  };
  stats: {
    pendingTasks: number;
    submittedPending: number;
    averageGrade: number;
    attendance: Record<string, number>;
  };
  pendingTasks: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    subject: { name: string; color: string } | null;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    startDate: string;
    type: string;
  }>;
  recentGrades: Array<{
    id: string;
    score: number;
    task: {
      title: string;
      maxScore: number;
      subject: { name: string } | null;
    };
    reviewedAt: string;
  }>;
}

export function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/student/dashboard");
        if (!res.ok) throw new Error("Error al cargar dashboard");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">{error || "No se pudo cargar el dashboard"}</p>
      </div>
    );
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600";
    if (grade >= 80) return "text-blue-600";
    if (grade >= 70) return "text-yellow-600";
    if (grade >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const totalAttendance = Object.values(data.stats.attendance).reduce((a, b) => a + b, 0);
  const presentCount = (data.stats.attendance.PRESENTE || 0) + (data.stats.attendance.TARDANZA || 0);
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header con info del estudiante */}
      <div className="bg-gradient-to-r from-[#1B4079] to-[#2d5a9e] rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">¡Hola, {data.student.name.split(" ")[0]}!</h1>
        <p className="text-white/80">
          {data.student.group} • {data.student.school}
        </p>
        {data.student.teacher && (
          <p className="text-white/60 text-sm mt-1">Profesor: {data.student.teacher}</p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.pendingTasks}</p>
                <p className="text-xs text-gray-500">Tareas pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.submittedPending}</p>
                <p className="text-xs text-gray-500">Por calificar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${getGradeColor(data.stats.averageGrade)}`}>
                  {data.stats.averageGrade}
                </p>
                <p className="text-xs text-gray-500">Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{attendanceRate}%</p>
                <p className="text-xs text-gray-500">Asistencia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tareas Pendientes */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#1B4079]" />
                Tareas Pendientes
              </CardTitle>
              <Link href="/tasks">
                <Button variant="ghost" size="sm">Ver todas</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.pendingTasks.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">¡No tienes tareas pendientes!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.pendingTasks.map((task) => (
                  <Link key={task.id} href={`/tasks/${task.id}`}>
                    <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          {task.subject && (
                            <Badge
                              variant="secondary"
                              className="mt-1 text-xs"
                              style={{ backgroundColor: `${task.subject.color}20`, color: task.subject.color }}
                            >
                              {task.subject.name}
                            </Badge>
                          )}
                        </div>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500">
                            {format(new Date(task.dueDate), "d MMM", { locale: es })}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximos Eventos */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#1B4079]" />
                Próximos Eventos
              </CardTitle>
              <Link href="/calendar">
                <Button variant="ghost" size="sm">Ver calendario</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.upcomingEvents.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No hay eventos próximos</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[50px]">
                        <p className="text-lg font-bold text-[#1B4079]">
                          {format(new Date(event.startDate), "d")}
                        </p>
                        <p className="text-xs text-gray-500 uppercase">
                          {format(new Date(event.startDate), "MMM", { locale: es })}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calificaciones Recientes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#1B4079]" />
            Calificaciones Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentGrades.length === 0 ? (
            <p className="text-center text-gray-500 py-6">Aún no tienes calificaciones</p>
          ) : (
            <div className="space-y-2">
              {data.recentGrades.map((grade) => {
                const percentage = Math.round((grade.score / grade.task.maxScore) * 100);
                return (
                  <div key={grade.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{grade.task.title}</p>
                      {grade.task.subject && (
                        <p className="text-xs text-gray-500">{grade.task.subject.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getGradeColor(percentage)}`}>
                        {grade.score}/{grade.task.maxScore}
                      </p>
                      <p className="text-xs text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
