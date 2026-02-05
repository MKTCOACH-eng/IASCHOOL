"use client";

import { useState, useEffect } from "react";
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
import { ArrowLeft, Loader2, Save, Send } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Group {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

export default function NewTaskPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

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
  const canCreateTask = userRole === "PROFESOR" || userRole === "ADMIN";

  useEffect(() => {
    if (status === "authenticated") {
      if (!canCreateTask) {
        router.push("/tasks");
        return;
      }
      fetchData();
    }
  }, [status, canCreateTask]);

  const fetchData = async () => {
    try {
      const [groupsRes, subjectsRes] = await Promise.all([
        fetch("/api/groups/my-groups"),
        fetch("/api/subjects"),
      ]);
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

  const handleSubmit = async (publishNow: boolean) => {
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

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          dueDate: dueDate?.toISOString(),
          status: publishNow ? "PUBLISHED" : "DRAFT",
          subjectId: formData.subjectId === "none" ? null : formData.subjectId || null,
        }),
      });

      if (res.ok) {
        const task = await res.json();
        toast.success(
          publishNow ? "Tarea publicada exitosamente" : "Borrador guardado"
        );
        router.push(`/tasks/${task.id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al crear tarea");
      }
    } catch {
      toast.error("Error al crear tarea");
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/tasks"
          className="inline-flex items-center text-gray-600 hover:text-[#1B4079] mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a tareas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Tarea</h1>
        <p className="text-gray-600">Crea una nueva tarea para tu grupo</p>
      </div>

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
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
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
            onClick={() => handleSubmit(true)}
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
        </div>
      </div>
    </div>
  );
}
