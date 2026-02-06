'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, Download, Loader2, ArrowLeft, GraduationCap,
  Users, ChevronDown, Calendar, Eye, Printer, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  group?: {
    id: string;
    name: string;
    grade?: string;
  } | null;
}

interface Group {
  id: string;
  name: string;
  grade?: string;
  students: Student[];
}

interface GradePreview {
  subject: string;
  color: string;
  tasksCount: number;
  average: number | null;
}

export default function ReportCardsPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(new Date().getFullYear().toString());
  const [generating, setGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<GradePreview[] | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  const user = session?.user as { id: string; role: string; schoolId: string; name: string } | undefined;
  const isParent = user?.role === 'PADRE';

  // Generate period options (last 3 years)
  const currentYear = new Date().getFullYear();
  const periodOptions = [
    { value: currentYear.toString(), label: `Año ${currentYear}` },
    { value: (currentYear - 1).toString(), label: `Año ${currentYear - 1}` },
    { value: (currentYear - 2).toString(), label: `Año ${currentYear - 2}` },
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchGradePreview();
    } else {
      setPreviewData(null);
    }
  }, [selectedStudent, selectedPeriod]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      if (isParent) {
        // Parents see their children
        const res = await fetch('/api/academic/students');
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
          if (data.students?.length === 1) {
            setSelectedStudent(data.students[0].id);
          }
        }
      } else {
        // Teachers/Admins see groups with students
        const res = await fetch('/api/groups?includeStudents=true');
        if (res.ok) {
          const data = await res.json();
          setGroups(data.groups || []);
          
          // Flatten students for display
          const allStudents: Student[] = [];
          for (const group of data.groups || []) {
            for (const student of group.students || []) {
              allStudents.push({ ...student, group: { id: group.id, name: group.name, grade: group.grade } });
            }
          }
          setStudents(allStudents);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const fetchGradePreview = async () => {
    if (!selectedStudent) return;
    
    try {
      setLoadingPreview(true);
      const res = await fetch(`/api/academic/grades-preview/${selectedStudent}?period=${selectedPeriod}`);
      if (res.ok) {
        const data = await res.json();
        setPreviewData(data.grades);
      }
    } catch (error) {
      console.error('Error fetching preview:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!selectedStudent) {
      toast.error('Selecciona un estudiante');
      return;
    }

    try {
      setGenerating(true);
      toast.info('Generando boleta de calificaciones...');

      const res = await fetch(`/api/academic/report-card/${selectedStudent}?period=${selectedPeriod}`);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al generar PDF');
      }

      // Download the PDF
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Boleta_${selectedPeriod}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Boleta generada exitosamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(error instanceof Error ? error.message : 'Error al generar boleta');
    } finally {
      setGenerating(false);
    }
  };

  const getGradeColor = (score: number | null): string => {
    if (score === null) return 'text-gray-400';
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGradeLabel = (score: number | null): string => {
    if (score === null) return 'Sin calificar';
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Muy Bien';
    if (score >= 70) return 'Bien';
    if (score >= 60) return 'Suficiente';
    return 'Insuficiente';
  };

  const getGradeBgColor = (score: number | null): string => {
    if (score === null) return 'bg-gray-100';
    if (score >= 90) return 'bg-emerald-50';
    if (score >= 80) return 'bg-green-50';
    if (score >= 70) return 'bg-amber-50';
    if (score >= 60) return 'bg-orange-50';
    return 'bg-red-50';
  };

  // Filter students by group if selected
  const filteredStudents = selectedGroup
    ? students.filter(s => s.group?.id === selectedGroup)
    : students;

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  // Calculate general average from preview
  const generalAverage = previewData && previewData.length > 0
    ? previewData.filter(g => g.average !== null).reduce((sum, g) => sum + (g.average || 0), 0) / 
      previewData.filter(g => g.average !== null).length
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/academic"
          className="inline-flex items-center text-gray-600 hover:text-[#1B4079] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Progreso Académico
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#1B4079] to-[#2563EB] p-3 rounded-xl">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Boleta de Calificaciones</h1>
            <p className="text-gray-500">Genera reportes de calificaciones en PDF</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Group Filter (for teachers/admins) */}
          {!isParent && groups.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4 inline mr-2" />
                Filtrar por Grupo
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(e.target.value);
                  setSelectedStudent('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent"
              >
                <option value="">Todos los grupos</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.students.length} alumnos)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <GraduationCap className="h-4 w-4 inline mr-2" />
              Seleccionar Estudiante
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent"
            >
              <option value="">Selecciona un estudiante</option>
              {filteredStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                  {student.group ? ` - ${student.group.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Period Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Período Académico
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGeneratePDF}
            disabled={!selectedStudent || generating}
            className="w-full bg-gradient-to-r from-[#1B4079] to-[#2563EB] hover:from-[#153360] hover:to-[#1D4ED8] text-white py-3"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Descargar Boleta PDF
              </>
            )}
          </Button>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          {selectedStudent && selectedStudentData ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Student Header */}
              <div className="bg-gradient-to-r from-[#1B4079] to-[#2563EB] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedStudentData.firstName} {selectedStudentData.lastName}
                    </h2>
                    <p className="text-white/80">
                      {selectedStudentData.group?.name || 'Sin grupo asignado'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/70">Período</div>
                    <div className="font-semibold">{selectedPeriod}</div>
                  </div>
                </div>
              </div>

              {/* Grades Preview */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#1B4079]" />
                  Vista Previa de Calificaciones
                </h3>

                {loadingPreview ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1B4079]" />
                  </div>
                ) : previewData && previewData.length > 0 ? (
                  <>
                    <div className="space-y-3 mb-6">
                      {previewData.map((grade, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${getGradeBgColor(grade.average)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: grade.color }}
                              />
                              <div>
                                <span className="font-medium text-gray-900">{grade.subject}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  ({grade.tasksCount} tareas)
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-2xl font-bold ${getGradeColor(grade.average)}`}>
                                {grade.average !== null ? grade.average.toFixed(1) : 'N/A'}
                              </span>
                              <div className={`text-xs ${getGradeColor(grade.average)}`}>
                                {getGradeLabel(grade.average)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* General Average */}
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-6 text-center">
                      <div className="text-sm text-emerald-700 font-medium mb-1">PROMEDIO GENERAL</div>
                      <div className={`text-5xl font-bold ${getGradeColor(generalAverage)}`}>
                        {generalAverage !== null ? generalAverage.toFixed(1) : 'N/A'}
                      </div>
                      <div className={`text-sm font-medium mt-1 ${getGradeColor(generalAverage)}`}>
                        {getGradeLabel(generalAverage)}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No hay calificaciones registradas para este período</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center py-16">
              <GraduationCap className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Selecciona un estudiante</p>
              <p className="text-gray-400 text-sm">para ver la vista previa de su boleta</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
