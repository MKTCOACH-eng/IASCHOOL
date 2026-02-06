"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  RefreshCw,
  History,
} from "lucide-react";

interface PreviewRow {
  [key: string]: any;
  _rowNumber: number;
  _errors: string[];
}

interface ImportResult {
  success: boolean;
  importId: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: { row: number; errors: string[] }[];
}

interface ImportLog {
  id: string;
  type: string;
  status: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  fileName: string;
  createdAt: string;
}

export default function ImportPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importType, setImportType] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importHistory, setImportHistory] = useState<ImportLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const user = session?.user as any;

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    } else {
      fetchHistory();
    }
  }, [user, router]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/admin/import");
      if (res.ok) {
        const data = await res.json();
        setImportHistory(data.imports);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Solo se permiten archivos CSV");
      return;
    }

    if (!importType) {
      toast.error("Selecciona primero el tipo de importación");
      return;
    }

    setSelectedFile(file);
    setResult(null);
    await previewFile(file);
  };

  const previewFile = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", importType);
      formData.append("action", "preview");

      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al procesar archivo");
        if (data.expectedHeaders) {
          toast.info(`Columnas requeridas: ${data.expectedHeaders.join(", ")}`);
        }
        return;
      }

      setPreview(data.preview);
      setHeaders(data.headers);
      setTotalRows(data.totalRows);
    } catch (error) {
      toast.error("Error al previsualizar archivo");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !importType) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", importType);
      formData.append("action", "import");

      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error en la importación");
        return;
      }

      setResult(data);
      
      if (data.errorCount === 0) {
        toast.success(`¡Importación exitosa! ${data.successCount} registros creados.`);
      } else {
        toast.warning(`Importación parcial: ${data.successCount} exitosos, ${data.errorCount} con errores.`);
      }

      fetchHistory();
    } catch (error) {
      toast.error("Error al importar datos");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = async (type: string) => {
    try {
      const res = await fetch(`/api/admin/import/templates?type=${type}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plantilla_${type.toLowerCase()}.csv`;
      a.click();
      toast.success("Plantilla descargada");
    } catch (error) {
      toast.error("Error al descargar plantilla");
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview([]);
    setHeaders([]);
    setTotalRows(0);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const importTypes = [
    { value: "STUDENTS", label: "Alumnos", description: "Importar lista de estudiantes" },
    { value: "PARENTS", label: "Padres de familia", description: "Importar padres con credenciales" },
    { value: "TEACHERS", label: "Profesores", description: "Importar personal docente" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-700";
      case "PARTIAL": return "bg-yellow-100 text-yellow-700";
      case "FAILED": return "bg-red-100 text-red-700";
      case "PROCESSING": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED": return "Completado";
      case "PARTIAL": return "Parcial";
      case "FAILED": return "Fallido";
      case "PROCESSING": return "Procesando";
      default: return "Pendiente";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "STUDENTS": return "Alumnos";
      case "PARENTS": return "Padres";
      case "TEACHERS": return "Profesores";
      default: return type;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/directory")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Importar Datos CSV</h1>
            <p className="text-gray-600">Carga masiva de alumnos, padres o profesores</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          {showHistory ? "Ocultar" : "Ver"} historial
        </Button>
      </div>

      {/* Import History */}
      {showHistory && (
        <div className="bg-white rounded-lg border p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Historial de importaciones</h3>
          {importHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay importaciones previas</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {importHistory.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getTypeLabel(log.type)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <span className="text-green-600">{log.successRows}</span>
                      <span className="text-gray-400"> / </span>
                      <span className="text-gray-600">{log.totalRows}</span>
                      {log.errorRows > 0 && (
                        <span className="text-red-500 ml-1">({log.errorRows} errores)</span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(log.status)}`}>
                      {getStatusLabel(log.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Select Type */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Seleccionar tipo de importación</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {importTypes.map((type) => (
            <div
              key={type.value}
              onClick={() => {
                setImportType(type.value);
                resetForm();
              }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                importType === type.value
                  ? "border-[#1B4079] bg-[#1B4079]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <h3 className="font-medium text-gray-900">{type.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{type.description}</p>
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto mt-2 text-[#1B4079]"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadTemplate(type.value);
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                Descargar plantilla
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Upload File */}
      {importType && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Subir archivo CSV</h2>
          
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#1B4079] hover:bg-gray-50 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            {loading ? (
              <Loader2 className="h-10 w-10 mx-auto text-[#1B4079] animate-spin" />
            ) : (
              <Upload className="h-10 w-10 mx-auto text-gray-400" />
            )}
            <p className="mt-2 text-sm text-gray-600">
              {selectedFile ? selectedFile.name : "Haz clic para seleccionar un archivo CSV"}
            </p>
            {selectedFile && (
              <p className="text-xs text-gray-400 mt-1">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {preview.length > 0 && !result && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">3. Vista previa</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Mostrando {preview.length} de {totalRows} filas
              </span>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Cambiar archivo
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left text-gray-600">#</th>
                  {headers.map((header) => (
                    <th key={header} className="px-3 py-2 text-left text-gray-600 capitalize">
                      {header}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className={`border-t ${row._errors.length > 0 ? "bg-red-50" : ""}`}>
                    <td className="px-3 py-2 text-gray-400">{row._rowNumber}</td>
                    {headers.map((header) => (
                      <td key={header} className="px-3 py-2 text-gray-900">
                        {row[header] || <span className="text-gray-300">-</span>}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      {row._errors.length > 0 ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs">{row._errors.join(", ")}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs">Válido</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.some(r => r._errors.length > 0) && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                Algunas filas tienen errores. Puedes continuar con la importación y se omitirán las filas inválidas.
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={importing} className="bg-[#1B4079] hover:bg-[#1B4079]/90">
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar {totalRows} registros
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center">
            {result.errorCount === 0 ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            ) : result.successCount === 0 ? (
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            ) : (
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />
            )}
            
            <h2 className="text-xl font-semibold text-gray-900 mt-4">
              {result.errorCount === 0 ? "¡Importación exitosa!" :
               result.successCount === 0 ? "Importación fallida" :
               "Importación parcial"}
            </h2>

            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{result.successCount}</p>
                <p className="text-sm text-gray-500">Exitosos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{result.errorCount}</p>
                <p className="text-sm text-gray-500">Errores</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-600">{result.totalRows}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mt-6 text-left">
                <h3 className="font-medium text-gray-900 mb-2">Detalle de errores:</h3>
                <div className="bg-red-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-sm text-red-700">
                      <span className="font-medium">Fila {err.row}:</span> {err.errors.join(", ")}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={() => router.push("/directory")}>
                Ir al directorio
              </Button>
              <Button onClick={resetForm} className="bg-[#1B4079] hover:bg-[#1B4079]/90">
                Nueva importación
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
