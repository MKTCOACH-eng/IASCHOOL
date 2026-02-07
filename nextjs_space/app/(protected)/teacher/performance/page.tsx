'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Target,
  Award,
  CheckCircle,
  Clock,
  MessageSquare,
  Star,
  Loader2
} from 'lucide-react';

interface Metric {
  id: string;
  category: string;
  value: number;
  target: number | null;
  periodStart: string;
  periodEnd: string;
}

interface Review {
  id: string;
  overallScore: number;
  periodStart: string;
  periodEnd: string;
  strengths: string | null;
  areasToImprove: string | null;
  goals: string | null;
  status: string;
  reviewer: { name: string };
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

export default function TeacherPerformancePage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (status === 'authenticated') {
      const user = session?.user as any;
      if (user?.role !== 'PROFESOR') {
        router.push('/dashboard');
      } else {
        fetchData();
      }
    }
  }, [status, period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, reviewsRes] = await Promise.all([
        fetch(`/api/performance?period=${period}`),
        fetch('/api/performance/reviews')
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.metrics || []);
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (value: number, target: number | null) => {
    const threshold = target || 80;
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressWidth = (value: number) => {
    return `${Math.min(value, 100)}%`;
  };

  const overallScore = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + Number(m.value), 0) / metrics.length 
    : 0;

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
          <h1 className="text-3xl font-bold text-gray-900">Mi Rendimiento</h1>
          <p className="text-gray-600 mt-1">Revisa tu desempeño y áreas de mejora</p>
        </div>
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
      </div>

      {/* Score General */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${
                overallScore >= 80 ? 'bg-green-100' :
                overallScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Award className={`h-10 w-10 ${
                  overallScore >= 80 ? 'text-green-600' :
                  overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Puntuación General</p>
                <p className={`text-4xl font-bold ${getScoreColor(overallScore, 80)}`}>
                  {overallScore.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Meta: 80%</p>
              <p className="text-sm text-gray-400">
                {overallScore >= 80 ? '¡Excelente trabajo!' :
                 overallScore >= 60 ? 'Buen progreso, sigue así' : 'Hay oportunidades de mejora'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas por Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {metrics.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="p-8 text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay métricas registradas para este período.</p>
              <p className="text-sm mt-2">Las métricas se calculan automáticamente según tu actividad.</p>
            </CardContent>
          </Card>
        ) : (
          metrics.map(metric => {
            const Icon = categoryIcons[metric.category] || Target;
            const value = Number(metric.value);
            const target = metric.target ? Number(metric.target) : 80;
            
            return (
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">{categoryLabels[metric.category]}</span>
                    </div>
                    <span className={`text-lg font-bold ${getScoreColor(value, target)}`}>
                      {value.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                        value >= target ? 'bg-green-500' :
                        value >= target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: getProgressWidth(value) }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-gray-600"
                      style={{ left: `${target}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Meta: {target}%</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Evaluaciones Recibidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Evaluaciones Recibidas
          </CardTitle>
          <CardDescription>Retroalimentación de tus supervisores</CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tienes evaluaciones aún.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-gray-500">
                        Período: {new Date(review.periodStart).toLocaleDateString('es-MX')} - 
                        {new Date(review.periodEnd).toLocaleDateString('es-MX')}
                      </p>
                      <p className="text-sm text-gray-400">Por: {review.reviewer.name}</p>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(Number(review.overallScore), 80)}`}>
                      {Number(review.overallScore).toFixed(1)}%
                    </div>
                  </div>
                  
                  {review.strengths && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-green-600">Fortalezas:</p>
                      <p className="text-sm text-gray-600">{review.strengths}</p>
                    </div>
                  )}
                  
                  {review.areasToImprove && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-yellow-600">Áreas de Mejora:</p>
                      <p className="text-sm text-gray-600">{review.areasToImprove}</p>
                    </div>
                  )}
                  
                  {review.goals && (
                    <div>
                      <p className="text-sm font-medium text-blue-600">Metas:</p>
                      <p className="text-sm text-gray-600">{review.goals}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
