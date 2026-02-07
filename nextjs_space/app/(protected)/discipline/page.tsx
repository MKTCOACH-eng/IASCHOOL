'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, AlertTriangle, CheckCircle, Search, Filter, Loader2, FileWarning, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface DisciplineRecord {
  id: string;
  type: string;
  severity: string;
  date: string;
  description: string;
  location: string | null;
  points: number;
  actionTaken: string | null;
  parentNotified: boolean;
  resolved: boolean;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    group: { name: string } | null;
  };
  recordedBy: { name: string };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  group: { name: string } | null;
}

const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
  POSITIVE: { label: 'Reconocimiento', color: 'bg-green-100 text-green-700', icon: '🌟' },
  WARNING: { label: 'Advertencia', color: 'bg-yellow-100 text-yellow-700', icon: '⚠️' },
  WRITTEN_WARNING: { label: 'Amonestación Escrita', color: 'bg-orange-100 text-orange-700', icon: '📝' },
  DETENTION: { label: 'Detención', color: 'bg-red-100 text-red-700', icon: '⏰' },
  SUSPENSION: { label: 'Suspensión', color: 'bg-red-200 text-red-800', icon: '🚫' },
  PARENT_MEETING: { label: 'Cita con Padres', color: 'bg-purple-100 text-purple-700', icon: '👥' },
  OTHER: { label: 'Otro', color: 'bg-gray-100 text-gray-700', icon: '📌' },
};

const severityLabels: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Leve', color: 'bg-green-500' },
  MEDIUM: { label: 'Moderada', color: 'bg-yellow-500' },
  HIGH: { label: 'Alta', color: 'bg-orange-500' },
  CRITICAL: { label: 'Crítica', color: 'bg-red-500' },
};

export default function DisciplinePage() {
  const { data: session } = useSession() || {};
  const [records, setRecords] = useState<DisciplineRecord[]>([]);
  const [studentPoints, setStudentPoints] = useState<Record<string, number>>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterResolved, setFilterResolved] = useState('');

  const user = session?.user as { role: string } | undefined;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROFESOR';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recordsRes, studentsRes] = await Promise.all([
        fetch('/api/discipline'),
        isAdmin ? fetch('/api/student') : Promise.resolve(null),
      ]);

      if (recordsRes.ok) {
        const data = await recordsRes.json();
        setRecords(data.records || []);
        setStudentPoints(data.studentPoints || {});
      }
      if (studentsRes && studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data.students || data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`/api/discipline/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: true }),
      });
      if (res.ok) {
        toast.success('Registro marcado como resuelto');
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar');
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = `${r.student.firstName} ${r.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || r.type === filterType;
    const matchesResolved = filterResolved === '' || 
      (filterResolved === 'true' ? r.resolved : !r.resolved);
    return matchesSearch && matchesType && matchesResolved;
  });

  const stats = {
    total: records.length,
    positive: records.filter(r => r.type === 'POSITIVE').length,
    pending: records.filter(r => !r.resolved && r.type !== 'POSITIVE').length,
    resolved: records.filter(r => r.resolved).length,
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
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Disciplina</h1>
          <p className="text-gray-600 mt-1">Registro de conducta y comportamiento</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Nuevo Registro
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileWarning className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Registros</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.positive}</p>
              <p className="text-sm text-gray-500">Reconocimientos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.resolved}</p>
              <p className="text-sm text-gray-500">Resueltos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(typeLabels).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <select
            value={filterResolved}
            onChange={(e) => setFilterResolved(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Todos</option>
            <option value="false">Pendientes</option>
            <option value="true">Resueltos</option>
          </select>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <FileWarning className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No hay registros</h3>
            <p className="text-gray-500">No se encontraron registros de disciplina</p>
          </div>
        ) : (
          filteredRecords.map(record => (
            <div key={record.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{typeLabels[record.type]?.icon || '📌'}</span>
                    <h3 className="text-lg font-semibold">
                      {record.student.firstName} {record.student.lastName}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeLabels[record.type]?.color || 'bg-gray-100'}`}>
                      {typeLabels[record.type]?.label || record.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${severityLabels[record.severity]?.color || 'bg-gray-500'}`} />
                      <span className="text-xs text-gray-500">{severityLabels[record.severity]?.label}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {record.student.group?.name} • {new Date(record.date).toLocaleDateString('es-MX')} • Por: {record.recordedBy.name}
                  </p>
                  <p className="text-gray-700">{record.description}</p>
                  {record.actionTaken && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Acción tomada:</strong> {record.actionTaken}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {record.points !== 0 && (
                    <span className={`text-lg font-bold ${record.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {record.points > 0 ? '+' : ''}{record.points} pts
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    {record.resolved ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Resuelto
                      </span>
                    ) : record.type !== 'POSITIVE' && isAdmin && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleResolve(record.id)}
                      >
                        Marcar Resuelto
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreate && isAdmin && (
        <CreateRecordModal
          students={students}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function CreateRecordModal({ 
  students, 
  onClose, 
  onCreated 
}: { 
  students: Student[]; 
  onClose: () => void; 
  onCreated: () => void;
}) {
  const [studentId, setStudentId] = useState('');
  const [type, setType] = useState('WARNING');
  const [severity, setSeverity] = useState('MEDIUM');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [points, setPoints] = useState(0);
  const [actionTaken, setActionTaken] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!studentId || !description) {
      toast.error('Completa los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/discipline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId, type, severity, date, description, location, points, actionTaken
        }),
      });

      if (res.ok) {
        toast.success('Registro creado');
        onCreated();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear registro');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Nuevo Registro de Disciplina</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Estudiante *</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Seleccionar...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} {s.group ? `(${s.group.name})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                {Object.entries(typeLabels).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Severidad</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                {Object.entries(severityLabels).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Puntos</label>
              <Input type="number" value={points} onChange={(e) => setPoints(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg h-24"
              placeholder="Describe el incidente o reconocimiento..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lugar</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Salón de clases, patio..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Acción Tomada</label>
            <textarea
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg h-20"
              placeholder="Qué acción se tomó..."
            />
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
