"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Calendar, Plus, Trash2, Edit, Loader2, CheckCircle, Clock,
  Play, Archive, DollarSign, Users, Settings, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SchoolCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  isCurrentCycle: boolean;
  inscriptionStart: string | null;
  inscriptionEnd: string | null;
  classesStart: string | null;
  classesEnd: string | null;
  inscriptionFee: number | null;
  monthlyTuition: number | null;
  materialsFee: number | null;
  autoPromotionEnabled: boolean;
  promotionMinGPA: number | null;
  _count: {
    enrollments: number;
    charges: number;
  };
}

const statusOptions = [
  { value: "UPCOMING", label: "Próximo", icon: Clock, color: "bg-blue-100 text-blue-700" },
  { value: "ACTIVE", label: "Activo", icon: Play, color: "bg-green-100 text-green-700" },
  { value: "COMPLETED", label: "Finalizado", icon: CheckCircle, color: "bg-gray-100 text-gray-700" },
  { value: "ARCHIVED", label: "Archivado", icon: Archive, color: "bg-amber-100 text-amber-700" },
];

export default function CyclesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  const [cycles, setCycles] = useState<SchoolCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState<SchoolCycle | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    inscriptionStart: "",
    inscriptionEnd: "",
    classesStart: "",
    classesEnd: "",
    inscriptionFee: "",
    monthlyTuition: "",
    materialsFee: "",
    autoPromotionEnabled: false,
    promotionMinGPA: "",
  });

  useEffect(() => {
    if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchCycles();
  }, [user]);

  const fetchCycles = async () => {
    try {
      const res = await fetch("/api/admin/cycles");
      if (res.ok) {
        const data = await res.json();
        setCycles(data);
      }
    } catch (error) {
      toast.error("Error al cargar ciclos");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.startDate || !form.endDate) {
      toast.error("Nombre y fechas son requeridas");
      return;
    }

    setSaving(true);
    try {
      const url = editingCycle
        ? `/api/admin/cycles/${editingCycle.id}`
        : "/api/admin/cycles";
      const method = editingCycle ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          inscriptionFee: form.inscriptionFee ? parseFloat(form.inscriptionFee) : null,
          monthlyTuition: form.monthlyTuition ? parseFloat(form.monthlyTuition) : null,
          materialsFee: form.materialsFee ? parseFloat(form.materialsFee) : null,
          promotionMinGPA: form.promotionMinGPA ? parseFloat(form.promotionMinGPA) : null,
        }),
      });

      if (res.ok) {
        toast.success(editingCycle ? "Ciclo actualizado" : "Ciclo creado");
        setShowModal(false);
        resetForm();
        fetchCycles();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id: string) => {
    if (!confirm("¿Activar este ciclo como ciclo actual? Los demás ciclos activos pasarán a completados.")) return;

    try {
      const res = await fetch(`/api/admin/cycles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });

      if (res.ok) {
        toast.success("Ciclo activado");
        fetchCycles();
      } else {
        toast.error("Error al activar ciclo");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este ciclo? Esta acción no se puede deshacer.")) return;

    try {
      const res = await fetch(`/api/admin/cycles/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Ciclo eliminado");
        fetchCycles();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const openEditModal = (cycle: SchoolCycle) => {
    setEditingCycle(cycle);
    setForm({
      name: cycle.name,
      startDate: cycle.startDate.split("T")[0],
      endDate: cycle.endDate.split("T")[0],
      inscriptionStart: cycle.inscriptionStart?.split("T")[0] || "",
      inscriptionEnd: cycle.inscriptionEnd?.split("T")[0] || "",
      classesStart: cycle.classesStart?.split("T")[0] || "",
      classesEnd: cycle.classesEnd?.split("T")[0] || "",
      inscriptionFee: cycle.inscriptionFee?.toString() || "",
      monthlyTuition: cycle.monthlyTuition?.toString() || "",
      materialsFee: cycle.materialsFee?.toString() || "",
      autoPromotionEnabled: cycle.autoPromotionEnabled,
      promotionMinGPA: cycle.promotionMinGPA?.toString() || "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCycle(null);
    setForm({
      name: "", startDate: "", endDate: "", inscriptionStart: "", inscriptionEnd: "",
      classesStart: "", classesEnd: "", inscriptionFee: "", monthlyTuition: "",
      materialsFee: "", autoPromotionEnabled: false, promotionMinGPA: "",
    });
  };

  const getStatusInfo = (status: string) =>
    statusOptions.find((s) => s.value === status) || statusOptions[0];

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

  const formatCurrency = (amount: number | null) =>
    amount ? `$${amount.toLocaleString("es-MX")} MXN` : "-";

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
            <Calendar className="h-7 w-7 text-[#1B4079]" />
            Ciclos Escolares
          </h1>
          <p className="text-gray-600 mt-1">Gestiona los ciclos académicos, inscripciones y promociones</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-[#1B4079] hover:bg-[#15325f]">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Ciclo
        </Button>
      </div>

      {/* Current Cycle Alert */}
      {cycles.find(c => c.isCurrentCycle) && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Ciclo Actual: {cycles.find(c => c.isCurrentCycle)?.name}</p>
            <p className="text-sm text-green-600">
              {formatDate(cycles.find(c => c.isCurrentCycle)?.startDate || "")} - {formatDate(cycles.find(c => c.isCurrentCycle)?.endDate || "")}
            </p>
          </div>
        </div>
      )}

      {/* Cycles List */}
      <div className="space-y-4">
        {cycles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No hay ciclos escolares configurados</p>
            <Button onClick={() => setShowModal(true)} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" /> Crear primer ciclo
            </Button>
          </div>
        ) : (
          cycles.map((cycle) => {
            const statusInfo = getStatusInfo(cycle.status);
            const StatusIcon = statusInfo.icon;
            return (
              <div
                key={cycle.id}
                className={`bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow ${
                  cycle.isCurrentCycle ? "ring-2 ring-green-500" : ""
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{cycle.name}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </span>
                      {cycle.isCurrentCycle && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full">ACTUAL</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-500">Período</p>
                        <p className="font-medium">{formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Inscripciones</p>
                        <p className="font-medium flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {cycle._count.enrollments}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Colegiatura Mensual</p>
                        <p className="font-medium flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          {formatCurrency(cycle.monthlyTuition)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Cargos Generados</p>
                        <p className="font-medium">{cycle._count.charges}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {cycle.status === "UPCOMING" && (
                      <Button variant="outline" size="sm" onClick={() => handleActivate(cycle.id)}>
                        <Play className="h-4 w-4 mr-1" /> Activar
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openEditModal(cycle)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cycle.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={cycle._count.enrollments > 0 || cycle._count.charges > 0}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCycle ? "Editar Ciclo Escolar" : "Nuevo Ciclo Escolar"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Ciclo *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: 2026-2027"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio *</label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin *</label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-3">Fechas de Inscripción y Clases</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inicio Inscripciones</label>
                    <Input
                      type="date"
                      value={form.inscriptionStart}
                      onChange={(e) => setForm({ ...form, inscriptionStart: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fin Inscripciones</label>
                    <Input
                      type="date"
                      value={form.inscriptionEnd}
                      onChange={(e) => setForm({ ...form, inscriptionEnd: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inicio de Clases</label>
                    <Input
                      type="date"
                      value={form.classesStart}
                      onChange={(e) => setForm({ ...form, classesStart: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fin de Clases</label>
                    <Input
                      type="date"
                      value={form.classesEnd}
                      onChange={(e) => setForm({ ...form, classesEnd: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-3">Configuración Financiera</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inscripción (MXN)</label>
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      value={form.inscriptionFee}
                      onChange={(e) => setForm({ ...form, inscriptionFee: e.target.value })}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Colegiatura Mensual</label>
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      value={form.monthlyTuition}
                      onChange={(e) => setForm({ ...form, monthlyTuition: e.target.value })}
                      placeholder="3500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Materiales</label>
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      value={form.materialsFee}
                      onChange={(e) => setForm({ ...form, materialsFee: e.target.value })}
                      placeholder="2000"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-3">Promoción Automática</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.autoPromotionEnabled}
                    onChange={(e) => setForm({ ...form, autoPromotionEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-[#1B4079]"
                  />
                  <span className="text-sm text-gray-700">Promover automáticamente al siguiente grado al finalizar el ciclo</span>
                </label>
                {form.autoPromotionEnabled && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Promedio mínimo para promoción</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={form.promotionMinGPA}
                      onChange={(e) => setForm({ ...form, promotionMinGPA: e.target.value })}
                      placeholder="6.0"
                      className="max-w-[150px]"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#1B4079] hover:bg-[#15325f]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                {editingCycle ? "Guardar Cambios" : "Crear Ciclo"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
