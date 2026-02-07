"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, Plus, Search, Filter, Trash2, Edit, Users, 
  Percent, DollarSign, Calendar, Award, Loader2, CheckCircle,
  AlertCircle, Clock, ChevronDown, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";

interface Scholarship {
  id: string;
  name: string;
  type: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  applyTo: string;
  minGPA: number | null;
  requirements: string | null;
  maxBeneficiaries: number | null;
  status: string;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  _count: { students: number };
  createdBy: { id: string; name: string };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  group: { name: string } | null;
  scholarships: Array<{
    scholarship: { name: string };
    status: string;
  }>;
}

const scholarshipTypes = [
  { value: "ACADEMICA", label: "Beca Académica", icon: "🎓" },
  { value: "DEPORTIVA", label: "Beca Deportiva", icon: "⚽" },
  { value: "DESCUENTO_HERMANOS", label: "Descuento Hermanos", icon: "👨‍👩‍👧‍👦" },
  { value: "DESCUENTO_PRONTO_PAGO", label: "Pronto Pago", icon: "⏰" },
  { value: "DESCUENTO_ANUAL", label: "Pago Anual", icon: "📅" },
];

const discountTypes = [
  { value: "PERCENTAGE", label: "Porcentaje (%)", icon: Percent },
  { value: "FIXED", label: "Monto Fijo ($)", icon: DollarSign },
];

const applyToOptions = [
  { value: "COLEGIATURA", label: "Colegiatura" },
  { value: "INSCRIPCION", label: "Inscripción" },
  { value: "MATERIALES", label: "Materiales" },
  { value: "TODO", label: "Todo" },
];

export default function ScholarshipsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const user = session?.user as any;

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"types" | "assign">("types");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    type: "ACADEMICA",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 10,
    applyTo: "COLEGIATURA",
    minGPA: "",
    requirements: "",
    maxBeneficiaries: "",
    validFrom: "",
    validUntil: "",
  });

  useEffect(() => {
    if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchScholarships();
    fetchStudents();
  }, [user]);

  const fetchScholarships = async () => {
    try {
      const res = await fetch("/api/scholarships");
      if (res.ok) {
        const data = await res.json();
        setScholarships(data);
      }
    } catch (error) {
      toast.error("Error al cargar becas");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/students?includeScholarships=true");
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleCreateScholarship = async () => {
    if (!form.name || form.discountValue <= 0) {
      toast.error("Nombre y valor de descuento son requeridos");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          minGPA: form.minGPA ? parseFloat(form.minGPA) : null,
          maxBeneficiaries: form.maxBeneficiaries ? parseInt(form.maxBeneficiaries) : null,
          validFrom: form.validFrom || null,
          validUntil: form.validUntil || null,
        }),
      });

      if (res.ok) {
        toast.success("Beca creada exitosamente");
        setShowCreateModal(false);
        resetForm();
        fetchScholarships();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al crear beca");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignScholarship = async () => {
    if (!selectedScholarship || selectedStudents.length === 0) {
      toast.error("Selecciona al menos un estudiante");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/scholarships/${selectedScholarship.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selectedStudents }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Beca asignada a ${data.assigned} estudiante(s)`);
        setShowAssignModal(false);
        setSelectedStudents([]);
        setSelectedScholarship(null);
        fetchScholarships();
        fetchStudents();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al asignar beca");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScholarship = async (id: string) => {
    if (!confirm("¿Eliminar esta beca? Se quitará de todos los estudiantes.")) return;

    try {
      const res = await fetch(`/api/scholarships/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Beca eliminada");
        fetchScholarships();
      } else {
        toast.error("Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const resetForm = () => {
    setForm({
      name: "", type: "ACADEMICA", description: "", discountType: "PERCENTAGE",
      discountValue: 10, applyTo: "COLEGIATURA", minGPA: "", requirements: "",
      maxBeneficiaries: "", validFrom: "", validUntil: "",
    });
  };

  const filteredScholarships = scholarships.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || s.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeInfo = (type: string) => scholarshipTypes.find(t => t.value === type) || { label: type, icon: "🎓" };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVA: "bg-green-100 text-green-700",
      INACTIVA: "bg-gray-100 text-gray-700",
      VENCIDA: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

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
            <GraduationCap className="h-7 w-7 text-[#1B4079]" />
            Becas y Descuentos
          </h1>
          <p className="text-gray-600 mt-1">Gestiona becas académicas, deportivas y descuentos automáticos</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-[#1B4079] hover:bg-[#15325f]">
          <Plus className="h-4 w-4 mr-2" /> Nueva Beca
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Becas</p>
              <p className="text-xl font-bold text-gray-900">{scholarships.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activas</p>
              <p className="text-xl font-bold text-gray-900">
                {scholarships.filter(s => s.status === "ACTIVA").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Estudiantes Beneficiados</p>
              <p className="text-xl font-bold text-gray-900">
                {scholarships.reduce((acc, s) => acc + s._count.students, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Percent className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Desc. Promedio</p>
              <p className="text-xl font-bold text-gray-900">
                {scholarships.length > 0 
                  ? Math.round(scholarships.filter(s => s.discountType === "PERCENTAGE").reduce((acc, s) => acc + s.discountValue, 0) / Math.max(1, scholarships.filter(s => s.discountType === "PERCENTAGE").length))
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("types")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "types" ? "border-[#1B4079] text-[#1B4079]" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Tipos de Becas
        </button>
        <button
          onClick={() => setActiveTab("assign")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "assign" ? "border-[#1B4079] text-[#1B4079]" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Estudiantes con Beca
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar becas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-white text-sm"
        >
          <option value="">Todos los tipos</option>
          {scholarshipTypes.map(t => (
            <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
          ))}
        </select>
      </div>

      {/* Content based on active tab */}
      {activeTab === "types" ? (
        <div className="grid gap-4">
          {filteredScholarships.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <GraduationCap className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No hay becas configuradas</p>
              <Button onClick={() => setShowCreateModal(true)} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" /> Crear primera beca
              </Button>
            </div>
          ) : (
            filteredScholarships.map((scholarship) => {
              const typeInfo = getTypeInfo(scholarship.type);
              return (
                <div key={scholarship.id} className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{typeInfo.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{scholarship.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(scholarship.status)}`}>
                            {scholarship.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{typeInfo.label}</p>
                        {scholarship.description && (
                          <p className="text-sm text-gray-600 mt-2">{scholarship.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-3 text-sm">
                          <span className="flex items-center gap-1 text-[#1B4079] font-medium">
                            {scholarship.discountType === "PERCENTAGE" ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                            {scholarship.discountValue}{scholarship.discountType === "PERCENTAGE" ? "%" : " MXN"}
                          </span>
                          <span className="flex items-center gap-1 text-gray-600">
                            <Users className="h-4 w-4" />
                            {scholarship._count.students} beneficiarios
                          </span>
                          {scholarship.validUntil && (
                            <span className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              Hasta {new Date(scholarship.validUntil).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedScholarship(scholarship);
                          setShowAssignModal(true);
                        }}
                      >
                        <Users className="h-4 w-4 mr-1" /> Asignar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteScholarship(scholarship.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Students with scholarships tab */
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estudiante</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Grupo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Becas Asignadas</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.filter(s => s.scholarships && s.scholarships.length > 0).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                    No hay estudiantes con becas asignadas
                  </td>
                </tr>
              ) : (
                students
                  .filter(s => s.scholarships && s.scholarships.length > 0)
                  .map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {student.group?.name || "Sin grupo"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {student.scholarships.map((ss, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {ss.scholarship.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(student.scholarships[0]?.status || "ACTIVA")}`}>
                          {student.scholarships[0]?.status || "ACTIVA"}
                        </span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nueva Beca / Descuento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Beca Excelencia Académica"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {scholarshipTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Descuento *</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {discountTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor * {form.discountType === "PERCENTAGE" ? "(%)" : "(MXN)"}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aplica a</label>
                <select
                  value={form.applyTo}
                  onChange={(e) => setForm({ ...form, applyTo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {applyToOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción de la beca y requisitos..."
                  className="w-full px-3 py-2 border rounded-lg resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promedio Mínimo</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={form.minGPA}
                    onChange={(e) => setForm({ ...form, minGPA: e.target.value })}
                    placeholder="Ej: 9.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Máx. Beneficiarios</label>
                  <Input
                    type="number"
                    min="1"
                    value={form.maxBeneficiaries}
                    onChange={(e) => setForm({ ...form, maxBeneficiaries: e.target.value })}
                    placeholder="Sin límite"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Válida desde</label>
                  <Input
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Válida hasta</label>
                  <Input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleCreateScholarship} disabled={saving} className="flex-1 bg-[#1B4079] hover:bg-[#15325f]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Crear Beca
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedScholarship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Asignar Beca</h2>
            <p className="text-gray-600 mb-4">
              <span className="font-medium">{selectedScholarship.name}</span> - 
              {selectedScholarship.discountValue}{selectedScholarship.discountType === "PERCENTAGE" ? "%" : " MXN"}
            </p>

            <div className="mb-4">
              <Input
                placeholder="Buscar estudiante..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
              />
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
              {students
                .filter(s => {
                  const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
                  const hasThisScholarship = s.scholarships?.some(
                    ss => ss.scholarship.name === selectedScholarship.name
                  );
                  return fullName.includes(searchTerm.toLowerCase()) && !hasThisScholarship;
                })
                .map((student) => (
                  <label
                    key={student.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, student.id]);
                        } else {
                          setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <div>
                      <span className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {student.group?.name || "Sin grupo"}
                      </span>
                    </div>
                  </label>
                ))}
            </div>

            {selectedStudents.length > 0 && (
              <p className="text-sm text-[#1B4079] mt-3">
                {selectedStudents.length} estudiante(s) seleccionado(s)
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedScholarship(null);
                  setSelectedStudents([]);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAssignScholarship}
                disabled={saving || selectedStudents.length === 0}
                className="flex-1 bg-[#1B4079] hover:bg-[#15325f]"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Asignar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
