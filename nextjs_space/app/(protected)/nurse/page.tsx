'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Heart, Activity, Thermometer, Clock, Search, User, AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface NurseVisit {
  id: string;
  type: string;
  status: string;
  arrivalTime: string;
  departureTime: string | null;
  chiefComplaint: string;
  symptoms: string | null;
  treatment: string | null;
  parentNotified: boolean;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    group: { name: string } | null;
    medicalInfo: {
      allergies: string | null;
      conditions: string | null;
    } | null;
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
  ILLNESS: { label: 'Enfermedad', color: 'bg-red-100 text-red-700', icon: '🤒' },
  INJURY: { label: 'Lesión', color: 'bg-orange-100 text-orange-700', icon: '🩹' },
  MEDICATION: { label: 'Medicamento', color: 'bg-blue-100 text-blue-700', icon: '💊' },
  CHECKUP: { label: 'Revisión', color: 'bg-green-100 text-green-700', icon: '🩺' },
  EMERGENCY: { label: 'Emergencia', color: 'bg-red-200 text-red-800', icon: '🚨' },
  MENTAL_HEALTH: { label: 'Salud Mental', color: 'bg-purple-100 text-purple-700', icon: '🧠' },
  OTHER: { label: 'Otro', color: 'bg-gray-100 text-gray-700', icon: '📌' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  IN_PROGRESS: { label: 'En Atención', color: 'bg-yellow-100 text-yellow-700' },
  RETURNED_CLASS: { label: 'Regresó a Clase', color: 'bg-green-100 text-green-700' },
  SENT_HOME: { label: 'Enviado a Casa', color: 'bg-orange-100 text-orange-700' },
  EMERGENCY_TRANSFER: { label: 'Emergencias', color: 'bg-red-100 text-red-700' },
  COMPLETED: { label: 'Completado', color: 'bg-gray-100 text-gray-700' },
};

export default function NursePage() {
  const { data: session } = useSession() || {};
  const [visits, setVisits] = useState<NurseVisit[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<NurseVisit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const user = session?.user as { role: string } | undefined;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROFESOR';

  useEffect(() => {
    fetchData();
  }, [filterDate]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filterDate) params.set('date', filterDate);
      
      const [visitsRes, studentsRes] = await Promise.all([
        fetch(`/api/nurse?${params}`),
        isAdmin ? fetch('/api/student') : Promise.resolve(null),
      ]);

      if (visitsRes.ok) setVisits(await visitsRes.json());
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

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/nurse/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success('Estado actualizado');
        fetchData();
        setSelectedVisit(null);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar');
    }
  };

  const filteredVisits = visits.filter(v => {
    const matchesSearch = `${v.student.firstName} ${v.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || v.type === filterType;
    const matchesStatus = !filterStatus || v.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const activeVisits = filteredVisits.filter(v => v.status === 'IN_PROGRESS');
  const completedVisits = filteredVisits.filter(v => v.status !== 'IN_PROGRESS');

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
          <h1 className="text-3xl font-bold text-gray-900">Módulo de Enfermería</h1>
          <p className="text-gray-600 mt-1">Control de visitas y atención médica</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Nueva Visita
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8" />
            <div>
              <p className="text-3xl font-bold">{activeVisits.length}</p>
              <p className="text-red-100 text-sm">En Atención</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedVisits.length}</p>
              <p className="text-sm text-gray-500">Completadas Hoy</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Thermometer className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {visits.filter(v => v.type === 'ILLNESS').length}
              </p>
              <p className="text-sm text-gray-500">Enfermedades</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{visits.length}</p>
              <p className="text-sm text-gray-500">Total Visitas</p>
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
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-auto"
          />
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Todos los estados</option>
            {Object.entries(statusLabels).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Visits */}
      {activeVisits.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" /> En Atención Actualmente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeVisits.map(visit => (
              <div key={visit.id} className="bg-red-50 border-2 border-red-200 rounded-xl p-5 animate-pulse-slow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{typeLabels[visit.type]?.icon}</span>
                      <h3 className="font-semibold text-lg">
                        {visit.student.firstName} {visit.student.lastName}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{visit.student.group?.name}</p>
                    <p className="text-red-700 font-medium">{visit.chiefComplaint}</p>
                    {visit.student.medicalInfo?.allergies && (
                      <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Alergias: {visit.student.medicalInfo.allergies}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(visit.arrivalTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setSelectedVisit(visit)}
                    >
                      Actualizar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Visits */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Historial del Día</h2>
        <div className="space-y-3">
          {completedVisits.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay visitas completadas</p>
            </div>
          ) : (
            completedVisits.map(visit => (
              <div key={visit.id} className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{typeLabels[visit.type]?.icon}</span>
                    <div>
                      <h3 className="font-medium">
                        {visit.student.firstName} {visit.student.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {visit.chiefComplaint} • {visit.student.group?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[visit.status]?.color}`}>
                        {statusLabels[visit.status]?.label}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(visit.arrivalTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        {visit.departureTime && (
                          <> <ArrowRight className="w-3 h-3 inline" /> {new Date(visit.departureTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</>
                        )}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedVisit(visit)}>
                      Ver
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && isAdmin && (
        <CreateVisitModal
          students={students}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchData();
          }}
        />
      )}

      {/* View/Update Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {typeLabels[selectedVisit.type]?.icon} Detalle de Visita
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold">
                  {selectedVisit.student.firstName} {selectedVisit.student.lastName}
                </h3>
                <p className="text-sm text-gray-500">{selectedVisit.student.group?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Motivo</label>
                <p className="font-medium">{selectedVisit.chiefComplaint}</p>
              </div>
              {selectedVisit.symptoms && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Síntomas</label>
                  <p>{selectedVisit.symptoms}</p>
                </div>
              )}
              {selectedVisit.treatment && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tratamiento</label>
                  <p>{selectedVisit.treatment}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusLabels[selectedVisit.status]?.color}`}>
                  {statusLabels[selectedVisit.status]?.label}
                </span>
                {selectedVisit.parentNotified && (
                  <span className="text-green-600 text-sm flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Padre notificado
                  </span>
                )}
              </div>
              {selectedVisit.status === 'IN_PROGRESS' && isAdmin && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-500 block mb-2">Actualizar Estado</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedVisit.id, 'RETURNED_CLASS')}>
                      Regresó a Clase
                    </Button>
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedVisit.id, 'SENT_HOME')}>
                      Enviado a Casa
                    </Button>
                    <Button variant="destructive" onClick={() => handleUpdateStatus(selectedVisit.id, 'EMERGENCY_TRANSFER')}>
                      Emergencias
                    </Button>
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedVisit.id, 'COMPLETED')}>
                      Completado
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t">
              <Button variant="outline" className="w-full" onClick={() => setSelectedVisit(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateVisitModal({ 
  students, 
  onClose, 
  onCreated 
}: { 
  students: Student[]; 
  onClose: () => void; 
  onCreated: () => void;
}) {
  const [studentId, setStudentId] = useState('');
  const [type, setType] = useState('ILLNESS');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!studentId || !chiefComplaint) {
      toast.error('Completa los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/nurse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, type, chiefComplaint, symptoms }),
      });

      if (res.ok) {
        toast.success('Visita registrada');
        onCreated();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear visita');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Nueva Visita a Enfermería</h2>
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
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Visita</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              {Object.entries(typeLabels).map(([key, val]) => (
                <option key={key} value={key}>{val.icon} {val.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Motivo de Consulta *</label>
            <Input
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Ej: Dolor de cabeza, caída en el patio..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Síntomas</label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg h-24"
              placeholder="Describe los síntomas observados..."
            />
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrar Visita'}
          </Button>
        </div>
      </div>
    </div>
  );
}
