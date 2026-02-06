"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  format,
  parseISO,
  isPast,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  Wallet,
  Plus,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  X,
  Filter,
  CreditCard,
  Receipt,
  TrendingUp,
  Users,
  Building2,
  Copy,
  Banknote,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  notes: string | null;
  paidAt: string;
  recordedBy: { name: string };
}

interface Charge {
  id: string;
  concept: string;
  type: string;
  amount: number;
  amountPaid: number;
  status: string;
  dueDate: string;
  periodMonth: number | null;
  periodYear: number | null;
  notes: string | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    group: { name: string } | null;
  };
  payments: Payment[];
  createdBy: { name: string };
  _count: { payments: number };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  group: { name: string } | null;
}

const CHARGE_TYPES = [
  { value: "COLEGIATURA", label: "Colegiatura", color: "#1B4079" },
  { value: "INSCRIPCION", label: "Inscripción", color: "#7C3AED" },
  { value: "MATERIAL", label: "Material", color: "#059669" },
  { value: "UNIFORME", label: "Uniforme", color: "#EA580C" },
  { value: "EVENTO", label: "Evento", color: "#DC2626" },
  { value: "TRANSPORTE", label: "Transporte", color: "#0891B2" },
  { value: "COMEDOR", label: "Comedor", color: "#84CC16" },
  { value: "OTRO", label: "Otro", color: "#6B7280" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDIENTE: { label: "Pendiente", color: "text-yellow-600 bg-yellow-50", icon: Clock },
  PAGADO: { label: "Pagado", color: "text-green-600 bg-green-50", icon: CheckCircle },
  VENCIDO: { label: "Vencido", color: "text-red-600 bg-red-50", icon: AlertTriangle },
  PARCIAL: { label: "Parcial", color: "text-blue-600 bg-blue-50", icon: TrendingUp },
  CANCELADO: { label: "Cancelado", color: "text-gray-600 bg-gray-50", icon: XCircle },
};

const PAYMENT_METHODS = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "SPEI", label: "SPEI (sin comisión)" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "DEPOSITO", label: "Depósito" },
  { value: "OTRO", label: "Otro" },
];

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

interface SpeiInfo {
  reference: string;
  student: { firstName: string; lastName: string };
  bankInfo: {
    bankName: string;
    accountHolder: string;
    clabe: string;
    accountNumber?: string;
  };
}

interface BankConfig {
  id: string;
  bankName: string;
  accountHolder: string;
  clabe: string;
  accountNumber?: string;
  referencePrefix: string;
}

export default function PaymentsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCharge, setExpandedCharge] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterStudent, setFilterStudent] = useState<string>("");
  
  // SPEI states
  const [speiInfo, setSpeiInfo] = useState<Record<string, SpeiInfo>>({});
  const [loadingSpei, setLoadingSpei] = useState<string | null>(null);
  const [showBankConfigModal, setShowBankConfigModal] = useState(false);
  const [bankConfig, setBankConfig] = useState<BankConfig | null>(null);
  const [savingBankConfig, setSavingBankConfig] = useState(false);

  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchCharges();
      if (isAdmin) {
        fetchStudents();
      }
    }
  }, [status, router, isAdmin]);

  useEffect(() => {
    fetchCharges();
  }, [filterStatus, filterStudent]);

  const fetchCharges = async () => {
    try {
      let url = "/api/charges?";
      if (filterStatus) url += `status=${filterStatus}&`;
      if (filterStudent) url += `studentId=${filterStudent}&`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCharges(data);
      }
    } catch (error) {
      console.error("Error fetching charges:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        const groups = await res.json();
        const allStudents: Student[] = [];
        groups.forEach((group: any) => {
          group.students?.forEach((student: any) => {
            allStudents.push({
              id: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              group: { name: group.name },
            });
          });
        });
        setStudents(allStudents);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // SPEI functions
  const fetchBankConfig = async () => {
    try {
      const res = await fetch("/api/charges/bank-config");
      if (res.ok) {
        const data = await res.json();
        setBankConfig(data);
      }
    } catch (error) {
      console.error("Error fetching bank config:", error);
    }
  };

  const fetchSpeiReference = async (studentId: string) => {
    if (speiInfo[studentId]) return; // Ya cargado
    setLoadingSpei(studentId);
    try {
      const res = await fetch(`/api/charges/spei-reference?studentId=${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setSpeiInfo(prev => ({ ...prev, [studentId]: data }));
      }
    } catch (error) {
      console.error("Error fetching SPEI reference:", error);
    } finally {
      setLoadingSpei(null);
    }
  };

  const saveBankConfig = async (config: Partial<BankConfig>) => {
    setSavingBankConfig(true);
    try {
      const res = await fetch("/api/charges/bank-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const data = await res.json();
        setBankConfig(data);
        toast.success("Configuración bancaria guardada");
        setShowBankConfigModal(false);
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al guardar configuración");
      }
    } catch (error) {
      console.error("Error saving bank config:", error);
      toast.error("Error al guardar configuración");
    } finally {
      setSavingBankConfig(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  // Fetch bank config on mount for admin
  useEffect(() => {
    if (isAdmin && status === "authenticated") {
      fetchBankConfig();
    }
  }, [isAdmin, status]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const getChargeTypeInfo = (type: string) => {
    return CHARGE_TYPES.find((t) => t.value === type) || CHARGE_TYPES[7];
  };

  // Calculate summary
  const summary = {
    total: charges.reduce((acc, c) => acc + c.amount, 0),
    paid: charges.reduce((acc, c) => acc + c.amountPaid, 0),
    pending: charges.filter((c) => c.status === "PENDIENTE" || c.status === "PARCIAL").length,
    overdue: charges.filter((c) => c.status === "VENCIDO").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="h-7 w-7 text-[#1B4079]" />
            {isAdmin ? "Gestión de Pagos" : "Estado de Cuenta"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? "Administra cargos y pagos de los alumnos" : "Consulta tus cargos y pagos pendientes"}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowBankConfigModal(true)}
              variant="outline"
              className="border-[#1B4079] text-[#1B4079]"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Config. SPEI
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#1B4079] hover:bg-[#15325f] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo cargo
            </Button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total cargos</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.total)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pagado</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(summary.paid)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-lg font-bold text-yellow-600">{summary.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Vencidos</p>
              <p className="text-lg font-bold text-red-600">{summary.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SPEI Payment Instructions for Parents */}
      {!isAdmin && charges.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 shadow-sm border border-green-200 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <Banknote className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 text-lg mb-2">
                💰 Paga por SPEI sin comisiones
              </h3>
              <p className="text-green-700 text-sm mb-4">
                Realiza tu pago por transferencia bancaria usando la referencia única de cada alumno. Sin comisiones bancarias.
              </p>
              
              {/* Get unique students from charges */}
              {(() => {
                const uniqueStudents = charges.reduce((acc, charge) => {
                  if (!acc.find(s => s.id === charge.student.id)) {
                    acc.push(charge.student);
                  }
                  return acc;
                }, [] as typeof charges[0]["student"][]);

                return (
                  <div className="space-y-3">
                    {uniqueStudents.map(student => (
                      <div key={student.id} className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-gray-800">
                              {student.firstName} {student.lastName}
                            </span>
                            {student.group && (
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                {student.group.name}
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchSpeiReference(student.id)}
                            disabled={loadingSpei === student.id}
                            className="text-green-700 border-green-300 hover:bg-green-50"
                          >
                            {loadingSpei === student.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : speiInfo[student.id] ? (
                              "Ver datos"
                            ) : (
                              "Ver instrucciones SPEI"
                            )}
                          </Button>
                        </div>
                        
                        {speiInfo[student.id] && (
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-gray-500 text-xs">Banco</p>
                                <p className="font-medium">{speiInfo[student.id].bankInfo.bankName}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Beneficiario</p>
                                <p className="font-medium">{speiInfo[student.id].bankInfo.accountHolder}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">CLABE Interbancaria</p>
                              <div className="flex items-center gap-2">
                                <code className="font-mono text-base font-bold text-[#1B4079]">
                                  {speiInfo[student.id].bankInfo.clabe}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(speiInfo[student.id].bankInfo.clabe, "CLABE")}
                                  className="text-gray-400 hover:text-[#1B4079]"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-gray-500 text-xs">Referencia única (usar en concepto)</p>
                              <div className="flex items-center gap-2">
                                <code className="font-mono text-lg font-bold text-green-600">
                                  {speiInfo[student.id].reference}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(speiInfo[student.id].reference, "Referencia")}
                                  className="text-gray-400 hover:text-green-600"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                              ⚠️ Incluye siempre la referencia en el concepto de tu transferencia para identificar el pago
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
          {isAdmin && students.length > 0 && (
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
            >
              <option value="">Todos los alumnos</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Charges List */}
      <div className="space-y-4">
        {charges.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cargos</h3>
            <p className="text-gray-500">
              {isAdmin
                ? "Aún no se han creado cargos. Crea uno nuevo para comenzar."
                : "No tienes cargos pendientes en este momento."}
            </p>
          </div>
        ) : (
          charges.map((charge) => (
            <ChargeCard
              key={charge.id}
              charge={charge}
              isAdmin={isAdmin}
              isExpanded={expandedCharge === charge.id}
              onToggle={() => setExpandedCharge(expandedCharge === charge.id ? null : charge.id)}
              onRecordPayment={() => setShowPaymentModal(charge.id)}
              formatCurrency={formatCurrency}
              getChargeTypeInfo={getChargeTypeInfo}
            />
          ))
        )}
      </div>

      {/* Create Charge Modal */}
      {showCreateModal && (
        <CreateChargeModal
          students={students}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            fetchCharges();
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <RecordPaymentModal
          chargeId={showPaymentModal}
          charge={charges.find((c) => c.id === showPaymentModal)!}
          onClose={() => setShowPaymentModal(null)}
          onRecorded={() => {
            fetchCharges();
            setShowPaymentModal(null);
          }}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Bank Config Modal (Admin) */}
      {showBankConfigModal && (
        <BankConfigModal
          config={bankConfig}
          onClose={() => setShowBankConfigModal(false)}
          onSave={saveBankConfig}
          saving={savingBankConfig}
        />
      )}
    </div>
  );
}

// Charge Card Component
function ChargeCard({
  charge,
  isAdmin,
  isExpanded,
  onToggle,
  onRecordPayment,
  formatCurrency,
  getChargeTypeInfo,
}: {
  charge: Charge;
  isAdmin: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onRecordPayment: () => void;
  formatCurrency: (amount: number) => string;
  getChargeTypeInfo: (type: string) => { value: string; label: string; color: string };
}) {
  const statusConfig = STATUS_CONFIG[charge.status] || STATUS_CONFIG.PENDIENTE;
  const StatusIcon = statusConfig.icon;
  const typeInfo = getChargeTypeInfo(charge.type);
  const remaining = charge.amount - charge.amountPaid;
  const progress = (charge.amountPaid / charge.amount) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Main Row */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${typeInfo.color}15` }}
            >
              <Receipt className="h-6 w-6" style={{ color: typeInfo.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{charge.concept}</h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${typeInfo.color}15`,
                    color: typeInfo.color,
                  }}
                >
                  {typeInfo.label}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {charge.student.firstName} {charge.student.lastName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Vence: {format(parseISO(charge.dueDate), "d MMM yyyy", { locale: es })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold text-gray-900">{formatCurrency(charge.amount)}</p>
              <div className={`flex items-center gap-1 text-sm ${statusConfig.color} px-2 py-0.5 rounded-full`}>
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{statusConfig.label}</span>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {charge.status !== "CANCELADO" && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Pagado: {formatCurrency(charge.amountPaid)}</span>
              <span>Restante: {formatCurrency(remaining)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          {/* Payment History */}
          {charge.payments.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Historial de pagos</h4>
              <div className="space-y-2">
                {charge.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-white rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(parseISO(payment.paidAt), "d MMM yyyy, HH:mm", { locale: es })}
                          {" • "}
                          {PAYMENT_METHODS.find((m) => m.value === payment.method)?.label || payment.method}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      Registrado por {payment.recordedBy.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Actions */}
          {isAdmin && charge.status !== "PAGADO" && charge.status !== "CANCELADO" && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onRecordPayment();
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Registrar pago
            </Button>
          )}

          {/* Notes */}
          {charge.notes && (
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Notas:</span> {charge.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Create Charge Modal
function CreateChargeModal({
  students,
  onClose,
  onCreated,
}: {
  students: Student[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    concept: "",
    type: "COLEGIATURA",
    amount: "",
    dueDate: "",
    studentId: "",
    periodMonth: "",
    periodYear: new Date().getFullYear().toString(),
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.concept || !formData.amount || !formData.dueDate || !formData.studentId) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          periodMonth: formData.periodMonth ? parseInt(formData.periodMonth) : null,
          periodYear: formData.periodYear ? parseInt(formData.periodYear) : null,
        }),
      });

      if (res.ok) {
        toast.success("Cargo creado exitosamente");
        onCreated();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al crear cargo");
      }
    } catch (error) {
      toast.error("Error al crear cargo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo cargo</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Student */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alumno *
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
              required
            >
              <option value="">Seleccionar alumno</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} {student.group ? `(${student.group.name})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Concept */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concepto *
            </label>
            <input
              type="text"
              value={formData.concept}
              onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
              placeholder="Ej: Colegiatura Febrero 2026"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de cargo
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
            >
              {CHARGE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto (MXN) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha límite de pago *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
              required
            />
          </div>

          {/* Period (for tuition) */}
          {formData.type === "COLEGIATURA" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mes del periodo
                </label>
                <select
                  value={formData.periodMonth}
                  onChange={(e) => setFormData({ ...formData, periodMonth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
                >
                  <option value="">Seleccionar</option>
                  {MONTHS.map((month, idx) => (
                    <option key={idx} value={idx + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <input
                  type="number"
                  value={formData.periodYear}
                  onChange={(e) => setFormData({ ...formData, periodYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
                  min="2024"
                  max="2030"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
              rows={2}
              placeholder="Notas adicionales..."
            />
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
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Crear cargo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Record Payment Modal
function RecordPaymentModal({
  chargeId,
  charge,
  onClose,
  onRecorded,
  formatCurrency,
}: {
  chargeId: string;
  charge: Charge;
  onClose: () => void;
  onRecorded: () => void;
  formatCurrency: (amount: number) => string;
}) {
  const remaining = charge.amount - charge.amountPaid;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: remaining.toString(),
    method: "EFECTIVO",
    reference: "",
    notes: "",
    paidAt: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/charges/${chargeId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Pago registrado exitosamente");
        onRecorded();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al registrar pago");
      }
    } catch (error) {
      toast.error("Error al registrar pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Registrar pago</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Charge Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-900">{charge.concept}</p>
            <p className="text-sm text-gray-500">
              {charge.student.firstName} {charge.student.lastName}
            </p>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-gray-500">Monto pendiente:</span>
              <span className="font-bold text-[#1B4079]">{formatCurrency(remaining)}</span>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto del pago (MXN) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
              min="0.01"
              max={remaining}
              step="0.01"
              required
            />
          </div>

          {/* Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de pago
            </label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referencia (opcional)
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
              placeholder="Número de transferencia, recibo, etc."
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de pago
            </label>
            <input
              type="date"
              value={formData.paidAt}
              onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
              rows={2}
              placeholder="Notas adicionales..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Registrar pago
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Bank Config Modal Component
function BankConfigModal({
  config,
  onClose,
  onSave,
  saving,
}: {
  config: BankConfig | null;
  onClose: () => void;
  onSave: (config: Partial<BankConfig>) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState({
    bankName: config?.bankName || "",
    accountHolder: config?.accountHolder || "",
    clabe: config?.clabe || "",
    accountNumber: config?.accountNumber || "",
    referencePrefix: config?.referencePrefix || "REF",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1B4079]/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-[#1B4079]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Configuración Bancaria</h2>
              <p className="text-sm text-gray-500">Datos para pagos SPEI</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Banco *
            </label>
            <select
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
              required
            >
              <option value="">Seleccionar banco</option>
              <option value="BBVA">BBVA</option>
              <option value="Banorte">Banorte</option>
              <option value="Santander">Santander</option>
              <option value="Citibanamex">Citibanamex</option>
              <option value="HSBC">HSBC</option>
              <option value="Scotiabank">Scotiabank</option>
              <option value="Inbursa">Inbursa</option>
              <option value="Banregio">Banregio</option>
              <option value="Banco Azteca">Banco Azteca</option>
              <option value="BanCoppel">BanCoppel</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Titular *
            </label>
            <input
              type="text"
              value={formData.accountHolder}
              onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]"
              placeholder="Ej: Escuela Vermont S.C."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CLABE Interbancaria (18 dígitos) *
            </label>
            <input
              type="text"
              value={formData.clabe}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 18);
                setFormData({ ...formData, clabe: value });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079] font-mono"
              placeholder="012345678901234567"
              maxLength={18}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.clabe.length}/18 dígitos
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Cuenta (opcional)
            </label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079] font-mono"
              placeholder="1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prefijo para Referencias
            </label>
            <input
              type="text"
              value={formData.referencePrefix}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
                setFormData({ ...formData, referencePrefix: value });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079] font-mono uppercase"
              placeholder="VS"
              maxLength={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ej: &quot;VS&quot; generará referencias como VS240001
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Esta información se mostrará a los padres para que puedan realizar transferencias SPEI sin comisiones.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || formData.clabe.length !== 18}
              className="bg-[#1B4079] hover:bg-[#15325f] text-white"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar configuración
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
