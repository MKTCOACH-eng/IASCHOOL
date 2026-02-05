"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  X,
  Loader2,
  GraduationCap,
  PartyPopper,
  BookOpen,
  UserCheck,
  Briefcase,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
  type: string;
  color: string;
  location: string | null;
  isPublic: boolean;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  group: {
    id: string;
    name: string;
  } | null;
  task: {
    id: string;
    title: string;
  } | null;
  attendees: {
    id: string;
    status: string;
    user: {
      id: string;
      name: string;
    };
  }[];
  _count: {
    attendees: number;
  };
}

interface Group {
  id: string;
  name: string;
}

const EVENT_TYPES = [
  { value: "ESCOLAR", label: "Escolar", icon: GraduationCap, color: "#1B4079" },
  { value: "REUNION", label: "Reunión", icon: Users, color: "#7C3AED" },
  { value: "CITA", label: "Cita", icon: UserCheck, color: "#059669" },
  { value: "FESTIVO", label: "Festivo", icon: PartyPopper, color: "#DC2626" },
  { value: "ACADEMICO", label: "Académico", icon: BookOpen, color: "#EA580C" },
  { value: "EXTRACURRICULAR", label: "Extracurricular", icon: Briefcase, color: "#0891B2" },
];

export default function CalendarPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);

  // Initialize date on client only
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!currentDate) return;
    
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      let url = `/api/events?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
      if (filterType) {
        url += `&type=${filterType}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, filterType]);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups/my-groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.map((g: any) => ({ id: g.id, name: g.name })));
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && currentDate) {
      fetchEvents();
      fetchGroups();
    }
  }, [status, router, currentDate, fetchEvents]);

  useEffect(() => {
    if (currentDate) {
      fetchEvents();
    }
  }, [currentDate, filterType, fetchEvents]);

  // Don't render calendar until date is initialized
  if (!currentDate) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  const user = session?.user as any;
  const canCreateEvent = user?.role === "ADMIN" || user?.role === "PROFESOR";

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventDate = parseISO(event.startDate);
      return isSameDay(eventDate, day);
    });
  };

  const getEventTypeInfo = (type: string) => {
    return EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[0];
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="h-7 w-7 text-[#1B4079]" />
            Calendario
          </h1>
          <p className="text-gray-600 mt-1">Eventos y fechas importantes</p>
        </div>
        {canCreateEvent && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#1B4079] hover:bg-[#15325f] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo evento
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center capitalize">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoToToday}
            className="ml-2"
          >
            Hoy
          </Button>
        </div>

        {/* Filter by type */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterType || ""}
            onChange={(e) => setFilterType(e.target.value || null)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
          >
            <option value="">Todos los tipos</option>
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-medium text-gray-500 bg-gray-50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] sm:min-h-[120px] border-b border-r border-gray-100 p-1 sm:p-2 ${
                    !isCurrentMonth ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                      isDayToday
                        ? "bg-[#1B4079] text-white"
                        : isCurrentMonth
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const typeInfo = getEventTypeInfo(event.type);
                      return (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className="w-full text-left text-xs p-1 rounded truncate hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: `${event.color}20`,
                            color: event.color,
                            borderLeft: `3px solid ${event.color}`,
                          }}
                        >
                          {event.title}
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 pl-1">
                        +{dayEvents.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Type Legend */}
      <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Tipos de eventos</h3>
        <div className="flex flex-wrap gap-4">
          {EVENT_TYPES.map((type) => (
            <div key={type.value} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-sm text-gray-600">{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={() => {
            fetchEvents();
            setSelectedEvent(null);
          }}
          currentUserId={user?.id}
          currentUserRole={user?.role}
        />
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            fetchEvents();
            setShowCreateModal(false);
          }}
          groups={groups}
        />
      )}
    </div>
  );
}

// Event Detail Modal Component
function EventDetailModal({
  event,
  onClose,
  onDelete,
  currentUserId,
  currentUserRole,
}: {
  event: Event;
  onClose: () => void;
  onDelete: () => void;
  currentUserId: string;
  currentUserRole: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const [responding, setResponding] = useState(false);

  const canDelete =
    currentUserRole === "ADMIN" || event.createdBy.id === currentUserId;

  const userAttendance = event.attendees.find(
    (a) => a.user.id === currentUserId
  );

  const handleDelete = async () => {
    if (!confirm("¿Está seguro de eliminar este evento?")) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Evento eliminado");
        onDelete();
      } else {
        toast.error("Error al eliminar evento");
      }
    } catch (error) {
      toast.error("Error al eliminar evento");
    } finally {
      setDeleting(false);
    }
  };

  const handleRespond = async (status: string) => {
    setResponding(true);
    try {
      const res = await fetch(`/api/events/${event.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(
          status === "CONFIRMED"
            ? "Asistencia confirmada"
            : "Has declinado la invitación"
        );
        onDelete(); // Refresh events
      } else {
        toast.error("Error al responder");
      }
    } catch (error) {
      toast.error("Error al responder");
    } finally {
      setResponding(false);
    }
  };

  const typeInfo = EVENT_TYPES.find((t) => t.value === event.type) || EVENT_TYPES[0];
  const TypeIcon = typeInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ backgroundColor: `${event.color}10` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: event.color }}
            >
              <TypeIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${event.color}20`,
                  color: event.color,
                }}
              >
                {typeInfo.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{event.title}</h2>

          {event.description && (
            <p className="text-gray-600 mb-4">{event.description}</p>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">
                  {format(parseISO(event.startDate), "EEEE d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </p>
                {!event.allDay && (
                  <p className="text-sm text-gray-500">
                    {format(parseISO(event.startDate), "HH:mm", { locale: es })}
                    {event.endDate &&
                      ` - ${format(parseISO(event.endDate), "HH:mm", { locale: es })}`}
                  </p>
                )}
                {event.allDay && (
                  <p className="text-sm text-gray-500">Todo el día</p>
                )}
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span>{event.location}</span>
              </div>
            )}

            {event.group && (
              <div className="flex items-center gap-3 text-gray-700">
                <GraduationCap className="h-5 w-5 text-gray-400" />
                <span>{event.group.name}</span>
              </div>
            )}

            {event.attendees.length > 0 && (
              <div className="flex items-start gap-3 text-gray-700">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {event.attendees.length} invitado
                    {event.attendees.length !== 1 && "s"}
                  </p>
                  <div className="text-sm text-gray-500">
                    {event.attendees
                      .slice(0, 3)
                      .map((a) => a.user.name)
                      .join(", ")}
                    {event.attendees.length > 3 && ` y ${event.attendees.length - 3} más`}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t text-sm text-gray-500">
            Creado por {event.createdBy.name}
          </div>

          {/* Response buttons for invitees */}
          {userAttendance && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">
                Estado actual:{" "}
                <span
                  className={`font-medium ${
                    userAttendance.status === "CONFIRMED"
                      ? "text-green-600"
                      : userAttendance.status === "DECLINED"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {userAttendance.status === "CONFIRMED"
                    ? "Confirmado"
                    : userAttendance.status === "DECLINED"
                    ? "Declinado"
                    : "Pendiente"}
                </span>
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={userAttendance.status === "CONFIRMED" ? "default" : "outline"}
                  onClick={() => handleRespond("CONFIRMED")}
                  disabled={responding}
                  className={userAttendance.status === "CONFIRMED" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant={userAttendance.status === "DECLINED" ? "default" : "outline"}
                  onClick={() => handleRespond("DECLINED")}
                  disabled={responding}
                  className={userAttendance.status === "DECLINED" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  Declinar
                </Button>
              </div>
            </div>
          )}

          {/* Delete button */}
          {canDelete && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Eliminar evento
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Event Modal Component
function CreateEventModal({
  onClose,
  onCreated,
  groups,
}: {
  onClose: () => void;
  onCreated: () => void;
  groups: Group[];
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "10:00",
    allDay: false,
    type: "ESCOLAR",
    color: "#1B4079",
    location: "",
    isPublic: true,
    groupId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate) {
      toast.error("Título y fecha son requeridos");
      return;
    }

    setLoading(true);
    try {
      const startDateTime = formData.allDay
        ? new Date(formData.startDate)
        : new Date(`${formData.startDate}T${formData.startTime}`);
      
      const endDateTime =
        formData.endDate && !formData.allDay
          ? new Date(`${formData.endDate}T${formData.endTime}`)
          : formData.endDate
          ? new Date(formData.endDate)
          : null;

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime?.toISOString() || null,
          allDay: formData.allDay,
          type: formData.type,
          color: formData.color,
          location: formData.location || null,
          isPublic: formData.isPublic,
          groupId: formData.groupId || null,
        }),
      });

      if (res.ok) {
        toast.success("Evento creado exitosamente");
        onCreated();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al crear evento");
      }
    } catch (error) {
      toast.error("Error al crear evento");
    } finally {
      setLoading(false);
    }
  };

  const selectedType = EVENT_TYPES.find((t) => t.value === formData.type);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo evento</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
              placeholder="Nombre del evento"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
              rows={3}
              placeholder="Detalles del evento"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de evento
            </label>
            <select
              value={formData.type}
              onChange={(e) => {
                const type = EVENT_TYPES.find((t) => t.value === e.target.value);
                setFormData({
                  ...formData,
                  type: e.target.value,
                  color: type?.color || "#1B4079",
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="h-4 w-4 text-[#1B4079] rounded border-gray-300"
            />
            <label htmlFor="allDay" className="text-sm text-gray-700">
              Todo el día
            </label>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha inicio *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
                required
              />
            </div>
            {!formData.allDay && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora inicio
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
              />
            </div>
            {!formData.allDay && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora fin
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
              placeholder="Aula, auditorio, etc."
            />
          </div>

          {/* Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grupo específico (opcional)
            </label>
            <select
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
            >
              <option value="">Toda la escuela</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Public */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="h-4 w-4 text-[#1B4079] rounded border-gray-300"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Visible para toda la escuela
            </label>
          </div>

          {/* Color Preview */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: formData.color }}
            />
            <span className="text-sm text-gray-600">
              Color: {selectedType?.label}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#1B4079] hover:bg-[#15325f] text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Crear evento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
