"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  BarChart3,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface SubjectStat {
  id: string;
  name: string;
  color: string;
  averageScore: number | null;
  totalTasks: number;
  completedTasks: number;
  completionRate?: number;
}

interface StudentStat {
  id: string;
  firstName: string;
  lastName: string;
  groupName: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  lateTasks: number;
  averageScore: number;
  completionRate: number;
  bySubject: SubjectStat[];
}

interface ActivityItem {
  id: string;
  type: "submitted" | "graded";
  studentName: string;
  taskTitle: string;
  subjectName: string;
  score: number | null;
  maxScore: number;
  date: string;
  isLate: boolean;
}

interface AcademicStats {
  students: StudentStat[];
  summary: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    lateTasks: number;
    averageScore: number;
    completionRate: number;
  };
  bySubject: SubjectStat[];
  recentActivity: ActivityItem[];
}

export default function AcademicProgressPage() {
  const { data: session, status } = useSession() || {};
  const [stats, setStats] = useState<AcademicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");

  const userRole = (session?.user as { role?: string })?.role;
  const isParent = userRole === "PADRE";

  useEffect(() => {
    if (status === "authenticated") {
      fetchStats();
    }
  }, [status, selectedStudent]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const url = selectedStudent !== "all"
        ? `/api/academic/stats?studentId=${selectedStudent}`
        : "/api/academic/stats";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        toast.error("Error al cargar estadísticas");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-100";
    if (score >= 70) return "bg-blue-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  if (!stats) return null;

  const pieData = [
    { name: "Completadas", value: stats.summary.completedTasks, color: "#22c55e" },
    { name: "Pendientes", value: stats.summary.pendingTasks, color: "#f59e0b" },
  ];

  const subjectChartData = stats.bySubject
    .filter((s) => s.averageScore !== null)
    .map((s) => ({
      name: s.name.length > 12 ? s.name.substring(0, 12) + "..." : s.name,
      promedio: s.averageScore,
      fill: s.color,
    }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#1B4079]" />
            Progreso Académico
          </h1>
          <p className="text-gray-600">
            {isParent
              ? "Seguimiento del rendimiento de tus hijos"
              : "Resumen del desempeño académico"}
          </p>
        </div>

        {stats.students.length > 1 && (
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Seleccionar estudiante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estudiantes</SelectItem>
              {stats.students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Promedio General</p>
                <p className={`text-3xl font-bold ${getScoreColor(stats.summary.averageScore)}`}>
                  {stats.summary.averageScore > 0 ? stats.summary.averageScore.toFixed(1) : "--"}
                </p>
              </div>
              <div className={`p-3 rounded-full ${getScoreBg(stats.summary.averageScore)}`}>
                <Award className={`w-6 h-6 ${getScoreColor(stats.summary.averageScore)}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tareas Completadas</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.summary.completedTasks}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tareas Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.summary.pendingTasks}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Entregas Tardías</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.summary.lateTasks}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1B4079]" />
            Tasa de Completitud
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={stats.summary.completionRate} className="flex-1 h-4" />
            <span className="text-lg font-semibold text-[#1B4079] min-w-[60px]">
              {stats.summary.completionRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {stats.summary.completedTasks} de {stats.summary.totalTasks} tareas completadas
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart - Task Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución de Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.summary.totalTasks > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No hay tareas registradas
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Promedio por Materia</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={subjectChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Promedio"]}
                  />
                  <Bar dataKey="promedio" radius={[0, 4, 4, 0]}>
                    {subjectChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No hay calificaciones registradas
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#1B4079]" />
              Detalle por Materia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.bySubject.length > 0 ? (
              <div className="space-y-4">
                {stats.bySubject.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{subject.name}</p>
                        <p className="text-sm text-gray-500">
                          {subject.completedTasks}/{subject.totalTasks} tareas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {subject.averageScore !== null ? (
                        <p className={`text-xl font-bold ${getScoreColor(subject.averageScore)}`}>
                          {subject.averageScore.toFixed(1)}
                        </p>
                      ) : (
                        <p className="text-gray-400">Sin calificar</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No hay materias registradas</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 6).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`p-1.5 rounded-full ${
                        activity.type === "graded" ? "bg-green-100" : "bg-blue-100"
                      }`}
                    >
                      {activity.type === "graded" ? (
                        <Award className="w-4 h-4 text-green-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.taskTitle}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.studentName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {activity.type === "graded" && activity.score !== null && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.score}/{activity.maxScore}
                          </Badge>
                        )}
                        {activity.isLate && (
                          <Badge variant="destructive" className="text-xs">
                            Tarde
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          {format(new Date(activity.date), "d MMM", { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Sin actividad reciente</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student List (for teachers/admins) */}
      {!isParent && stats.students.length > 1 && selectedStudent === "all" && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1B4079]" />
              Rendimiento por Estudiante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Estudiante</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Grupo</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Promedio</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Completadas</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Pendientes</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Tardías</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.students.map((student) => (
                    <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{student.groupName}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-bold ${getScoreColor(student.averageScore)}`}
                        >
                          {student.averageScore > 0 ? student.averageScore.toFixed(1) : "--"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-green-600 font-medium">
                        {student.completedTasks}
                      </td>
                      <td className="py-3 px-4 text-center text-yellow-600 font-medium">
                        {student.pendingTasks}
                      </td>
                      <td className="py-3 px-4 text-center text-red-600 font-medium">
                        {student.lateTasks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
