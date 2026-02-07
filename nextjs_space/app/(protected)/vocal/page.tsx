"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  Megaphone,
  Users,
  PiggyBank,
  TrendingUp,
  Calendar,
  ChevronRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";

interface Fund {
  id: string;
  title: string;
  amountPerStudent: number;
  totalCollected: number;
  dueDate: string | null;
  status: string;
  group: { id: string; name: string };
  stats: {
    paidCount: number;
    pendingCount: number;
    totalContributions: number;
    totalCollected: number;
    totalExpenses: number;
    balance: number;
  };
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  group: { id: string; name: string };
  isPinned: boolean;
}

interface GroupInfo {
  id: string;
  name: string;
  isPrimary: boolean;
}

export default function VocalDashboard() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const { t } = useLanguage();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [vocalGroups, setVocalGroups] = useState<GroupInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const user = session?.user as { role?: string; id?: string } | undefined;

  useEffect(() => {
    if (session === null) {
      router.push("/login");
      return;
    }

    if (user && !["VOCAL", "ADMIN", "SUPER_ADMIN", "PADRE"].includes(user.role || "")) {
      router.push("/dashboard");
      return;
    }

    if (user) {
      fetchData();
    }
  }, [session, user, router]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Obtener colectas
      const fundsRes = await fetch("/api/vocal/funds");
      if (fundsRes.ok) {
        const fundsData = await fundsRes.json();
        setFunds(fundsData);
      }

      // Obtener avisos
      const announcementsRes = await fetch("/api/vocal/announcements");
      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json();
        setAnnouncements(announcementsData);
      }

      // Obtener grupos donde es vocal (solo si es VOCAL)
      if (user?.role === "VOCAL") {
        const groupsRes = await fetch("/api/groups/my-groups");
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          setVocalGroups(groupsData.filter((g: { isVocal?: boolean }) => g.isVocal).map((g: { id: string; name: string; isPrimary?: boolean }) => ({
            id: g.id,
            name: g.name,
            isPrimary: g.isPrimary || false
          })));
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeFunds = funds.filter(f => f.status === "ACTIVE");
  const totalCollected = funds.reduce((sum, f) => sum + f.stats.totalCollected, 0);
  const totalBalance = funds.reduce((sum, f) => sum + f.stats.balance, 0);
  const unreadAnnouncements = announcements.filter(a => !a.isRead).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Activa</Badge>;
      case "PAUSED":
        return <Badge className="bg-yellow-100 text-yellow-800">Pausada</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800">Completada</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4079]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Vocal</h1>
          <p className="text-gray-600">Gestiona colectas, avisos y actividades de tu grupo</p>
        </div>
        {user?.role === "VOCAL" && (
          <div className="flex gap-2">
            <Link href="/vocal/funds/new">
              <Button className="bg-[#1B4079] hover:bg-[#1B4079]/90">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Colecta
              </Button>
            </Link>
            <Link href="/vocal/announcements/new">
              <Button variant="outline">
                <Megaphone className="w-4 h-4 mr-2" />
                Nuevo Aviso
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Colectas Activas</p>
                <p className="text-2xl font-bold text-gray-900">{activeFunds.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <PiggyBank className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recaudado</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalCollected.toLocaleString("es-MX")}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Balance Disponible</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalBalance.toLocaleString("es-MX")}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avisos Sin Leer</p>
                <p className="text-2xl font-bold text-gray-900">{unreadAnnouncements}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Megaphone className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Vocales */}
      {user?.role === "VOCAL" && vocalGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Mis Grupos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vocalGroups.map(group => (
                <div
                  key={group.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      {group.isPrimary && (
                        <Badge variant="outline" className="mt-1">Vocal Principal</Badge>
                      )}
                    </div>
                    <Link href={`/vocal/funds?groupId=${group.id}`}>
                      <Button variant="ghost" size="sm">
                        Ver Colectas
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Funds */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Colectas Recientes
          </CardTitle>
          <Link href="/vocal/funds">
            <Button variant="ghost" size="sm">
              Ver todas
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {funds.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <PiggyBank className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay colectas aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {funds.slice(0, 5).map(fund => (
                <Link key={fund.id} href={`/vocal/funds/${fund.id}`}>
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{fund.title}</h3>
                          {getStatusBadge(fund.status)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{fund.group.name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            {fund.stats.paidCount} pagados
                          </span>
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Clock className="w-4 h-4" />
                            {fund.stats.pendingCount} pendientes
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${fund.stats.totalCollected.toLocaleString("es-MX")}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${fund.amountPerStudent} por alumno
                        </p>
                        {fund.dueDate && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(fund.dueDate).toLocaleDateString("es-MX")}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{
                            width: `${fund.stats.totalContributions > 0
                              ? (fund.stats.paidCount / fund.stats.totalContributions) * 100
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Announcements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Avisos del Grupo
          </CardTitle>
          <Link href="/vocal/announcements">
            <Button variant="ghost" size="sm">
              Ver todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay avisos aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.slice(0, 5).map(announcement => (
                <div
                  key={announcement.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    !announcement.isRead ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {announcement.isPinned && (
                          <Badge variant="outline" className="text-xs">
                            📌 Fijado
                          </Badge>
                        )}
                        <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                        {!announcement.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {announcement.group.name} •{" "}
                        {new Date(announcement.createdAt).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
