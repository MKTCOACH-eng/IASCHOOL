"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Loader2,
  BookOpen,
  ArrowLeft,
  FileText,
  Clock,
  Award,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Grade {
  id: string;
  taskId: string;
  taskTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  isLate: boolean;
}

interface SubjectGrades {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  grades: Grade[];
  average: number;
  totalTasks: number;
}

interface StudentGrades {
  id: string;
  firstName: string;
  lastName: string;
  groupName: string;
  overallAverage: number;
  totalGradedTasks: number;
  bySubject: SubjectGrades[];
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

export default function GradesReportPage() {
  const { data: session, status } = useSession() || {};
  const [students, setStudents] = useState<StudentGrades[]>([]);
  const [allStudents, setAllStudents] = useState<StudentGrades[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  useEffect(() => {
    if (status === "authenticated") {
      fetchGrades();
    }
  }, [status]);

  useEffect(() => {
    // Filtrar cuando cambian los filtros
    filterGrades();
  }, [selectedStudent, selectedSubject, allStudents]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/academic/grades");
      if (res.ok) {
        const data = await res.json();
        setAllStudents(data.students);
        setStudents(data.students);
        setSubjects(data.subjects);
      } else {
        toast.error("Error al cargar calificaciones");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const filterGrades = () => {
    let filtered = [...allStudents];

    // Filtrar por estudiante
    if (selectedStudent !== "all") {
      filtered = filtered.filter((s) => s.id === selectedStudent);
    }

    // Filtrar por materia
    if (selectedSubject !== "all") {
      filtered = filtered.map((student) => ({
        ...student,
        bySubject: student.bySubject.filter((s) => s.subjectId === selectedSubject),
        totalGradedTasks: student.bySubject
          .filter((s) => s.subjectId === selectedSubject)
          .reduce((sum, s) => sum + s.totalTasks, 0),
      }));
    }

    setStudents(filtered);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-700";
    if (percentage >= 70) return "bg-blue-100 text-blue-700";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
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
              Reporte de Calificaciones
            </h1>
            <p className="text-gray-600">
              Historial detallado de calificaciones por materia
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {allStudents.length > 1 && (
          <Select value={selectedStudent} onValueChange={(v) => setSelectedStudent(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estudiante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estudiantes</SelectItem>
              {allStudents.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por materia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las materias</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* No data */}
      {students.length === 0 || students.every((s) => s.bySubject.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay calificaciones
            </h3>
            <p className="text-gray-600">
              {selectedSubject !== "all" || selectedStudent !== "all"
                ? "No hay calificaciones con los filtros seleccionados"
                : "Aún no hay tareas calificadas para mostrar"}
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Student Cards */
        <div className="space-y-6">
          {students.filter((s) => s.bySubject.length > 0).map((student) => (
            <Card key={student.id}>
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {student.firstName} {student.lastName}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{student.groupName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Promedio General</p>
                      <p className={`text-2xl font-bold ${getScoreColor(student.overallAverage)}`}>
                        {student.overallAverage}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Tareas</p>
                      <p className="text-xl font-semibold text-gray-700">
                        {student.totalGradedTasks}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                  {student.bySubject.map((subject) => (
                    <AccordionItem key={subject.subjectId} value={subject.subjectId}>
                      <AccordionTrigger className="px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: subject.subjectColor }}
                            />
                            <span className="font-medium">{subject.subjectName}</span>
                            <Badge variant="secondary" className="text-xs">
                              {subject.totalTasks} tareas
                            </Badge>
                          </div>
                          <span className={`font-bold ${getScoreColor(subject.average)}`}>
                            {subject.average}%
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="px-6 pb-4">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b text-left text-sm text-gray-500">
                                <th className="pb-2 font-medium">Tarea</th>
                                <th className="pb-2 font-medium text-center">Calificación</th>
                                <th className="pb-2 font-medium text-center hidden md:table-cell">Fecha</th>
                                <th className="pb-2 font-medium text-center">Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subject.grades.map((grade) => (
                                <tr key={grade.id} className="border-b last:border-0">
                                  <td className="py-3">
                                    <Link
                                      href={`/tasks/${grade.taskId}`}
                                      className="text-sm font-medium text-gray-900 hover:text-[#1B4079] flex items-center gap-1"
                                    >
                                      {grade.taskTitle}
                                      <ChevronRight className="w-3 h-3" />
                                    </Link>
                                    {grade.feedback && (
                                      <div className="flex items-start gap-1 mt-1">
                                        <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-gray-500 line-clamp-2">
                                          {grade.feedback}
                                        </p>
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 text-center">
                                    <div>
                                      <span className={`font-bold ${getScoreColor(grade.percentage)}`}>
                                        {grade.score}/{grade.maxScore}
                                      </span>
                                      <span className={`block text-xs mt-0.5 px-2 py-0.5 rounded-full ${getScoreBadge(grade.percentage)}`}>
                                        {grade.percentage}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 text-center hidden md:table-cell">
                                    <span className="text-sm text-gray-600">
                                      {grade.reviewedAt
                                        ? format(new Date(grade.reviewedAt), "d MMM yyyy", { locale: es })
                                        : "--"}
                                    </span>
                                  </td>
                                  <td className="py-3 text-center">
                                    {grade.isLate ? (
                                      <Badge variant="destructive" className="text-xs">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Tarde
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-green-100 text-green-700 text-xs">
                                        <Award className="w-3 h-3 mr-1" />
                                        A tiempo
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          
                          {/* Subject Summary */}
                          <div className="mt-4 pt-4 border-t bg-gray-50 -mx-6 px-6 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {subject.totalTasks} tareas calificadas
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Promedio:</span>
                              <span className={`text-lg font-bold ${getScoreColor(subject.average)}`}>
                                {subject.average}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
