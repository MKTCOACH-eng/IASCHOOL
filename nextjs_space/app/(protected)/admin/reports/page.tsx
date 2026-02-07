'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  GraduationCap,
  MessageSquare,
  AlertTriangle,
  Heart,
  TrendingUp,
  UserPlus,
  ShoppingBag,
  Loader2,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportType {
  type: string;
  name: string;
  description: string;
  icon: string;
}

interface ReportExecution {
  id: string;
  reportType: string;
  name: string;
  status: string;
  rowCount: number | null;
  createdAt: string;
  completedAt: string | null;
  generatedBy: { name: string };
}

const iconMap: Record<string, any> = {
  GraduationCap,
  DollarSign,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Heart,
  TrendingUp,
  UserPlus,
  ShoppingBag
};

export default function ReportsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<ReportExecution[]>([]);

  useEffect(() => {
    if (status === 'authenticated') {
      const user = session?.user as any;
      if (user?.role !== 'ADMIN') {
        router.push('/dashboard');
      } else {
        fetchReports();
      }
    }
  }, [status]);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (res.ok) {
        setReportTypes(data.reportTypes || []);
        setRecentExecutions(data.recentExecutions || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string, name: string) => {
    setGenerating(reportType);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, name })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Reporte "${name}" generado exitosamente`);
        setRecentExecutions(prev => [data.execution, ...prev]);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error al generar reporte');
    } finally {
      setGenerating(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Centro de Reportes</h1>
        <p className="text-gray-600 mt-1">Genera y descarga reportes de todas las áreas del colegio</p>
      </div>

      {/* Tipos de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {reportTypes.map(report => {
          const Icon = iconMap[report.icon] || FileText;
          return (
            <Card key={report.type} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription className="text-sm">{report.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => generateReport(report.type, report.name)}
                  disabled={generating === report.type}
                >
                  {generating === report.type ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generando...</>
                  ) : (
                    <><FileText className="h-4 w-4 mr-2" /> Generar Reporte</>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Historial de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Reportes Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentExecutions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay reportes generados aún.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Reporte</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Registros</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Generado por</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Fecha</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentExecutions.map(exec => (
                    <tr key={exec.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{exec.name}</div>
                        <div className="text-sm text-gray-500">{exec.reportType}</div>
                      </td>
                      <td className="px-4 py-3">
                        {exec.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            <CheckCircle className="h-3 w-3" /> Completado
                          </span>
                        )}
                        {exec.status === 'running' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            <Loader2 className="h-3 w-3 animate-spin" /> Procesando
                          </span>
                        )}
                        {exec.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                            <XCircle className="h-3 w-3" /> Error
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {exec.rowCount ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {exec.generatedBy?.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {new Date(exec.createdAt).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {exec.status === 'completed' && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
