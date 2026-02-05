"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  dueDate: string | null;
  maxScore: number;
  subject: { id: string; name: string; color: string } | null;
  group: { id: string; name: string };
  teacher: { id: string; name: string };
  _count: { submissions: number };
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
}

export default function TasksPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const isTeacher = (session?.user as { role?: string })?.role === "PROFESOR";
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const canCreateTask = isTeacher || isAdmin;

  useEffect(() => {
    if (status === "authenticated") {
      fetchTasks();
      fetchGroups();
    }
  }, [status]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {
      toast.error("Error al cargar tareas");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups/my-groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch {
      console.error("Error fetching groups");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGroup = filterGroup === "all" || task.group.id === filterGroup;
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="secondary">Borrador</Badge>;
      case "PUBLISHED":
        return <Badge className="bg-green-500">Publicada</Badge>;
      case "CLOSED":
        return <Badge variant="destructive">Cerrada</Badge>;
      default:
        return null;
    }
  };

  const getDueDateInfo = (dueDate: string | null) => {
    if (!dueDate) return { text: "Sin fecha límite", className: "text-gray-500" };
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) {
      return { text: "Vencida", className: "text-red-500" };
    }
    if (isToday(date)) {
      return { text: "Hoy", className: "text-orange-500" };
    }
    if (isTomorrow(date)) {
      return { text: "Mañana", className: "text-yellow-600" };
    }
    return {
      text: format(date, "d 'de' MMMM", { locale: es }),
      className: "text-gray-600",
    };
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-600">
            {canCreateTask
              ? "Gestiona las tareas de tus grupos"
              : "Revisa las tareas de tus hijos"}
          </p>
        </div>
        {canCreateTask && (
          <Button
            onClick={() => router.push("/tasks/new")}
            className="bg-[#1B4079] hover:bg-[#143056]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Tarea
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por grupo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los grupos</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canCreateTask && (
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="DRAFT">Borrador</SelectItem>
              <SelectItem value="PUBLISHED">Publicada</SelectItem>
              <SelectItem value="CLOSED">Cerrada</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay tareas
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterGroup !== "all" || filterStatus !== "all"
              ? "No se encontraron tareas con los filtros seleccionados"
              : canCreateTask
              ? "Crea tu primera tarea para comenzar"
              : "Aún no hay tareas asignadas"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const dueDateInfo = getDueDateInfo(task.dueDate);
            return (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="block bg-white rounded-lg border border-gray-200 hover:border-[#1B4079] hover:shadow-md transition-all p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {task.title}
                    </h3>
                    {task.subject && (
                      <span
                        className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${task.subject.color}20`,
                          color: task.subject.color,
                        }}
                      >
                        {task.subject.name}
                      </span>
                    )}
                  </div>
                  {canCreateTask && getStatusBadge(task.status)}
                </div>

                {task.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{task.group.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span className={dueDateInfo.className}>
                      {dueDateInfo.text}
                    </span>
                  </div>
                </div>

                {canCreateTask && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{task._count.submissions} entregas</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
