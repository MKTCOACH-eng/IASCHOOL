'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  MessageSquare,
  Star,
  RefreshCw,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Metric {
  id: string;
  teacherId: string;
  category: string;
  value: number;
  target: number | null;
  teacher: Teacher;
}

interface Average {
  category: string;
  average: number;
  count: number;
}

const categoryLabels: Record<string, string> = {
  ATTENDANCE: 'Asistencia',
  TASK_COMPLETION: 'Tareas Completadas',
  COMMUNICATION: 'Comunicación',
  STUDENT_GRADES: 'Calificaciones',
  PUNCTUALITY: 'Puntualidad'
};

const categoryIcons: Record<string, any> = {
  ATTENDANCE: CheckCircle,
  TASK_COMPLETION: Star,
  COMMUNICATION: MessageSquare,
  STUDENT_GRADES: TrendingUp,
  PUNCTUALITY: Clock
};

export default function PerformancePage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [period, setPeriod] = useState('month');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [averages, setAverages] = useState<Average[]>([]);

  useEffect(() => {
    if (status === 'authenticated') {
      const user = session?.user as any;
      if (user?.role !== 'ADMIN') {
        router.push('/dashboard');
      } else {
        fetchData();
      }
    }
  }, [status, period, selectedTeacher]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (selectedTeacher) params.append('teacherId', selectedTeacher);
      
      const res = await fetch(`/api/performance?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setMetrics(data.metrics || []);
        setTeachers(data.teachers || []);
        setAverages(data.averages || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = async () => {
    setCalculating(true);
    try {
      const res = await fetch('/api/performance/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: selectedTeacher || undefined,
          periodStart: new Date(new Date().setDate(1)).toISOString(),
          periodEnd: new Date().toISOString()
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Métricas calculadas para ${data.teachersProcessed} profesores`);
        fetchData();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error al calcular métricas');
    } finally {
      setCalculating(false);
    }
  };

  const getScoreColor = (value: number, target: number | null) => {
    const threshold = target || 80;
    if (value >= threshold) return 'text-green-600 bg-green-50';
    if (value >= threshold * 0.8) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Agrupar métricas por profesor
  const metricsByTeacher: Record<string, Metric[]> = {};
  metrics.forEach(m => {
    if (!metricsByTeacher[m.teacherId]) {
      metricsByTeacher[m.teacherId] = [];
    }
    metricsByTeacher[m.teacherId].push(m);
  });

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rendimiento de Profesores</h1>
          <p className="text-gray-600 mt-1">Métricas y evaluaciones del personal docente</p>
        </div>
        <Button onClick={calculateMetrics} disabled={calculating}>
          {calculating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Calcular Métricas
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mes</SelectItem>
            <SelectItem value="quarter">Este Trimestre</SelectItem>
            <SelectItem value="year">Este Año</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Todos los profesores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los profesores</SelectItem>
            {teachers.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Promedios Generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {averages.map(avg => {
          const Icon = categoryIcons[avg.category] || BarChart3;
          return (
            <Card key={avg.category}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getScoreColor(avg.average, 80)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{categoryLabels[avg.category]}</p>
                    <p className="text-2xl font-bold">{avg.average.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lista de Profesores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Rendimiento por Profesor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(metricsByTeacher).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay métricas registradas para este período.</p>
              <p className="text-sm mt-2">Haz clic en "Calcular Métricas" para generar datos automáticamente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(metricsByTeacher).map(([teacherId, teacherMetrics]) => {
                const teacher = teacherMetrics[0]?.teacher;
                const avgScore = teacherMetrics.reduce((sum, m) => sum + Number(m.value), 0) / teacherMetrics.length;
                
                return (
                  <div key={teacherId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{teacher?.name}</h3>
                        <p className="text-sm text-gray-500">{teacher?.email}</p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(avgScore, 80)}`}>
                          Promedio: {avgScore.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {teacherMetrics.map(m => {
                        const Icon = categoryIcons[m.category] || BarChart3;
                        return (
                          <div key={m.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Icon className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">{categoryLabels[m.category]}</p>
                              <p className={`font-semibold ${Number(m.value) >= (m.target || 80) ? 'text-green-600' : 'text-red-600'}`}>
                                {Number(m.value).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Button 
                      variant="ghost" 
                      className="mt-3 w-full justify-between"
                      onClick={() => router.push(`/admin/performance/${teacherId}`)}
                    >
                      Ver detalles y evaluaciones
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
