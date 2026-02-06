"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Activity, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  Settings,
  User,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  userId: string | null;
  userEmail: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE_SCHOOL: "bg-green-100 text-green-800",
  UPDATE_SCHOOL: "bg-blue-100 text-blue-800",
  DEACTIVATE_SCHOOL: "bg-red-100 text-red-800",
  UPDATE_SCHOOL_SETTINGS: "bg-purple-100 text-purple-800",
  UPDATE_CONFIG: "bg-yellow-100 text-yellow-800",
  DELETE_CONFIG: "bg-red-100 text-red-800"
};

const ACTION_LABELS: Record<string, string> = {
  CREATE_SCHOOL: "Escuela Creada",
  UPDATE_SCHOOL: "Escuela Actualizada",
  DEACTIVATE_SCHOOL: "Escuela Desactivada",
  UPDATE_SCHOOL_SETTINGS: "Config. Escuela",
  UPDATE_CONFIG: "Config. Sistema",
  DELETE_CONFIG: "Config. Eliminada"
};

const ENTITY_ICONS: Record<string, any> = {
  School: Building2,
  SchoolSettings: Settings,
  User: User,
  SystemConfig: FileText
};

export default function AuditLogsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (entityFilter !== "all") params.set("entityType", entityFilter);
      
      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityFilter]);

  useEffect(() => {
    if (session?.user && (session.user as any).role === "SUPER_ADMIN") {
      fetchLogs();
    }
  }, [fetchLogs, session]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const parseDetails = (details: string | null) => {
    if (!details) return null;
    try {
      return JSON.parse(details);
    } catch {
      return details;
    }
  };

  if (status === "loading" || (loading && logs.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/super-admin" className="hover:text-[#1B4079]">Super Admin</Link>
          <span>/</span>
          <span>Auditoría</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Registros de Auditoría</h1>
        <p className="text-gray-500">Historial de acciones del sistema</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Filtrar por:</span>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                <SelectItem value="CREATE_SCHOOL">Crear Escuela</SelectItem>
                <SelectItem value="UPDATE_SCHOOL">Actualizar Escuela</SelectItem>
                <SelectItem value="DEACTIVATE_SCHOOL">Desactivar Escuela</SelectItem>
                <SelectItem value="UPDATE_SCHOOL_SETTINGS">Config. Escuela</SelectItem>
                <SelectItem value="UPDATE_CONFIG">Config. Sistema</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las entidades</SelectItem>
                <SelectItem value="School">Escuela</SelectItem>
                <SelectItem value="SchoolSettings">Config. Escuela</SelectItem>
                <SelectItem value="SystemConfig">Config. Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay registros de auditoría</p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => {
                const Icon = ENTITY_ICONS[log.entityType] || FileText;
                const details = parseDetails(log.details);
                
                return (
                  <div key={log.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={ACTION_COLORS[log.action] || "bg-gray-100 text-gray-800"}>
                            {ACTION_LABELS[log.action] || log.action}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {log.entityType}
                          </span>
                        </div>
                        {log.userEmail && (
                          <p className="text-sm text-gray-600 mt-1">
                            Por: <span className="font-medium">{log.userEmail}</span>
                          </p>
                        )}
                        {details && (
                          <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded font-mono text-xs">
                            {typeof details === "object" ? JSON.stringify(details, null, 2) : details}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500 shrink-0">
                        <p>{formatDate(log.createdAt)}</p>
                        {log.ipAddress && (
                          <p className="text-xs text-gray-400">{log.ipAddress}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {logs.length} de {pagination.total} registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page === pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
