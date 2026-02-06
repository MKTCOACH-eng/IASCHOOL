"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format, addDays, startOfWeek, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Clock,
  User,
  Users,
  Plus,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  MessageSquare,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Teacher {
  id: string;
  name: string;
  email: string;
  teacherGroups: { id: string; name: string; grade: string }[];
  teacherAvailability: {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDuration: number;
    location?: string;
  }[];
}

interface Appointment {
  id: string;
  teacherId: string;
  teacher: { id: string; name: string; email: string };
  parentId: string;
  parent: { id: string; name: string; email: string; phone?: string };
  student?: { id: string; firstName: string; lastName: string; group?: { name: string } };
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  subject: string;
  notes?: string;
  teacherNotes?: string;
  location?: string;
}

interface Slot {
  startTime: string;
  endTime: string;
  location?: string;
}

interface Availability {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  location?: string;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  group?: { name: string };
}

const DAY_NAMES: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  CONFIRMED: { label: "Confirmada", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-800", icon: XCircle },
  COMPLETED: { label: "Completada", color: "bg-blue-100 text-blue-800", icon: Check },
  NO_SHOW: { label: "No asistió", color: "bg-gray-100 text-gray-800", icon: AlertCircle },
};

export default function AppointmentsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  
  // Modal states
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Form states
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedChild, setSelectedChild] = useState("");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Availability form
  const [newAvailDay, setNewAvailDay] = useState("MONDAY");
  const [newAvailStart, setNewAvailStart] = useState("09:00");
  const [newAvailEnd, setNewAvailEnd] = useState("10:00");
  const [newAvailDuration, setNewAvailDuration] = useState("30");
  const [newAvailLocation, setNewAvailLocation] = useState("");

  const user = session?.user as { id?: string; role?: string; schoolId?: string } | undefined;
  const isTeacher = user?.role === "PROFESOR";
  const isParent = user?.role === "PADRE";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/login");
      return;
    }
    loadData();
  }, [session, status]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar citas
      const appointmentsRes = await fetch("/api/appointments");
      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json();
        setAppointments(data);
      }

      if (isTeacher) {
        // Cargar disponibilidad del profesor
        const availRes = await fetch("/api/appointments/availability");
        if (availRes.ok) {
          const data = await availRes.json();
          setAvailability(data);
        }
      }

      if (isParent) {
        // Cargar profesores disponibles
        const teachersRes = await fetch("/api/appointments/teachers");
        if (teachersRes.ok) {
          const data = await teachersRes.json();
          setTeachers(data);
        }
        // Cargar hijos
        const childrenRes = await fetch("/api/student/dashboard");
        if (childrenRes.ok) {
          const data = await childrenRes.json();
          setChildren(data.children || []);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (teacherId: string, date: string) => {
    if (!teacherId || !date) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/appointments/slots?teacherId=${teacherId}&date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.slots || []);
      }
    } catch (error) {
      console.error("Error loading slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleCreateAppointment = async () => {
    if (!selectedTeacher || !selectedDate || !selectedSlot || !subject) {
      toast.error("Completa todos los campos requeridos");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selectedTeacher,
          studentId: selectedChild || null,
          scheduledDate: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          subject,
          notes,
          location: selectedSlot.location,
        }),
      });

      if (res.ok) {
        toast.success("Cita agendada exitosamente");
        setShowNewModal(false);
        resetForm();
        loadData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al agendar cita");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al agendar cita");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAvailability = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: newAvailDay,
          startTime: newAvailStart,
          endTime: newAvailEnd,
          slotDuration: parseInt(newAvailDuration),
          location: newAvailLocation || null,
        }),
      });

      if (res.ok) {
        toast.success("Disponibilidad guardada");
        setShowAvailabilityModal(false);
        loadData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar disponibilidad");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    if (!confirm("¿Eliminar este horario de disponibilidad?")) return;
    try {
      const res = await fetch(`/api/appointments/availability?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Disponibilidad eliminada");
        loadData();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar");
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Estado actualizado");
        setShowDetailModal(false);
        loadData();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar");
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("¿Cancelar esta cita?")) return;
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Cita cancelada");
        setShowDetailModal(false);
        loadData();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cancelar");
    }
  };

  const resetForm = () => {
    setSelectedTeacher("");
    setSelectedDate("");
    setSelectedSlot(null);
    setSelectedChild("");
    setSubject("");
    setNotes("");
    setAvailableSlots([]);
  };

  const formatAppointmentDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoy";
    if (isTomorrow(date)) return "Mañana";
    return format(date, "EEE d MMM", { locale: es });
  };

  const upcomingAppointments = appointments.filter(
    a => a.status !== "CANCELLED" && a.status !== "COMPLETED" && !isPast(parseISO(a.scheduledDate))
  );
  const pastAppointments = appointments.filter(
    a => a.status === "COMPLETED" || a.status === "CANCELLED" || isPast(parseISO(a.scheduledDate))
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-[#1B4079]" />
            {isTeacher ? "Mis Citas" : "Agendar Cita"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isTeacher
              ? "Gestiona tu disponibilidad y citas con padres de familia"
              : "Agenda una cita con los profesores de tus hijos"}
          </p>
        </div>
        <div className="flex gap-2">
          {isTeacher && (
            <Button onClick={() => setShowAvailabilityModal(true)} variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Configurar Horarios
            </Button>
          )}
          {isParent && teachers.length > 0 && (
            <Button onClick={() => setShowNewModal(true)} className="bg-[#1B4079] hover:bg-[#143056]">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          )}
        </div>
      </div>

      {/* Disponibilidad del profesor */}
      {isTeacher && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#1B4079]" />
              Mi Disponibilidad
            </CardTitle>
            <CardDescription>Horarios en los que los padres pueden agendar citas contigo</CardDescription>
          </CardHeader>
          <CardContent>
            {availability.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No has configurado horarios de disponibilidad</p>
                <Button
                  onClick={() => setShowAvailabilityModal(true)}
                  variant="outline"
                  className="mt-3"
                >
                  Configurar ahora
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availability.map(slot => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{DAY_NAMES[slot.dayOfWeek]}</p>
                      <p className="text-sm text-gray-600">
                        {slot.startTime} - {slot.endTime} ({slot.slotDuration} min)
                      </p>
                      {slot.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {slot.location}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteAvailability(slot.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de profesores para padres */}
      {isParent && teachers.length === 0 && !loading && (
        <Card className="mb-6">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">Sin profesores disponibles</h3>
            <p className="text-gray-500 mt-1">
              Aún no hay profesores con horarios de citas configurados
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs de citas */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Próximas ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Historial ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900">Sin citas próximas</h3>
                <p className="text-gray-500 mt-1">
                  {isParent ? "Agenda una cita con un profesor" : "No tienes citas programadas"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map(apt => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  isTeacher={isTeacher}
                  onView={() => {
                    setSelectedAppointment(apt);
                    setShowDetailModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900">Sin historial</h3>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastAppointments.map(apt => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  isTeacher={isTeacher}
                  onView={() => {
                    setSelectedAppointment(apt);
                    setShowDetailModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal: Nueva Cita (Padres) */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agendar Nueva Cita</DialogTitle>
            <DialogDescription>
              Selecciona un profesor, fecha y horario disponible
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Seleccionar Profesor */}
            <div>
              <Label>Profesor *</Label>
              <Select
                value={selectedTeacher}
                onValueChange={(val) => {
                  setSelectedTeacher(val);
                  setSelectedSlot(null);
                  if (selectedDate) loadAvailableSlots(val, selectedDate);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un profesor" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                      {t.teacherGroups.length > 0 && (
                        <span className="text-gray-500 ml-2">
                          ({t.teacherGroups.map(g => g.name).join(", ")})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seleccionar Hijo */}
            {children.length > 0 && (
              <div>
                <Label>Relacionado con (opcional)</Label>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un hijo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ningún estudiante específico</SelectItem>
                    {children.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                        {c.group && <span className="text-gray-500 ml-1">({c.group.name})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Seleccionar Fecha */}
            <div>
              <Label>Fecha *</Label>
              <Input
                type="date"
                value={selectedDate}
                min={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                  if (selectedTeacher) loadAvailableSlots(selectedTeacher, e.target.value);
                }}
              />
            </div>

            {/* Horarios Disponibles */}
            {selectedTeacher && selectedDate && (
              <div>
                <Label>Horario disponible *</Label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-gray-500 py-2">
                    No hay horarios disponibles para esta fecha
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {availableSlots.map((slot, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant={selectedSlot?.startTime === slot.startTime ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSlot(slot)}
                        className={selectedSlot?.startTime === slot.startTime ? "bg-[#1B4079]" : ""}
                      >
                        {slot.startTime}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Motivo */}
            <div>
              <Label>Motivo de la cita *</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: Revisar calificaciones, comportamiento..."
              />
            </div>

            {/* Notas */}
            <div>
              <Label>Notas adicionales (opcional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Información adicional para el profesor..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateAppointment}
              disabled={submitting || !selectedTeacher || !selectedDate || !selectedSlot || !subject}
              className="bg-[#1B4079] hover:bg-[#143056]"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Agendar Cita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Configurar Disponibilidad (Profesores) */}
      <Dialog open={showAvailabilityModal} onOpenChange={setShowAvailabilityModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Disponibilidad</DialogTitle>
            <DialogDescription>
              Define los horarios en que estás disponible para citas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Día de la semana</Label>
              <Select value={newAvailDay} onValueChange={setNewAvailDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DAY_NAMES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hora inicio</Label>
                <Input
                  type="time"
                  value={newAvailStart}
                  onChange={(e) => setNewAvailStart(e.target.value)}
                />
              </div>
              <div>
                <Label>Hora fin</Label>
                <Input
                  type="time"
                  value={newAvailEnd}
                  onChange={(e) => setNewAvailEnd(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Duración de cada cita (minutos)</Label>
              <Select value={newAvailDuration} onValueChange={setNewAvailDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="20">20 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Lugar (opcional)</Label>
              <Input
                value={newAvailLocation}
                onChange={(e) => setNewAvailLocation(e.target.value)}
                placeholder="Ej: Sala de maestros, Aula 5..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvailabilityModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveAvailability}
              disabled={submitting}
              className="bg-[#1B4079] hover:bg-[#143056]"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Detalle de Cita */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#1B4079]" />
                  Detalle de Cita
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Estado */}
                <div className="flex items-center justify-between">
                  <Badge className={STATUS_CONFIG[selectedAppointment.status].color}>
                    {STATUS_CONFIG[selectedAppointment.status].label}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {format(parseISO(selectedAppointment.scheduledDate), "EEEE d 'de' MMMM", { locale: es })}
                  </span>
                </div>

                {/* Horario */}
                <div className="flex items-center gap-2 text-lg font-medium">
                  <Clock className="h-5 w-5 text-gray-400" />
                  {selectedAppointment.startTime} - {selectedAppointment.endTime}
                  {selectedAppointment.location && (
                    <span className="text-sm text-gray-500 ml-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {selectedAppointment.location}
                    </span>
                  )}
                </div>

                {/* Participantes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Profesor</p>
                    <p className="font-medium">{selectedAppointment.teacher.name}</p>
                    <p className="text-sm text-gray-600">{selectedAppointment.teacher.email}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Padre/Madre</p>
                    <p className="font-medium">{selectedAppointment.parent.name}</p>
                    <p className="text-sm text-gray-600">{selectedAppointment.parent.email}</p>
                  </div>
                </div>

                {/* Estudiante */}
                {selectedAppointment.student && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1 flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      Estudiante relacionado
                    </p>
                    <p className="font-medium">
                      {selectedAppointment.student.firstName} {selectedAppointment.student.lastName}
                      {selectedAppointment.student.group && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({selectedAppointment.student.group.name})
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Motivo */}
                <div>
                  <p className="text-sm text-gray-500">Motivo</p>
                  <p className="font-medium">{selectedAppointment.subject}</p>
                </div>

                {/* Notas */}
                {selectedAppointment.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notas del padre</p>
                    <p className="text-gray-700 bg-gray-50 p-2 rounded">{selectedAppointment.notes}</p>
                  </div>
                )}

                {selectedAppointment.teacherNotes && (
                  <div>
                    <p className="text-sm text-gray-500">Notas del profesor</p>
                    <p className="text-gray-700 bg-blue-50 p-2 rounded">{selectedAppointment.teacherNotes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-2">
                {/* Acciones según rol y estado */}
                {selectedAppointment.status === "PENDING" && isTeacher && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedAppointment.id, "CONFIRMED")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirmar
                  </Button>
                )}

                {selectedAppointment.status === "CONFIRMED" && isTeacher && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedAppointment.id, "COMPLETED")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Marcar Completada
                  </Button>
                )}

                {["PENDING", "CONFIRMED"].includes(selectedAppointment.status) && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelAppointment(selectedAppointment.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar Cita
                  </Button>
                )}

                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente de tarjeta de cita
function AppointmentCard({
  appointment,
  isTeacher,
  onView,
}: {
  appointment: Appointment;
  isTeacher: boolean;
  onView: () => void;
}) {
  const StatusIcon = STATUS_CONFIG[appointment.status].icon;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onView}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-[#1B4079]/10 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-[#1B4079]" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{appointment.subject}</p>
              <p className="text-sm text-gray-600">
                {isTeacher
                  ? `Con: ${appointment.parent.name}`
                  : `Con: ${appointment.teacher.name}`}
              </p>
              {appointment.student && (
                <p className="text-xs text-gray-500 mt-1">
                  <GraduationCap className="h-3 w-3 inline mr-1" />
                  {appointment.student.firstName} {appointment.student.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="font-medium text-[#1B4079]">
              {format(parseISO(appointment.scheduledDate), "d MMM", { locale: es })}
            </p>
            <p className="text-sm text-gray-600">
              {appointment.startTime} - {appointment.endTime}
            </p>
            <Badge className={`mt-2 ${STATUS_CONFIG[appointment.status].color}`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {STATUS_CONFIG[appointment.status].label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
