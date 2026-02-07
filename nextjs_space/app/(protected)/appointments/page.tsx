'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Calendar, Clock, Video, VideoOff, User, CheckCircle, XCircle, Loader2, ExternalLink, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: string;
  subject: string;
  notes: string | null;
  teacherNotes: string | null;
  location: string | null;
  isVideoCall: boolean;
  meetingUrl: string | null;
  teacher: { id: string; name: string; email: string };
  parent: { id: string; name: string; email: string };
  student: { id: string; firstName: string; lastName: string } | null;
}

interface Teacher {
  id: string;
  name: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-700' },
  COMPLETED: { label: 'Completada', color: 'bg-blue-100 text-blue-700' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
  NO_SHOW: { label: 'No asistió', color: 'bg-gray-100 text-gray-700' },
};

export default function AppointmentsPage() {
  const { data: session } = useSession() || {};
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [children, setChildren] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const user = session?.user as { id: string; role: string } | undefined;
  const isTeacher = user?.role === 'PROFESOR';
  const isParent = user?.role === 'PADRE';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, teachersRes, childrenRes] = await Promise.all([
        fetch('/api/appointments'),
        isParent ? fetch('/api/user?role=PROFESOR') : Promise.resolve(null),
        isParent ? fetch('/api/student/my-children') : Promise.resolve(null),
      ]);

      if (appointmentsRes.ok) setAppointments(await appointmentsRes.json());
      if (teachersRes && teachersRes.ok) {
        const data = await teachersRes.json();
        setTeachers(data.users || data || []);
      }
      if (childrenRes && childrenRes.ok) setChildren(await childrenRes.json());
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success('Estado actualizado');
        fetchData();
        setSelectedAppointment(null);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleToggleVideo = async (id: string, currentlyVideo: boolean) => {
    try {
      if (currentlyVideo) {
        // Remove video call
        const res = await fetch(`/api/appointments/video?appointmentId=${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Videollamada removida');
          fetchData();
        }
      } else {
        // Add video call
        const res = await fetch('/api/appointments/video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appointmentId: id }),
        });
        if (res.ok) {
          const data = await res.json();
          toast.success('Videollamada creada');
          fetchData();
          // Show meeting URL
          if (data.meeting?.meetingUrl) {
            toast.info(`URL de la reunión: ${data.meeting.meetingUrl}`, { duration: 10000 });
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al configurar videollamada');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const searchString = `${apt.subject} ${apt.teacher.name} ${apt.parent.name} ${apt.student?.firstName || ''}`;
    const matchesSearch = searchString.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const upcomingAppointments = filteredAppointments.filter(apt => 
    new Date(apt.scheduledDate) >= new Date() && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(apt.status)
  ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const pastAppointments = filteredAppointments.filter(apt => 
    new Date(apt.scheduledDate) < new Date() || ['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(apt.status)
  ).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

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
          <h1 className="text-3xl font-bold text-gray-900">Agenda de Citas</h1>
          <p className="text-gray-600 mt-1">
            {isTeacher ? 'Gestiona las citas con padres de familia' : 
             isParent ? 'Solicita y administra citas con profesores' :
             'Todas las citas de la escuela'}
          </p>
        </div>
        {isParent && (
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Solicitar Cita
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
              <p className="text-sm text-gray-500">Próximas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {appointments.filter(a => a.status === 'CONFIRMED').length}
              </p>
              <p className="text-sm text-gray-500">Confirmadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {appointments.filter(a => a.isVideoCall).length}
              </p>
              <p className="text-sm text-gray-500">Videollamadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {appointments.filter(a => a.status === 'PENDING').length}
              </p>
              <p className="text-sm text-gray-500">Pendientes</p>
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
                placeholder="Buscar por motivo, profesor o padre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
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

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Próximas Citas</h2>
          <div className="space-y-4">
            {upcomingAppointments.map(apt => (
              <div key={apt.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{apt.subject}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[apt.status]?.color}`}>
                        {statusLabels[apt.status]?.label}
                      </span>
                      {apt.isVideoCall && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                          <Video className="w-3 h-3" /> Video
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {new Date(apt.scheduledDate).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      <Clock className="w-4 h-4 inline ml-3 mr-1" />
                      {apt.startTime} - {apt.endTime}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      <User className="w-4 h-4 inline mr-1" />
                      {isTeacher ? `Padre: ${apt.parent.name}` : `Profesor: ${apt.teacher.name}`}
                      {apt.student && ` • Estudiante: ${apt.student.firstName} ${apt.student.lastName}`}
                    </p>
                    {apt.location && !apt.isVideoCall && (
                      <p className="text-sm text-gray-500 mt-1">Lugar: {apt.location}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {apt.isVideoCall && apt.meetingUrl && (
                      <Button 
                        size="sm" 
                        className="gap-2 bg-purple-600 hover:bg-purple-700"
                        onClick={() => window.open(apt.meetingUrl!, '_blank')}
                      >
                        <Video className="w-4 h-4" /> Unirse
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                    {(isTeacher || isAdmin) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleToggleVideo(apt.id, apt.isVideoCall)}
                        className="gap-1"
                      >
                        {apt.isVideoCall ? (
                          <><VideoOff className="w-4 h-4" /> Quitar Video</>
                        ) : (
                          <><Video className="w-4 h-4" /> Añadir Video</>
                        )}
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedAppointment(apt)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past/Completed Appointments */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Historial</h2>
        {pastAppointments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay citas en el historial</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastAppointments.slice(0, 10).map(apt => (
              <div key={apt.id} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{apt.subject}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(apt.scheduledDate).toLocaleDateString('es-MX')} • 
                      {isTeacher ? ` ${apt.parent.name}` : ` ${apt.teacher.name}`}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[apt.status]?.color}`}>
                    {statusLabels[apt.status]?.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && isParent && (
        <CreateAppointmentModal
          teachers={teachers}
          children={children}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchData();
          }}
        />
      )}

      {/* Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Detalle de Cita</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Motivo</label>
                <p className="font-medium">{selectedAppointment.subject}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha</label>
                  <p>{new Date(selectedAppointment.scheduledDate).toLocaleDateString('es-MX')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hora</label>
                  <p>{selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Profesor</label>
                  <p>{selectedAppointment.teacher.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Padre</label>
                  <p>{selectedAppointment.parent.name}</p>
                </div>
              </div>
              {selectedAppointment.student && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Estudiante</label>
                  <p>{selectedAppointment.student.firstName} {selectedAppointment.student.lastName}</p>
                </div>
              )}
              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notas del Padre</label>
                  <p className="text-gray-600">{selectedAppointment.notes}</p>
                </div>
              )}
              {selectedAppointment.isVideoCall && selectedAppointment.meetingUrl && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-purple-700">Videollamada</label>
                  <p className="text-purple-600 text-sm break-all">{selectedAppointment.meetingUrl}</p>
                  <Button 
                    size="sm" 
                    className="mt-2 bg-purple-600"
                    onClick={() => window.open(selectedAppointment.meetingUrl!, '_blank')}
                  >
                    Unirse a la Videollamada
                  </Button>
                </div>
              )}
              
              {/* Status Actions */}
              {(isTeacher || isAdmin) && !['COMPLETED', 'CANCELLED'].includes(selectedAppointment.status) && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-500 block mb-2">Actualizar Estado</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedAppointment.status === 'PENDING' && (
                      <Button size="sm" onClick={() => handleUpdateStatus(selectedAppointment.id, 'CONFIRMED')}>
                        Confirmar
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(selectedAppointment.id, 'COMPLETED')}>
                      Marcar Completada
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(selectedAppointment.id, 'NO_SHOW')}>
                      No Asistió
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(selectedAppointment.id, 'CANCELLED')}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t">
              <Button variant="outline" className="w-full" onClick={() => setSelectedAppointment(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateAppointmentModal({ 
  teachers, 
  children, 
  onClose, 
  onCreated 
}: { 
  teachers: Teacher[]; 
  children: Student[]; 
  onClose: () => void; 
  onCreated: () => void;
}) {
  const [teacherId, setTeacherId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!teacherId || !date || !subject) {
      toast.error('Completa los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          studentId: studentId || null,
          scheduledDate: date,
          startTime,
          endTime: `${parseInt(startTime.split(':')[0]) + 1}:${startTime.split(':')[1]}`,
          subject,
          notes,
          isVideoCall,
        }),
      });

      if (res.ok) {
        toast.success('Cita solicitada exitosamente');
        onCreated();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al crear cita');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear cita');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Solicitar Nueva Cita</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Profesor *</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Seleccionar profesor...</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estudiante (opcional)</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Seleccionar...</option>
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha *</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora *</label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Motivo de la Cita *</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej: Revisión de calificaciones, Conducta..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notas adicionales</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg h-20"
              placeholder="Información adicional para el profesor..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="videoCall"
              checked={isVideoCall}
              onChange={(e) => setIsVideoCall(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="videoCall" className="text-sm flex items-center gap-1">
              <Video className="w-4 h-4 text-purple-600" /> Solicitar videollamada
            </label>
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Solicitar Cita'}
          </Button>
        </div>
      </div>
    </div>
  );
}
