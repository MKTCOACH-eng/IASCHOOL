"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  Send,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  submissions: { id: string; status: string; score: number | null }[];
}

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
}

interface Submission {
  id: string;
  studentId: string;
  student: { firstName: string; lastName: string };
  content: string | null;
  status: string;
  score: number | null;
  feedback: string | null;
  isLate: boolean;
  submittedAt: string;
  attachments: Attachment[];
  reviewedBy: { name: string } | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  dueDate: string | null;
  maxScore: number;
  subject: { id: string; name: string; color: string } | null;
  group: {
    id: string;
    name: string;
    students: Student[];
  };
  teacher: { id: string; name: string; email: string };
  attachments: Attachment[];
  submissions: Submission[];
  createdAt: string;
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [grading, setGrading] = useState<string | null>(null);
  
  // For parents: submission form
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [submissionContent, setSubmissionContent] = useState("");
  const [children, setChildren] = useState<Student[]>([]);
  
  // For teachers: grading
  const [gradeData, setGradeData] = useState<Record<string, { score: string; feedback: string }>>({
  });

  const userRole = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;
  const isTeacher = userRole === "PROFESOR";
  const isAdmin = userRole === "ADMIN";
  const isParent = userRole === "PADRE";
  const canManage = (isTeacher && task?.teacher.id === userId) || isAdmin;

  useEffect(() => {
    if (status === "authenticated") {
      fetchTask();
    }
  }, [status, resolvedParams.id]);

  useEffect(() => {
    if (task && isParent) {
      const myChildren = task.group.students;
      setChildren(myChildren);
      if (myChildren.length === 1) {
        setSelectedStudent(myChildren[0].id);
      }
    }
  }, [task, isParent]);

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data);
      } else {
        toast.error("Tarea no encontrada");
        router.push("/tasks");
      }
    } catch {
      toast.error("Error al cargar tarea");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/tasks/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
      if (res.ok) {
        toast.success("Tarea publicada");
        fetchTask();
      }
    } catch {
      toast.error("Error al publicar");
    }
  };

  const handleClose = async () => {
    try {
      const res = await fetch(`/api/tasks/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });
      if (res.ok) {
        toast.success("Tarea cerrada");
        fetchTask();
      }
    } catch {
      toast.error("Error al cerrar");
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar esta tarea?")) return;
    try {
      const res = await fetch(`/api/tasks/${resolvedParams.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Tarea eliminada");
        router.push("/tasks");
      }
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast.error("Selecciona un estudiante");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${resolvedParams.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent,
          content: submissionContent,
        }),
      });
      if (res.ok) {
        toast.success("Tarea entregada exitosamente");
        setSubmissionContent("");
        fetchTask();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al entregar");
      }
    } catch {
      toast.error("Error al entregar tarea");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrade = async (submissionId: string) => {
    const data = gradeData[submissionId];
    if (!data?.score) {
      toast.error("Ingresa una calificación");
      return;
    }

    setGrading(submissionId);
    try {
      const res = await fetch(
        `/api/tasks/${resolvedParams.id}/submissions/${submissionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score: parseFloat(data.score),
            feedback: data.feedback,
          }),
        }
      );
      if (res.ok) {
        toast.success("Calificación guardada");
        fetchTask();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al calificar");
      }
    } catch {
      toast.error("Error al guardar calificación");
    } finally {
      setGrading(null);
    }
  };

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

  const getSubmissionStatusBadge = (submission: Submission) => {
    if (submission.status === "REVIEWED") {
      return (
        <Badge className="bg-green-500">
          {submission.score}/{task?.maxScore}
        </Badge>
      );
    }
    if (submission.isLate) {
      return <Badge variant="destructive">Tarde</Badge>;
    }
    return <Badge variant="secondary">Pendiente</Badge>;
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/tasks"
          className="inline-flex items-center text-gray-600 hover:text-[#1B4079] mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a tareas
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              {getStatusBadge(task.status)}
            </div>
            {task.subject && (
              <span
                className="inline-block text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${task.subject.color}20`,
                  color: task.subject.color,
                }}
              >
                {task.subject.name}
              </span>
            )}
          </div>
          
          {canManage && (
            <div className="flex flex-wrap gap-2">
              {task.status === "DRAFT" && (
                <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4 mr-2" />
                  Publicar
                </Button>
              )}
              {task.status === "PUBLISHED" && (
                <Button onClick={handleClose} variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Cerrar
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push(`/tasks/${task.id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Info */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{task.group.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{task.teacher.name}</span>
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Entrega: {format(new Date(task.dueDate), "d 'de' MMMM, HH:mm", { locale: es })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Puntuación: {task.maxScore} pts</span>
              </div>
            </div>

            {task.description && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {task.instructions && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Instrucciones</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{task.instructions}</p>
              </div>
            )}
          </div>

          {/* Submission Form (Parents) */}
          {isParent && task.status === "PUBLISHED" && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Entregar tarea</h3>
              
              {children.length > 1 && (
                <div className="mb-4">
                  <label className="text-sm text-gray-600 mb-1 block">Estudiante</label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona estudiante" />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.firstName} {child.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Textarea
                placeholder="Escribe aquí la respuesta o comentarios..."
                rows={4}
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                className="mb-4"
              />

              <Button
                onClick={handleSubmit}
                disabled={submitting || !selectedStudent}
                className="bg-[#1B4079] hover:bg-[#143056]"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Entregar
              </Button>
            </div>
          )}

          {/* Submissions List (Teachers) */}
          {canManage && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Entregas ({task.submissions.length}/{task.group.students.length})
              </h3>

              {task.submissions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aún no hay entregas</p>
              ) : (
                <div className="space-y-4">
                  {task.submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium">
                            {submission.student.firstName} {submission.student.lastName}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            {format(new Date(submission.submittedAt), "d/MM/yy HH:mm")}
                          </span>
                        </div>
                        {getSubmissionStatusBadge(submission)}
                      </div>

                      {submission.content && (
                        <p className="text-gray-600 text-sm mb-3 whitespace-pre-wrap">
                          {submission.content}
                        </p>
                      )}

                      {submission.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {submission.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={att.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-[#1B4079] hover:underline"
                            >
                              <FileText className="w-4 h-4" />
                              {att.fileName}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Grade Form */}
                      {submission.status !== "REVIEWED" ? (
                        <div className="flex items-end gap-3 pt-3 border-t">
                          <div className="flex-1">
                            <label className="text-xs text-gray-500">Calificación</label>
                            <Input
                              type="number"
                              min={0}
                              max={task.maxScore}
                              placeholder={`0-${task.maxScore}`}
                              value={gradeData[submission.id]?.score || ""}
                              onChange={(e) =>
                                setGradeData({
                                  ...gradeData,
                                  [submission.id]: {
                                    ...gradeData[submission.id],
                                    score: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="flex-[2]">
                            <label className="text-xs text-gray-500">Retroalimentación</label>
                            <Input
                              placeholder="Comentarios..."
                              value={gradeData[submission.id]?.feedback || ""}
                              onChange={(e) =>
                                setGradeData({
                                  ...gradeData,
                                  [submission.id]: {
                                    ...gradeData[submission.id],
                                    feedback: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleGrade(submission.id)}
                            disabled={grading === submission.id}
                            className="bg-[#1B4079]"
                          >
                            {grading === submission.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Calificar"
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="pt-3 border-t text-sm">
                          <span className="text-green-600 font-medium">
                            Calificado: {submission.score}/{task.maxScore}
                          </span>
                          {submission.feedback && (
                            <p className="text-gray-600 mt-1">{submission.feedback}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Students Progress (Teachers) */}
          {canManage && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Alumnos</h3>
              <div className="space-y-2">
                {task.group.students.map((student) => {
                  const submission = task.submissions.find(
                    (s) => s.studentId === student.id
                  );
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <span className="text-sm">
                        {student.firstName} {student.lastName}
                      </span>
                      {submission ? (
                        submission.status === "REVIEWED" ? (
                          <span className="text-sm text-green-600">
                            {submission.score}/{task.maxScore}
                          </span>
                        ) : (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* My Submission (Parents) */}
          {isParent && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Estado de entrega</h3>
              {children.map((child) => {
                const submission = task.submissions.find(
                  (s) => s.studentId === child.id
                );
                return (
                  <div key={child.id} className="mb-4 last:mb-0">
                    <p className="text-sm font-medium">
                      {child.firstName} {child.lastName}
                    </p>
                    {submission ? (
                      <div className="mt-2">
                        {getSubmissionStatusBadge(submission)}
                        {submission.feedback && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Retroalimentación:</strong> {submission.feedback}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">Sin entregar</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
