"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users, Plus, Search, Trash2, Edit, Loader2, CheckCircle,
  Shield, Eye, EyeOff, UserPlus, Car, MessageCircle, Bell,
  DollarSign, GraduationCap, Clock, AlertCircle, UserCog
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Tutor {
  id: string;
  relationship: string;
  relationshipDetail: string | null;
  isPrimaryContact: boolean;
  hasFullAccess: boolean;
  canViewGrades: boolean;
  canViewAttendance: boolean;
  canViewPayments: boolean;
  canMakePayments: boolean;
  canPickup: boolean;
  canCommunicate: boolean;
  canReceiveNotifications: boolean;
  canRequestPermissions: boolean;
  custodyType: string | null;
  custodyNotes: string | null;
  isActive: boolean;
  tutor: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  group: { id: string; name: string } | null;
  tutors: Tutor[];
}

interface ParentUser {
  id: string;
  name: string;
  email: string;
}

const relationshipOptions = [
  { value: "PARENT", label: "Padre/Madre" },
  { value: "STEPPARENT", label: "Padrastro/Madrastra" },
  { value: "GRANDPARENT", label: "Abuelo/Abuela" },
  { value: "LEGAL_GUARDIAN", label: "Tutor Legal" },
  { value: "RELATIVE", label: "Otro Familiar" },
  { value: "OTHER", label: "Otro" },
];

const custodyOptions = [
  { value: "", label: "No especificado" },
  { value: "FULL", label: "Custodia Total" },
  { value: "SHARED", label: "Custodia Compartida" },
  { value: "VISITATION", label: "Solo Visitas" },
  { value: "RESTRICTED", label: "Restringida" },
];

export default function TutorsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<ParentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    tutorId: "",
    relationship: "PARENT",
    relationshipDetail: "",
    isPrimaryContact: false,
    hasFullAccess: true,
    canViewGrades: true,
    canViewAttendance: true,
    canViewPayments: true,
    canMakePayments: true,
    canPickup: true,
    canCommunicate: true,
    canReceiveNotifications: true,
    canRequestPermissions: true,
    custodyType: "",
    custodyNotes: "",
  });

  useEffect(() => {
    if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [studentsRes, allStudentsRes] = await Promise.all([
        fetch("/api/admin/tutors"),
        fetch("/api/admin/students?limit=100"),
      ]);

      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data);
      }

      if (allStudentsRes.ok) {
        const data = await allStudentsRes.json();
        // Extraer padres únicos de los estudiantes
        const uniqueParents = new Map();
        (data.students || []).forEach((s: any) => {
          s.parents?.forEach((p: any) => {
            if (p.parent && !uniqueParents.has(p.parent.id)) {
              uniqueParents.set(p.parent.id, p.parent);
            }
          });
        });
        setParents(Array.from(uniqueParents.values()));
      }
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTutor = async () => {
    if (!selectedStudent || !form.tutorId) {
      toast.error("Selecciona un estudiante y tutor");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/tutors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          ...form,
          custodyType: form.custodyType || null,
        }),
      });

      if (res.ok) {
        toast.success("Tutor agregado exitosamente");
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al agregar tutor");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedTutor) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tutors/${selectedTutor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Permisos actualizados");
        setShowPermissionsModal(false);
        fetchData();
      } else {
        toast.error("Error al actualizar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTutor = async (id: string) => {
    if (!confirm("¿Eliminar esta relación tutor-estudiante?")) return;

    try {
      const res = await fetch(`/api/admin/tutors/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Relación eliminada");
        fetchData();
      } else {
        toast.error("Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const openPermissionsModal = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setForm({
      tutorId: tutor.tutor.id,
      relationship: tutor.relationship,
      relationshipDetail: tutor.relationshipDetail || "",
      isPrimaryContact: tutor.isPrimaryContact,
      hasFullAccess: tutor.hasFullAccess,
      canViewGrades: tutor.canViewGrades,
      canViewAttendance: tutor.canViewAttendance,
      canViewPayments: tutor.canViewPayments,
      canMakePayments: tutor.canMakePayments,
      canPickup: tutor.canPickup,
      canCommunicate: tutor.canCommunicate,
      canReceiveNotifications: tutor.canReceiveNotifications,
      canRequestPermissions: tutor.canRequestPermissions,
      custodyType: tutor.custodyType || "",
      custodyNotes: tutor.custodyNotes || "",
    });
    setShowPermissionsModal(true);
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setSelectedTutor(null);
    setForm({
      tutorId: "", relationship: "PARENT", relationshipDetail: "", isPrimaryContact: false,
      hasFullAccess: true, canViewGrades: true, canViewAttendance: true, canViewPayments: true,
      canMakePayments: true, canPickup: true, canCommunicate: true, canReceiveNotifications: true,
      canRequestPermissions: true, custodyType: "", custodyNotes: "",
    });
  };

  const getRelationshipLabel = (value: string) =>
    relationshipOptions.find((r) => r.value === value)?.label || value;

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCog className="h-7 w-7 text-[#1B4079]" />
            Multi-Tutor
          </h1>
          <p className="text-gray-600 mt-1">Gestiona múltiples tutores por estudiante (padres divorciados, custodias)</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-[#1B4079] hover:bg-[#15325f]">
          <UserPlus className="h-4 w-4 mr-2" /> Agregar Tutor
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Soporte para Custodia Compartida</p>
            <p className="text-sm text-blue-600 mt-1">
              Configura permisos granulares para cada tutor: quién puede ver calificaciones, 
              hacer pagos, recoger al niño, recibir notificaciones, etc.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar estudiante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Students with Tutors */}
      <div className="space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No hay estudiantes con múltiples tutores configurados</p>
            <Button onClick={() => setShowModal(true)} variant="outline" className="mt-4">
              <UserPlus className="h-4 w-4 mr-2" /> Configurar primer tutor adicional
            </Button>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{student.group?.name || "Sin grupo"}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSelectedStudent(student); setShowModal(true); }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Agregar Tutor
                </Button>
              </div>

              <div className="space-y-3">
                {student.tutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      tutor.isPrimaryContact ? "bg-green-50 border-green-200" : "bg-gray-50"
                    } ${!tutor.isActive ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#1B4079] text-white flex items-center justify-center font-medium">
                        {tutor.tutor.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{tutor.tutor.name}</span>
                          {tutor.isPrimaryContact && (
                            <span className="px-1.5 py-0.5 bg-green-500 text-white text-xs rounded">Principal</span>
                          )}
                          {tutor.custodyType && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                              {custodyOptions.find(c => c.value === tutor.custodyType)?.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {getRelationshipLabel(tutor.relationship)}
                          {tutor.relationshipDetail && ` - ${tutor.relationshipDetail}`}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {tutor.canViewGrades && <GraduationCap className="h-3.5 w-3.5 text-gray-400" />}
                          {tutor.canViewPayments && <DollarSign className="h-3.5 w-3.5 text-gray-400" />}
                          {tutor.canPickup && <Car className="h-3.5 w-3.5 text-gray-400" />}
                          {tutor.canCommunicate && <MessageCircle className="h-3.5 w-3.5 text-gray-400" />}
                          {tutor.canReceiveNotifications && <Bell className="h-3.5 w-3.5 text-gray-400" />}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openPermissionsModal(tutor)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTutor(tutor.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Tutor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Agregar Tutor</h2>

            {!selectedStudent && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante *</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={(e) => {
                    const student = students.find(s => s.id === e.target.value) || 
                      // Buscar en todos los estudiantes si no está en la lista filtrada
                      null;
                    setSelectedStudent(student);
                  }}
                >
                  <option value="">Seleccionar estudiante</option>
                  {/* Aquí deberíamos tener todos los estudiantes */}
                </select>
                <p className="text-xs text-gray-500 mt-1">Selecciona desde la lista de estudiantes con tutores existentes</p>
              </div>
            )}

            {selectedStudent && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Estudiante:</p>
                <p className="font-medium">{selectedStudent.firstName} {selectedStudent.lastName}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tutor (Padre) *</label>
                <select
                  value={form.tutorId}
                  onChange={(e) => setForm({ ...form, tutorId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Seleccionar tutor</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relación</label>
                  <select
                    value={form.relationship}
                    onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {relationshipOptions.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detalle</label>
                  <Input
                    value={form.relationshipDetail}
                    onChange={(e) => setForm({ ...form, relationshipDetail: e.target.value })}
                    placeholder="Ej: Madre, Padre"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Custodia</label>
                <select
                  value={form.custodyType}
                  onChange={(e) => setForm({ ...form, custodyType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {custodyOptions.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPrimaryContact}
                  onChange={(e) => setForm({ ...form, isPrimaryContact: e.target.checked })}
                  className="rounded border-gray-300 text-[#1B4079]"
                />
                <span className="text-sm">Contacto Principal</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasFullAccess}
                  onChange={(e) => setForm({ ...form, hasFullAccess: e.target.checked })}
                  className="rounded border-gray-300 text-[#1B4079]"
                />
                <span className="text-sm">Acceso Completo (todos los permisos)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleAddTutor} disabled={saving || !form.tutorId} className="flex-1 bg-[#1B4079] hover:bg-[#15325f]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Agregar Tutor
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedTutor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Editar Permisos</h2>
            <p className="text-gray-600 mb-4">{selectedTutor.tutor.name}</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relación</label>
                  <select
                    value={form.relationship}
                    onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {relationshipOptions.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custodia</label>
                  <select
                    value={form.custodyType}
                    onChange={(e) => setForm({ ...form, custodyType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {custodyOptions.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas de Custodia</label>
                <textarea
                  value={form.custodyNotes}
                  onChange={(e) => setForm({ ...form, custodyNotes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg resize-none h-20"
                  placeholder="Notas sobre acuerdos de custodia, restricciones, etc."
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Permisos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "isPrimaryContact", label: "Contacto Principal", icon: Shield },
                    { key: "hasFullAccess", label: "Acceso Completo", icon: Eye },
                    { key: "canViewGrades", label: "Ver Calificaciones", icon: GraduationCap },
                    { key: "canViewAttendance", label: "Ver Asistencia", icon: Clock },
                    { key: "canViewPayments", label: "Ver Pagos", icon: Eye },
                    { key: "canMakePayments", label: "Realizar Pagos", icon: DollarSign },
                    { key: "canPickup", label: "Puede Recoger", icon: Car },
                    { key: "canCommunicate", label: "Comunicarse", icon: MessageCircle },
                    { key: "canReceiveNotifications", label: "Notificaciones", icon: Bell },
                    { key: "canRequestPermissions", label: "Solicitar Permisos", icon: Shield },
                  ].map(({ key, label, icon: Icon }) => (
                    <label key={key} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(form as any)[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                        className="rounded border-gray-300 text-[#1B4079]"
                      />
                      <Icon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowPermissionsModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleUpdatePermissions} disabled={saving} className="flex-1 bg-[#1B4079] hover:bg-[#15325f]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
