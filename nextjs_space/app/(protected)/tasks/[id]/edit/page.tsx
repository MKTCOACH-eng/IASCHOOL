"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Save, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

interface Group {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  dueDate: string | null;
  maxScore: number;
  groupId: string;
  subjectId: string | null;
  teacher: { id: string };
  _count?: { submissions: number };
}

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [task, setTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    groupId: "",
    subjectId: "",
    dueDate: "",
    dueTime: "23:59",
    maxScore: 100,
  });

  const userRole = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;
  const canEdit = userRole === "ADMIN" || (userRole === "PROFESOR" && task?.teacher.id === userId);
  const hasSubmissions = (task?._count?.submissions || 0) > 0;

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, resolvedParams.id]);

  const fetchData = async () => {
    try {
      const [taskRes, groupsRes, subjectsRes] = await Promise.all([
        fetch(`/api/tasks/${resolvedParams.id}`),
        fetch("/api/groups/my-groups"),
        fetch("/api/subjects"),
      ]);

      if (taskRes.ok) {
        const taskData = await taskRes.json();
        setTask(taskData);

        // Parse date and time from dueDate
        let dueDate = "";
        let dueTime = "23:59";
        if (taskData.dueDate) {
          const date = new Date(taskData.dueDate);
          dueDate = format(date, "yyyy-MM-dd");
          dueTime = format(date, "HH:mm");
        }

        setFormData({
          title: taskData.title || "",
          description: taskData.description || "",
          instructions: taskData.instructions || "",
          groupId: taskData.groupId || "",
          subjectId: taskData.subjectId || "none",
          dueDate,
          dueTime,
          maxScore: taskData.maxScore || 100,
        });
      } else {
        toast.error("Tarea no encontrada");
        router.push("/tasks");
        return;
      }

      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setGroups(groupsData);
      }
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);
      }
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (newStatus?: string) => {
    if (!formData.title.trim()) {
      toast.error("El título es requerido");
      return;
    }
    if (!formData.groupId) {
      toast.error("Selecciona un grupo");
      return;
    }

    setLoading(true);
    try {
      let dueDate = null;
      if (formData.dueDate) {
        dueDate = new Date(`${formData.dueDate}T${formData.dueTime}:00`);
      }

      const body: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        dueDate: dueDate?.toISOString() || null,
        maxScore: formData.maxScore,
        subjectId: formData.subjectId === "none" ? null : formData.subjectId || null,
      };

      // Solo permitir cambiar grupo si no hay entregas
      if (!hasSubmissions) {
        body.groupId = formData.groupId;
      }

      // Cambiar estado si se especifica
      if (newStatus) {
        body.status = newStatus;
      }

      const res = await fetch(`/api/tasks/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(newStatus === "PUBLISHED" ? "Tarea publicada" : "Cambios guardados");
        router.push(`/tasks/${resolvedParams.id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al guardar cambios");
      }
    } catch {
      toast.error("Error al guardar cambios");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Sin permisos</h1>
        <p className="text-gray-600 mb-4">No tienes permiso para editar esta tarea</p>
        <Link href="/tasks">
          <Button>Volver a tareas</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (task?.status) {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/tasks/${resolvedParams.id}`}
          className="inline-flex items-center text-gray-600 hover:text-[#1B4079] mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a la tarea
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Editar Tarea</h1>
          {getStatusBadge()}
        </div>
        <p className="text-gray-600">Modifica los detalles de la tarea</p>
      </div>

      {/* Warning for published tasks */}
      {task?.status === "PUBLISHED" && hasSubmissions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Tarea con entregas</p>
              <p className="text-sm text-yellow-700">
                Esta tarea tiene {task._count?.submissions} entrega(s). 
                No podrás cambiar el grupo asignado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            placeholder="Ej: Ejercicios de matemáticas capítulo 5"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        {/* Group and Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Grupo *</Label>
            <Select
              value={formData.groupId}
              onValueChange={(value) =>
                setFormData({ ...formData, groupId: value })
              }
              disabled={hasSubmissions}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un grupo" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasSubmissions && (
              <p className="text-xs text-gray-500">No se puede cambiar el grupo</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Materia (opcional)</Label>
            <Select
              value={formData.subjectId}
              onValueChange={(value) =>
                setFormData({ ...formData, subjectId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una materia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin materia</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Describe brevemente la tarea..."
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <Label htmlFor="instructions">Instrucciones</Label>
          <Textarea
            id="instructions"
            placeholder="Instrucciones detalladas para completar la tarea..."
            rows={5}
            value={formData.instructions}
            onChange={(e) =>
              setFormData({ ...formData, instructions: e.target.value })
            }
          />
        </div>

        {/* Due Date and Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Fecha límite</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueTime">Hora límite</Label>
            <Input
              id="dueTime"
              type="time"
              value={formData.dueTime}
              onChange={(e) =>
                setFormData({ ...formData, dueTime: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxScore">Puntuación máxima</Label>
            <Input
              id="maxScore"
              type="number"
              min={1}
              max={1000}
              value={formData.maxScore}
              onChange={(e) =>
                setFormData({ ...formData, maxScore: parseInt(e.target.value) || 100 })
              }
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          {task?.status === "DRAFT" ? (
            <>
              <Button
                variant="outline"
                onClick={() => handleSubmit()}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Guardar borrador
              </Button>
              <Button
                onClick={() => handleSubmit("PUBLISHED")}
                disabled={loading}
                className="flex-1 bg-[#1B4079] hover:bg-[#143056]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Publicar tarea
              </Button>
            </>
          ) : (
            <Button
              onClick={() => handleSubmit()}
              disabled={loading}
              className="flex-1 bg-[#1B4079] hover:bg-[#143056]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar cambios
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
