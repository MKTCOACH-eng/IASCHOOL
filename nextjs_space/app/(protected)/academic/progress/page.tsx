'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Star, Loader2, ChevronDown, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProgressData {
  student: {
    id: string;
    name: string;
    group: string;
  };
  overallStats: {
    currentAverage: number | null;
    groupAverage: number | null;
    attendance: number | null;
    totalReportCards: number;
    absences: number;
    tardies: number;
  };
  subjectProgress: Array<{
    subjectId: string;
    subjectName: string;
    subjectColor: string;
    grades: Array<{ period: string; schoolYear: string; grade: number }>;
    currentAverage: number | null;
    trend: string;
  }>;
  recentTasks: Array<{
    taskTitle: string;
    subject: string;
    score: number | null;
    maxScore: number | null;
    percentage: number | null;
    submittedAt: string;
  }>;
  areasOfConcern: Array<{ subject: string; grade: number | null; trend: string }>;
  strengths: Array<{ subject: string; grade: number | null; trend: string }>;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

export default function ProgressPage() {
  const { data: session } = useSession() || {};
  const searchParams = useSearchParams();
  const studentIdParam = searchParams.get('studentId');
  
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState(studentIdParam || '');
  const [loading, setLoading] = useState(true);

  const user = session?.user as { role: string } | undefined;
  const isParent = user?.role === 'PADRE';

  useEffect(() => {
    if (isParent) {
      fetchChildren();
    }
  }, [isParent]);

  useEffect(() => {
    if (selectedStudent) {
      fetchProgress(selectedStudent);
    } else {
      setLoading(false);
    }
  }, [selectedStudent]);

  const fetchChildren = async () => {
    try {
      const res = await fetch('/api/student/my-children');
      if (res.ok) {
        const data = await res.json();
        setChildren(data);
        if (data.length > 0 && !selectedStudent) {
          setSelectedStudent(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchProgress = async (studentId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/academic/progress?studentId=${studentId}`);
      if (res.ok) {
        setProgress(await res.json());
      } else {
        toast.error('Error al cargar progreso');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar progreso');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedStudent && isParent && children.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Sin estudiantes registrados</h2>
          <p className="text-gray-500 mt-2">No tienes hijos registrados en el sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seguimiento Académico</h1>
          <p className="text-gray-600 mt-1">Evolución y tendencias de calificaciones</p>
        </div>
        
        {isParent && children.length > 1 && (
          <div className="relative">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="px-4 py-2 pr-10 border rounded-lg appearance-none bg-white cursor-pointer"
            >
              {children.map(child => (
                <option key={child.id} value={child.id}>
                  {child.firstName} {child.lastName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {progress ? (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <p className="text-3xl font-bold">
                {progress.overallStats.currentAverage?.toFixed(1) || 'N/A'}
              </p>
              <p className="text-blue-100 text-sm mt-1">Promedio Actual</p>
              {progress.overallStats.groupAverage && (
                <p className="text-xs text-blue-200 mt-2">
                  Promedio del grupo: {progress.overallStats.groupAverage.toFixed(1)}
                </p>
              )}
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <p className="text-3xl font-bold">
                {progress.overallStats.attendance?.toFixed(0) || 'N/A'}%
              </p>
              <p className="text-green-100 text-sm mt-1">Asistencia</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <p className="text-3xl font-bold">{progress.overallStats.absences}</p>
              <p className="text-orange-100 text-sm mt-1">Faltas</p>
              <p className="text-xs text-orange-200 mt-2">
                {progress.overallStats.tardies} retardos
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <p className="text-3xl font-bold">{progress.overallStats.totalReportCards}</p>
              <p className="text-purple-100 text-sm mt-1">Boletas Registradas</p>
            </div>
          </div>

          {/* Alerts */}
          {progress.areasOfConcern.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-red-700">Áreas que Requieren Atención</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {progress.areasOfConcern.map((area, idx) => (
                  <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-1">
                    {area.subject}: {area.grade?.toFixed(1)} {getTrendIcon(area.trend)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {progress.strengths.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-green-700">Fortalezas</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {progress.strengths.map((s, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-1">
                    {s.subject}: {s.grade?.toFixed(1)} {getTrendIcon(s.trend)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Subject Progress */}
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
            <h3 className="text-lg font-semibold mb-4">Progreso por Materia</h3>
            <div className="space-y-4">
              {progress.subjectProgress.map(subject => (
                <div key={subject.subjectId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: subject.subjectColor }}
                      />
                      <span className="font-medium">{subject.subjectName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${
                        (subject.currentAverage || 0) >= 9 ? 'text-green-600' :
                        (subject.currentAverage || 0) >= 7 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {subject.currentAverage?.toFixed(1) || 'N/A'}
                      </span>
                      {getTrendIcon(subject.trend)}
                    </div>
                  </div>
                  {/* Simple Grade History */}
                  {subject.grades.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {subject.grades.map((g, idx) => (
                        <div key={idx} className="flex-shrink-0 text-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${
                            g.grade >= 9 ? 'bg-green-100 text-green-700' :
                            g.grade >= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {g.grade.toFixed(1)}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {g.period.replace('_', ' ').slice(0, 3)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tasks */}
          {progress.recentTasks.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Últimas Tareas Calificadas</h3>
              <div className="space-y-3">
                {progress.recentTasks.map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{task.taskTitle}</p>
                      <p className="text-sm text-gray-500">{task.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        (task.percentage || 0) >= 90 ? 'text-green-600' :
                        (task.percentage || 0) >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {task.score}/{task.maxScore}
                      </p>
                      {task.percentage && (
                        <p className="text-xs text-gray-400">{task.percentage.toFixed(0)}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Sin datos de progreso</h2>
          <p className="text-gray-500 mt-2">Aún no hay boletas registradas para mostrar el progreso.</p>
        </div>
      )}
    </div>
  );
}
