"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Clock, Calendar, Users, BookOpen, Plus, Trash2, Loader2,
  ChevronLeft, ChevronRight, GraduationCap, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";

interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom: string | null;
  subject: { id: string; name: string; color: string };
  group: { id: string; name: string };
  teacher: { id: string; name: string };
}

interface Group {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Teacher {
  id: string;
  name: string;
}

const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" }
];

const TIME_SLOTS = [
  "07:00", "07:50", "08:40", "09:30", "10:20", "11:10", 
  "12:00", "12:50", "13:40", "14:30", "15:20"
];

export default function SchedulesPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    subjectId: "",
    groupId: "",
    teacherId: "",
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "08:50",
    classroom: ""
  });

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [session, status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, groupsRes] = await Promise.all([
        fetch(`/api/schedules${selectedGroup ? `?groupId=${selectedGroup}` : ""}`),
        fetch("/api/groups/my-groups")
      ]);

      if (schedulesRes.ok) setSchedules(await schedulesRes.json());
      if (groupsRes.ok) setGroups(await groupsRes.json());

      // Para admins, cargar materias y profesores
      if (isAdmin) {
        const [subjectsRes, teachersRes] = await Promise.all([
          fetch("/api/subjects"),
          fetch("/api/admin/directory/staff?role=PROFESOR")
        ]);
        if (subjectsRes.ok) setSubjects(await subjectsRes.json());
        if (teachersRes.ok) {
          const data = await teachersRes.json();
          setTeachers(data.users || []);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchSchedules();
    }
  }, [selectedGroup]);

  const fetchSchedules = async () => {
    try {
      const res = await fetch(`/api/schedules${selectedGroup ? `?groupId=${selectedGroup}` : ""}`);
      if (res.ok) setSchedules(await res.json());
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const createSchedule = async () => {
    if (!form.subjectId || !form.groupId || !form.teacherId) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        toast.success("Horario creado");
        setShowModal(false);
        setForm({ subjectId: "", groupId: "", teacherId: "", dayOfWeek: 1, startTime: "08:00", endTime: "08:50", classroom: "" });
        fetchSchedules();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al crear horario");
      }
    } catch (error) {
      toast.error("Error al crear horario");
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm("¿Eliminar este horario?")) return;
    try {
      const res = await fetch(`/api/schedules?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Horario eliminado");
        fetchSchedules();
      }
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const getScheduleForSlot = (day: number, time: string) => {
    return schedules.find(s => 
      s.dayOfWeek === day && 
      s.startTime <= time && 
      s.endTime > time
    );
  };

  const getUniqueGroups = () => {
    const uniqueGroups = new Map();
    schedules.forEach(s => uniqueGroups.set(s.group.id, s.group));
    return Array.from(uniqueGroups.values());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Clock className="w-7 h-7 text-[#1B4079]" />
            Horario de Clases
          </h1>
          <p className="text-gray-500 mt-1">
            {userRole === "PADRE" ? "Horario de tus hijos" : 
             userRole === "ALUMNO" ? "Tu horario semanal" :
             userRole === "PROFESOR" ? "Tus clases programadas" :
             "Administración de horarios escolares"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtro de grupo */}
          {groups.length > 1 && (
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">Todos los grupos</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          )}
          {isAdmin && (
            <Button onClick={() => setShowModal(true)} className="bg-[#1B4079] hover:bg-[#4D7C8A]">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Clase
            </Button>
          )}
        </div>
      </div>

      {/* Leyenda de grupos */}
      {getUniqueGroups().length > 1 && !selectedGroup && (
        <div className="mb-4 flex flex-wrap gap-2">
          {getUniqueGroups().map(g => (
            <span key={g.id} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              <Users className="w-3 h-3 inline mr-1" />
              {g.name}
            </span>
          ))}
        </div>
      )}

      {/* Horario Grid */}
      {schedules.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay horarios configurados</p>
          {isAdmin && (
            <Button onClick={() => setShowModal(true)} className="mt-4 bg-[#1B4079] hover:bg-[#4D7C8A]">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Horario
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left text-sm font-semibold text-gray-600 w-20">Hora</th>
                  {DAYS.map(day => (
                    <th key={day.value} className="p-3 text-center text-sm font-semibold text-gray-600">
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time, idx) => (
                  <tr key={time} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="p-2 text-sm text-gray-500 font-medium border-r border-gray-100">
                      {time}
                    </td>
                    {DAYS.map(day => {
                      const schedule = getScheduleForSlot(day.value, time);
                      const isStart = schedule?.startTime === time;
                      
                      if (schedule && !isStart) {
                        return <td key={day.value} className="border-r border-gray-100"></td>;
                      }
                      
                      if (schedule && isStart) {
                        const slots = TIME_SLOTS.filter(t => t >= schedule.startTime && t < schedule.endTime).length;
                        return (
                          <td 
                            key={day.value} 
                            rowSpan={slots}
                            className="p-1 border-r border-gray-100 align-top"
                          >
                            <div 
                              className="h-full p-2 rounded-lg text-white text-xs relative group"
                              style={{ backgroundColor: schedule.subject.color }}
                            >
                              <p className="font-semibold truncate">{schedule.subject.name}</p>
                              <p className="opacity-80 truncate">
                                <GraduationCap className="w-3 h-3 inline mr-1" />
                                {schedule.teacher.name}
                              </p>
                              {schedule.classroom && (
                                <p className="opacity-80 truncate">
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {schedule.classroom}
                                </p>
                              )}
                              <p className="opacity-60 text-[10px] mt-1">
                                {schedule.startTime} - {schedule.endTime}
                              </p>
                              {selectedGroup && (
                                <p className="opacity-60 text-[10px]">
                                  {schedule.group.name}
                                </p>
                              )}
                              {/* Delete button for admin */}
                              {isAdmin && (
                                <button
                                  onClick={() => deleteSchedule(schedule.id)}
                                  className="absolute top-1 right-1 p-1 bg-white/20 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      }
                      
                      return (
                        <td key={day.value} className="p-1 border-r border-gray-100">
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setForm({ ...form, dayOfWeek: day.value, startTime: time, endTime: TIME_SLOTS[idx + 1] || "16:00" });
                                setShowModal(true);
                              }}
                              className="w-full h-12 rounded hover:bg-[#1B4079]/5 transition-colors flex items-center justify-center text-gray-300 hover:text-[#1B4079]"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para crear horario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-5 border-b">
              <h3 className="text-lg font-semibold">Nueva Clase</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materia *</label>
                <select
                  value={form.subjectId}
                  onChange={e => setForm({ ...form, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="">Seleccionar materia</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grupo *</label>
                <select
                  value={form.groupId}
                  onChange={e => setForm({ ...form, groupId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="">Seleccionar grupo</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profesor *</label>
                <select
                  value={form.teacherId}
                  onChange={e => setForm({ ...form, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="">Seleccionar profesor</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
                  <select
                    value={form.dayOfWeek}
                    onChange={e => setForm({ ...form, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    {DAYS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salón</label>
                  <Input
                    value={form.classroom}
                    onChange={e => setForm({ ...form, classroom: e.target.value })}
                    placeholder="Ej: Salón 101"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                  <Input
                    type="time"
                    value={form.endTime}
                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={createSchedule} className="flex-1 bg-[#1B4079] hover:bg-[#4D7C8A]">
                Crear Clase
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
