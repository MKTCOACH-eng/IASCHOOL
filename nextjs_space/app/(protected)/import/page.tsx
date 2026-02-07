'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Upload, Download, FileSpreadsheet, Users, GraduationCap, BookOpen, CheckCircle, XCircle, Loader2, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImportJob {
  id: string;
  type: string;
  status: string;
  fileName: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: string | null;
  createdAt: string;
  completedAt: string | null;
  createdBy: { name: string };
}

const importTypes = [
  { id: 'STUDENTS', label: 'Estudiantes', icon: GraduationCap, description: 'Importar lista de alumnos' },
  { id: 'PARENTS', label: 'Padres de Familia', icon: Users, description: 'Importar padres y vincularlos a estudiantes' },
  { id: 'TEACHERS', label: 'Profesores', icon: Users, description: 'Importar lista de docentes' },
  { id: 'GROUPS', label: 'Grupos', icon: BookOpen, description: 'Importar grupos/salones' },
  { id: 'SUBJECTS', label: 'Materias', icon: BookOpen, description: 'Importar asignaturas' },
];

export default function ImportPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, string>[] | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const user = session?.user as { role: string } | undefined;

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchJobs();
  }, [user, router]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/import');
      if (res.ok) setJobs(await res.json());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async (type: string) => {
    try {
      const res = await fetch(`/api/import/template?type=${type}&format=csv`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plantilla_${type.toLowerCase()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al descargar plantilla');
    }
  };

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data: Record<string, string>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      data.push(row);
    }
    return data;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor sube un archivo CSV');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const data = parseCSV(text);
      setPreviewData(data);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!selectedType || !previewData || previewData.length === 0) {
      toast.error('Selecciona un tipo y sube un archivo');
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          data: previewData,
          fileName: fileInputRef.current?.files?.[0]?.name || 'import.csv',
        }),
      });

      const result = await res.json();
      
      if (res.ok) {
        if (result.errorCount === 0) {
          toast.success(`¡Importación exitosa! ${result.successCount} registros creados`);
        } else {
          toast.warning(`Importación parcial: ${result.successCount} exitosos, ${result.errorCount} errores`);
        }
        setPreviewData(null);
        setSelectedType('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchJobs();
      } else {
        toast.error(result.error || 'Error en la importación');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar importación');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Importación Masiva</h1>
          <p className="text-gray-600 mt-1">Carga estudiantes, padres y profesores desde CSV</p>
        </div>
        <Button variant="outline" onClick={() => setShowHelp(true)} className="gap-2">
          <HelpCircle className="w-4 h-4" /> Ayuda
        </Button>
      </div>

      {/* Import Types */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {importTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              selectedType === type.id 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <type.icon className={`w-8 h-8 mb-2 ${selectedType === type.id ? 'text-primary' : 'text-gray-400'}`} />
            <h3 className="font-semibold">{type.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{type.description}</p>
          </button>
        ))}
      </div>

      {/* Upload Section */}
      {selectedType && (
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Importar {importTypes.find(t => t.id === selectedType)?.label}
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownloadTemplate(selectedType)}
              className="gap-2"
            >
              <Download className="w-4 h-4" /> Descargar Plantilla
            </Button>
          </div>

          {/* File Upload */}
          <div 
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Haz clic o arrastra un archivo CSV</p>
            <p className="text-sm text-gray-400 mt-1">Máximo 1000 registros por importación</p>
          </div>

          {/* Preview */}
          {previewData && previewData.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Vista Previa ({previewData.length} registros)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {Object.keys(previewData[0]).map(header => (
                        <th key={header} className="px-4 py-2 text-left font-medium text-gray-600">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-b">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-4 py-2 text-gray-700">{value || '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.length > 5 && (
                <p className="text-sm text-gray-500 mt-2">... y {previewData.length - 5} registros más</p>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPreviewData(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleImport} disabled={uploading} className="gap-2">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Importar {previewData.length} Registros
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import History */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Historial de Importaciones</h2>
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay importaciones previas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    job.status === 'COMPLETED' ? 'bg-green-100' :
                    job.status === 'FAILED' ? 'bg-red-100' :
                    job.status === 'PARTIALLY_COMPLETED' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {job.status === 'COMPLETED' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : job.status === 'FAILED' ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : job.status === 'PARTIALLY_COMPLETED' ? (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{job.fileName}</p>
                    <p className="text-sm text-gray-500">
                      {importTypes.find(t => t.id === job.type)?.label} • 
                      {new Date(job.createdAt).toLocaleString('es-MX')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    <span className="text-green-600">{job.successCount}</span>
                    <span className="text-gray-400"> / </span>
                    <span className="text-gray-600">{job.totalRows}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {job.errorCount > 0 && (
                      <span className="text-red-500">{job.errorCount} errores</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Guía de Importación</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">1. Descarga la Plantilla</h3>
                <p className="text-gray-600">Selecciona el tipo de datos que deseas importar y descarga la plantilla CSV correspondiente.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. Llena los Datos</h3>
                <p className="text-gray-600">Abre el archivo en Excel o Google Sheets y completa la información. Respeta los encabezados de columna.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. Guarda como CSV</h3>
                <p className="text-gray-600">Guarda el archivo en formato CSV (delimitado por comas).</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4. Sube el Archivo</h3>
                <p className="text-gray-600">Sube el archivo y revisa la vista previa antes de confirmar la importación.</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Notas Importantes</h4>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Los emails deben ser únicos en el sistema</li>
                  <li>Los nombres de grupos deben coincidir exactamente para vincular estudiantes</li>
                  <li>Las contraseñas temporales son &quot;temporal123&quot;</li>
                  <li>Máximo 1000 registros por importación</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t">
              <Button className="w-full" onClick={() => setShowHelp(false)}>Entendido</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
