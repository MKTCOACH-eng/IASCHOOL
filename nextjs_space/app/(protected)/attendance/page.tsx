"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Check,
  X,
  Clock,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface Group {
  id: string;
  name: string;
  students?: Student[];
}

interface Attendance {
  id: string;
  date: string;
  status: "PRESENTE" | "AUSENTE" | "TARDANZA" | "JUSTIFICADO";
  notes?: string;
  student: { id: string; firstName: string; lastName: string };
  group: { id: string; name: string };
}

const STATUS_CONFIG = {
  PRESENTE: { icon: Check, color: "bg-green-100 text-green-700", label: "Presente" },
  AUSENTE: { icon: X, color: "bg-red-100 text-red-700", label: "Ausente" },
  TARDANZA: { icon: Clock, color: "bg-yellow-100 text-yellow-700", label: "Tardanza" },
  JUSTIFICADO: { icon: FileText, color: "bg-blue-100 text-blue-700", label: "Justificado" },
};

export default function AttendancePage() {
  const { data: session } = useSession() || {};
  const user = session?.user as { role?: string } | undefined;
  const isTeacher = user?.role === "PROFESOR";
  const isAdmin = user?.role === "ADMIN";
  const canEdit = isTeacher || isAdmin;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Para edición (profesor)
  const [editDate, setEditDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [editMode, setEditMode] = useState(false);
  const [studentAttendances, setStudentAttendances] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup || !canEdit) {
      fetchAttendances();
    }
  }, [selectedGroup, currentMonth, canEdit]);

  async function fetchGroups() {
    try {
      const res = await fetch("/api/groups?includeStudents=true");
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
        if (data.length > 0 && canEdit) {
          setSelectedGroup(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendances() {
    try {
      const monthStr = format(currentMonth, "yyyy-MM");
      let url = `/api/attendance?month=${monthStr}`;
      if (selectedGroup) url += `&groupId=${selectedGroup}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAttendances(data);
      }
    } catch (error) {
      console.error("Error fetching attendances:", error);
    }
  }

  async function saveAttendance() {
    if (!selectedGroup || !editDate) return;

    setSaving(true);
    try {
      const attendanceData = Object.entries(studentAttendances).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: selectedGroup,
          date: editDate,
          attendances: attendanceData,
        }),
      });

      if (res.ok) {
        toast.success("Asistencia guardada");
        setEditMode(false);
        fetchAttendances();
      } else {
        toast.error("Error al guardar");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  function startEditing() {
    const group = groups.find((g) => g.id === selectedGroup);
    if (!group?.students) return;

    // Obtener asistencias existentes para la fecha
    const existingForDate = attendances.filter(
      (a) => a.date.split("T")[0] === editDate
    );

    const initial: Record<string, string> = {};
    group.students.forEach((s) => {
      const existing = existingForDate.find((a) => a.student.id === s.id);
      initial[s.id] = existing?.status || "PRESENTE";
    });

    setStudentAttendances(initial);
    setEditMode(true);
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const selectedGroupData = groups.find((g) => g.id === selectedGroup);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asistencia</h1>
          <p className="text-gray-500">
            {canEdit ? "Registra y consulta la asistencia" : "Consulta la asistencia de tus hijos"}
          </p>
        </div>
      </div>

      {/* Filtros */}
      {canEdit && groups.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Grupo</label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Fecha</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                />
              </div>

              {!editMode ? (
                <Button onClick={startEditing} disabled={!selectedGroup}>
                  <Users className="h-4 w-4 mr-2" />
                  Registrar Asistencia
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveAttendance} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modo edición - Lista de estudiantes */}
      {editMode && selectedGroupData?.students && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Asistencia del {format(parseISO(editDate), "EEEE d 'de' MMMM", { locale: es })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedGroupData.students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">
                    {student.lastName}, {student.firstName}
                  </span>
                  <div className="flex gap-2">
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                      const Icon = config.icon;
                      const isSelected = studentAttendances[student.id] === status;
                      return (
                        <button
                          key={status}
                          onClick={() => setStudentAttendances((prev) => ({ ...prev, [student.id]: status }))}
                          className={`p-2 rounded-lg transition-colors ${
                            isSelected ? config.color : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                          title={config.label}
                        >
                          <Icon className="h-5 w-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendario mensual */}
      {!editMode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {format(currentMonth, "MMMM yyyy", { locale: es })}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Leyenda */}
            <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b">
              {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                const Icon = config.icon;
                return (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`p-1 rounded ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm">{config.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Grid del calendario */}
            <div className="grid grid-cols-7 gap-1">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              
              {/* Espacios vacíos al inicio */}
              {Array.from({ length: (startOfMonth(currentMonth).getDay() + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              
              {days.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayAttendances = attendances.filter((a) => a.date.split("T")[0] === dateStr);
                const isCurrentDay = isToday(day);
                
                return (
                  <div
                    key={dateStr}
                    className={`min-h-[80px] p-1 border rounded-lg ${
                      isCurrentDay ? "border-[#1B4079] bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      {format(day, "d")}
                    </div>
                    <div className="flex flex-wrap gap-0.5">
                      {dayAttendances.slice(0, 6).map((att) => {
                        const config = STATUS_CONFIG[att.status];
                        const Icon = config.icon;
                        return (
                          <div
                            key={att.id}
                            className={`p-0.5 rounded ${config.color}`}
                            title={`${att.student.firstName} ${att.student.lastName}: ${config.label}`}
                          >
                            <Icon className="h-3 w-3" />
                          </div>
                        );
                      })}
                      {dayAttendances.length > 6 && (
                        <span className="text-xs text-gray-500">+{dayAttendances.length - 6}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial (para padres) */}
      {!canEdit && attendances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attendances.map((att) => {
                const config = STATUS_CONFIG[att.status];
                const Icon = config.icon;
                return (
                  <div key={att.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {att.student.firstName} {att.student.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(att.date), "EEEE d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                    <Badge className={config.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
