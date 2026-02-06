"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  ArrowLeft,
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Plus,
  Calendar,
  User,
  File,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  group?: { name: string } | null;
}

interface GradeDocument {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number | null;
  period: string | null;
  createdAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    group?: { name: string } | null;
  };
  uploadedBy: {
    id: string;
    name: string;
  };
}

export default function GradeDocumentsPage() {
  const { data: session, status } = useSession() || {};
  const [documents, setDocuments] = useState<GradeDocument[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    studentId: "",
    period: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const userRole = (session?.user as { role?: string })?.role;
  const canUpload = userRole === "ADMIN" || userRole === "PROFESOR";

  useEffect(() => {
    if (status === "authenticated") {
      fetchDocuments();
      if (canUpload) {
        fetchStudents();
      }
    }
  }, [status]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const url = selectedStudent !== "all"
        ? `/api/academic/documents?studentId=${selectedStudent}`
        : "/api/academic/documents";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch {
      toast.error("Error al cargar documentos");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      // Usar la API de grupos para obtener estudiantes
      const res = await fetch("/api/groups/my-groups");
      if (res.ok) {
        const groups = await res.json();
        const allStudents: Student[] = [];
        for (const group of groups) {
          // Obtener estudiantes del grupo
          const groupRes = await fetch(`/api/groups?id=${group.id}`);
          if (groupRes.ok) {
            const groupData = await groupRes.json();
            if (groupData.students) {
              groupData.students.forEach((s: Student) => {
                if (!allStudents.find((st) => st.id === s.id)) {
                  allStudents.push({ ...s, group: { name: group.name } });
                }
              });
            }
          }
        }
        setStudents(allStudents);
      }
    } catch {
      console.error("Error fetching students");
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchDocuments();
    }
  }, [selectedStudent]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo no debe superar 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!formData.title || !formData.studentId || !selectedFile) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    setUploading(true);
    try {
      // 1. Obtener URL presignada
      const presignedRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          isPublic: true,
        }),
      });

      if (!presignedRes.ok) {
        throw new Error("Error al obtener URL de subida");
      }

      const { uploadUrl, cloud_storage_path } = await presignedRes.json();

      // 2. Subir archivo a S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type,
          "Content-Disposition": "attachment",
        },
        body: selectedFile,
      });

      if (!uploadRes.ok) {
        throw new Error("Error al subir archivo");
      }

      // 3. Crear registro del documento
      const docRes = await fetch("/api/academic/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          studentId: formData.studentId,
          fileName: selectedFile.name,
          fileUrl: cloud_storage_path,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          cloudStoragePath: cloud_storage_path,
          isPublic: true,
          period: formData.period,
        }),
      });

      if (!docRes.ok) {
        throw new Error("Error al guardar documento");
      }

      toast.success("Documento subido correctamente");
      setDialogOpen(false);
      setFormData({ title: "", description: "", studentId: "", period: "" });
      setSelectedFile(null);
      fetchDocuments();
    } catch (error) {
      console.error(error);
      toast.error("Error al subir documento");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: GradeDocument) => {
    try {
      const res = await fetch(`/api/academic/documents/${doc.id}`);
      if (res.ok) {
        const data = await res.json();
        // Crear enlace y simular click para descargar
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = doc.fileName;
        link.click();
      } else {
        toast.error("Error al obtener documento");
      }
    } catch {
      toast.error("Error al descargar");
    }
  };

  const handleView = async (doc: GradeDocument) => {
    try {
      const res = await fetch(`/api/academic/documents/${doc.id}`);
      if (res.ok) {
        const data = await res.json();
        window.open(data.downloadUrl, "_blank");
      } else {
        toast.error("Error al abrir documento");
      }
    } catch {
      toast.error("Error al visualizar");
    }
  };

  const handlePrint = async (doc: GradeDocument) => {
    try {
      const res = await fetch(`/api/academic/documents/${doc.id}`);
      if (res.ok) {
        const data = await res.json();
        // Abrir en nueva ventana para imprimir
        const printWindow = window.open(data.downloadUrl, "_blank");
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      }
    } catch {
      toast.error("Error al imprimir");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este documento?")) return;

    try {
      const res = await fetch(`/api/academic/documents/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Documento eliminado");
        fetchDocuments();
      } else {
        toast.error("Error al eliminar");
      }
    } catch {
      toast.error("Error al eliminar documento");
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "--";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Agrupar documentos por estudiante
  const groupedDocuments = documents.reduce((acc, doc) => {
    const key = doc.student.id;
    if (!acc[key]) {
      acc[key] = {
        student: doc.student,
        documents: [],
      };
    }
    acc[key].documents.push(doc);
    return acc;
  }, {} as Record<string, { student: GradeDocument["student"]; documents: GradeDocument[] }>);

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
      <div className="mb-6">
        <Link
          href="/academic"
          className="inline-flex items-center text-gray-600 hover:text-[#1B4079] mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Progreso Académico
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-7 h-7 text-[#1B4079]" />
              Documentos de Calificaciones
            </h1>
            <p className="text-gray-600">
              {canUpload
                ? "Sube y gestiona boletas y reportes académicos"
                : "Visualiza y descarga boletas y reportes académicos"}
            </p>
          </div>

          {canUpload && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1B4079] hover:bg-[#143056] gap-2">
                  <Plus className="w-4 h-4" />
                  Subir Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Subir Documento de Calificaciones</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Título *</label>
                    <Input
                      placeholder="Ej: Boleta Primer Trimestre 2025"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Estudiante *</label>
                    <Select
                      value={formData.studentId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, studentId: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estudiante" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.firstName} {student.lastName}
                            {student.group && ` (${student.group.name})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Período</label>
                    <Input
                      placeholder="Ej: 2025-T1, Ciclo 2024-2025"
                      value={formData.period}
                      onChange={(e) =>
                        setFormData({ ...formData, period: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Descripción</label>
                    <Textarea
                      placeholder="Notas adicionales..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Archivo *</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-[#1B4079] transition-colors"
                    >
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <File className="w-5 h-5 text-[#1B4079]" />
                          <span className="text-sm text-gray-700">{selectedFile.name}</span>
                          <span className="text-xs text-gray-500">
                            ({formatFileSize(selectedFile.size)})
                          </span>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <Upload className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">Haz clic para seleccionar</p>
                          <p className="text-xs">PDF, Word, Excel (máx 10MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || !formData.title || !formData.studentId || !selectedFile}
                    className="w-full bg-[#1B4079] hover:bg-[#143056]"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Subir Documento
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filter */}
      {documents.length > 0 && Object.keys(groupedDocuments).length > 1 && (
        <div className="mb-6">
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filtrar por estudiante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estudiantes</SelectItem>
              {Object.values(groupedDocuments).map(({ student }) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Documents */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay documentos
            </h3>
            <p className="text-gray-600">
              {canUpload
                ? "Sube el primer documento de calificaciones"
                : "Aún no hay documentos disponibles"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedDocuments).map(({ student, documents: docs }) => (
            <Card key={student.id}>
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1B4079] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {student.firstName} {student.lastName}
                    </CardTitle>
                    {student.group && (
                      <p className="text-sm text-gray-500">{student.group.name}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {docs.length} documento{docs.length !== 1 && "s"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {doc.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span>{doc.fileName}</span>
                            <span>•</span>
                            <span>{formatFileSize(doc.fileSize)}</span>
                            {doc.period && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {doc.period}
                                </Badge>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {format(new Date(doc.createdAt), "d MMM yyyy", { locale: es })}
                            </span>
                            <span>•</span>
                            <span>por {doc.uploadedBy.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(doc)}
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrint(doc)}
                          title="Imprimir"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        {canUpload && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
