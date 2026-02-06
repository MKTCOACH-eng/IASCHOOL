"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Plus,
  Settings,
  Activity,
  School,
  ChevronRight,
  BookOpen,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardData {
  overview: {
    totalSchools: number;
    activeSchools: number;
    inactiveSchools: number;
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalParents: number;
    newSchoolsThisMonth: number;
    newUsersThisMonth: number;
    schoolGrowth: number;
  };
  recentSchools: any[];
  schoolsWithStats: any[];
}

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchDashboard();
  }, [session, status, router]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        const dashboardData = await res.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Error al cargar el dashboard</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Escuelas",
      value: data.overview.totalSchools,
      icon: Building2,
      color: "bg-blue-500",
      subtitle: `${data.overview.activeSchools} activas`
    },
    {
      title: "Total Usuarios",
      value: data.overview.totalUsers,
      icon: Users,
      color: "bg-green-500",
      subtitle: `+${data.overview.newUsersThisMonth} este mes`
    },
    {
      title: "Total Alumnos",
      value: data.overview.totalStudents,
      icon: GraduationCap,
      color: "bg-purple-500",
      subtitle: `${data.overview.totalTeachers} profesores`
    },
    {
      title: "Crecimiento",
      value: `${data.overview.schoolGrowth >= 0 ? "+" : ""}${data.overview.schoolGrowth}%`,
      icon: TrendingUp,
      color: "bg-orange-500",
      subtitle: "vs. mes anterior"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Super Administrador</h1>
          <p className="text-gray-500">Gestión global del sistema IA School</p>
        </div>
        <div className="flex gap-2">
          <Link href="/super-admin/schools">
            <Button variant="outline" className="gap-2">
              <Building2 className="h-4 w-4" />
              Ver Escuelas
            </Button>
          </Link>
          <Link href="/super-admin/schools?action=create">
            <Button className="gap-2 bg-[#1B4079] hover:bg-[#15325f]">
              <Plus className="h-4 w-4" />
              Nueva Escuela
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Escuelas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentSchools.map((school) => (
                <Link key={school.id} href={`/super-admin/schools/${school.id}`}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#1B4079] rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{school.name}</p>
                        <p className="text-sm text-gray-500">{school.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-gray-900">{school._count.users} usuarios</p>
                        <p className="text-gray-500">{school._count.students} alumnos</p>
                      </div>
                      <Badge variant={school.isActive ? "default" : "secondary"}>
                        {school.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
              {data.recentSchools.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay escuelas registradas</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/super-admin/schools">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Building2 className="h-4 w-4" />
                Gestionar Escuelas
              </Button>
            </Link>
            <Link href="/super-admin/config">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Settings className="h-4 w-4" />
                Configuración del Sistema
              </Button>
            </Link>
            <Link href="/super-admin/audit">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Activity className="h-4 w-4" />
                Registros de Auditoría
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* School Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resumen por Escuela
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Escuela</th>
                  <th className="pb-3 font-medium text-center">Usuarios</th>
                  <th className="pb-3 font-medium text-center">Alumnos</th>
                  <th className="pb-3 font-medium text-center">Grupos</th>
                  <th className="pb-3 font-medium text-center">Anuncios</th>
                  <th className="pb-3 font-medium text-center">Documentos</th>
                </tr>
              </thead>
              <tbody>
                {data.schoolsWithStats.map((school) => (
                  <tr key={school.id} className="border-b last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1B4079] rounded flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{school.name}</p>
                          <p className="text-xs text-gray-500">{school.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        {school._count.users}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        {school._count.students}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        {school._count.groups}
                      </span>
                    </td>
                    <td className="py-4 text-center">{school._count.announcements}</td>
                    <td className="py-4 text-center">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-4 w-4 text-gray-400" />
                        {school._count.documents}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.schoolsWithStats.length === 0 && (
              <p className="text-center text-gray-500 py-8">No hay escuelas activas</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
