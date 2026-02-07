"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Send,
  FileText,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Plus,
  Search,
  Filter,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  type: string;
  pricePerStudent: number;
  features: string[];
}

interface Quote {
  id: string;
  quoteNumber: string;
  schoolName: string;
  contactName: string;
  contactEmail: string;
  estimatedStudents: number;
  setupFee: number;
  monthlyTotal: number;
  annualTotal: number;
  status: string;
  createdAt: string;
  expiresAt: string;
  selectedPlan?: Plan;
}

interface Calculation {
  plan: Plan;
  setupFee: number;
  setupTierName: string;
  pricePerStudent: number;
  students: number;
  monthly: { total: number; iaSchool: number; school: number };
  annual: { total: number; iaSchool: number; school: number; savings: number };
  shares: { iaSchool: number; school: number };
}

export default function QuotesPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Calculator form
  const [calcForm, setCalcForm] = useState({
    schoolName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    estimatedStudents: "",
    planType: "STANDARD",
    customPricePerStudent: "",
    notes: "",
    internalNotes: ""
  });
  const [calculation, setCalculation] = useState<Calculation | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [quotesRes, plansRes] = await Promise.all([
        fetch("/api/super-admin/quotes"),
        fetch("/api/super-admin/plans")
      ]);
      if (quotesRes.ok) setQuotes(await quotesRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculate = useCallback(async () => {
    if (!calcForm.estimatedStudents || !calcForm.planType) return;
    
    setCalculating(true);
    try {
      const res = await fetch("/api/super-admin/quotes/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimatedStudents: calcForm.estimatedStudents,
          planType: calcForm.planType,
          customPricePerStudent: calcForm.customPricePerStudent || undefined
        })
      });
      if (res.ok) {
        const result = await res.json();
        setCalculation(result);
      }
    } catch (error) {
      console.error("Error calculating:", error);
    } finally {
      setCalculating(false);
    }
  }, [calcForm.estimatedStudents, calcForm.planType, calcForm.customPricePerStudent]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (calcForm.estimatedStudents && calcForm.planType) {
        calculate();
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [calcForm.estimatedStudents, calcForm.planType, calcForm.customPricePerStudent, calculate]);

  const saveQuote = async () => {
    if (!calculation || !calcForm.schoolName || !calcForm.contactName || !calcForm.contactEmail) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/super-admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...calcForm,
          selectedPlanId: calculation.plan.id,
          setupFee: calculation.setupFee,
          monthlyTotal: calculation.monthly.total,
          annualTotal: calculation.annual.total,
          iaSchoolMonthly: calculation.monthly.iaSchool,
          schoolMonthly: calculation.monthly.school
        })
      });

      if (res.ok) {
        toast.success("Cotización creada exitosamente");
        setShowCalculator(false);
        setCalcForm({
          schoolName: "",
          contactName: "",
          contactEmail: "",
          contactPhone: "",
          address: "",
          estimatedStudents: "",
          planType: "STANDARD",
          customPricePerStudent: "",
          notes: "",
          internalNotes: ""
        });
        setCalculation(null);
        fetchData();
      } else {
        toast.error("Error al crear cotización");
      }
    } catch (error) {
      toast.error("Error al crear cotización");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN"
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string }> = {
      DRAFT: { color: "bg-gray-100 text-gray-800", icon: FileText, label: "Borrador" },
      SENT: { color: "bg-blue-100 text-blue-800", icon: Send, label: "Enviada" },
      VIEWED: { color: "bg-yellow-100 text-yellow-800", icon: Eye, label: "Vista" },
      NEGOTIATING: { color: "bg-purple-100 text-purple-800", icon: TrendingUp, label: "Negociando" },
      ACCEPTED: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Aceptada" },
      REJECTED: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Rechazada" },
      EXPIRED: { color: "bg-gray-100 text-gray-800", icon: Clock, label: "Expirada" }
    };
    const c = config[status] || config.DRAFT;
    return (
      <Badge className={`${c.color} gap-1`}>
        <c.icon className="h-3 w-3" />
        {c.label}
      </Badge>
    );
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = !searchTerm || 
      q.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-gray-500">Gestiona cotizaciones para nuevos colegios</p>
        </div>
        <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#1B4079] hover:bg-[#15325f]">
              <Calculator className="h-4 w-4" />
              Nueva Cotización
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculadora de Cotizaciones
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Formulario */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Datos del Colegio</h3>
                
                <div className="space-y-2">
                  <Label>Nombre del Colegio *</Label>
                  <Input
                    value={calcForm.schoolName}
                    onChange={(e) => setCalcForm({ ...calcForm, schoolName: e.target.value })}
                    placeholder="Ej: Colegio Vermont"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contacto *</Label>
                    <Input
                      value={calcForm.contactName}
                      onChange={(e) => setCalcForm({ ...calcForm, contactName: e.target.value })}
                      placeholder="Nombre del contacto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={calcForm.contactEmail}
                      onChange={(e) => setCalcForm({ ...calcForm, contactEmail: e.target.value })}
                      placeholder="contacto@colegio.edu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      value={calcForm.contactPhone}
                      onChange={(e) => setCalcForm({ ...calcForm, contactPhone: e.target.value })}
                      placeholder="55 1234 5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Alumnos *</Label>
                    <Input
                      type="number"
                      value={calcForm.estimatedStudents}
                      onChange={(e) => setCalcForm({ ...calcForm, estimatedStudents: e.target.value })}
                      placeholder="500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Plan *</Label>
                  <Select
                    value={calcForm.planType}
                    onValueChange={(value) => setCalcForm({ ...calcForm, planType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASIC">Básico - $149/alumno/mes</SelectItem>
                      <SelectItem value="STANDARD">Estándar - $199/alumno/mes</SelectItem>
                      <SelectItem value="PREMIUM">Premium - $299/alumno/mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Precio personalizado por alumno (opcional)</Label>
                  <Input
                    type="number"
                    value={calcForm.customPricePerStudent}
                    onChange={(e) => setCalcForm({ ...calcForm, customPricePerStudent: e.target.value })}
                    placeholder="Dejar vacío para usar precio estándar"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notas para el cliente</Label>
                  <Textarea
                    value={calcForm.notes}
                    onChange={(e) => setCalcForm({ ...calcForm, notes: e.target.value })}
                    placeholder="Notas visibles en la cotización..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notas internas</Label>
                  <Textarea
                    value={calcForm.internalNotes}
                    onChange={(e) => setCalcForm({ ...calcForm, internalNotes: e.target.value })}
                    placeholder="Notas solo para el equipo interno..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Resultado */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Resumen de Cotización</h3>
                
                {calculating ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1B4079]" />
                  </div>
                ) : calculation ? (
                  <div className="space-y-4">
                    {/* Plan seleccionado */}
                    <Card className="bg-[#1B4079] text-white">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm opacity-80">Plan {calculation.plan.name}</p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(calculation.pricePerStudent)}/alumno/mes
                            </p>
                          </div>
                          <Users className="h-8 w-8 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Setup Fee */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">Setup Fee ({calculation.setupTierName})</p>
                            <p className="text-xl font-bold text-gray-900">
                              {formatCurrency(calculation.setupFee)}
                            </p>
                          </div>
                          <DollarSign className="h-6 w-6 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Mensual */}
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-medium text-gray-500">MENSUAL ({calculation.students} alumnos)</p>
                        <div className="flex justify-between">
                          <span>Total</span>
                          <span className="font-bold">{formatCurrency(calculation.monthly.total)}</span>
                        </div>
                        <div className="border-t pt-2 text-sm text-gray-500">
                          <div className="flex justify-between">
                            <span>IA School ({calculation.shares.iaSchool}%)</span>
                            <span>{formatCurrency(calculation.monthly.iaSchool)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Colegio ({calculation.shares.school}%)</span>
                            <span>{formatCurrency(calculation.monthly.school)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Anual */}
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-medium text-green-700">ANUAL (2 meses gratis)</p>
                        <div className="flex justify-between">
                          <span>Total</span>
                          <span className="font-bold text-green-700">{formatCurrency(calculation.annual.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Ahorro</span>
                          <span>{formatCurrency(calculation.annual.savings)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Button 
                      onClick={saveQuote} 
                      disabled={saving || !calcForm.schoolName || !calcForm.contactEmail}
                      className="w-full bg-[#1B4079] hover:bg-[#15325f]"
                    >
                      {saving ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Guardando...</>
                      ) : (
                        <><Plus className="h-4 w-4 mr-2" /> Crear Cotización</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Ingresa el número de alumnos para calcular</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, contacto o número..."
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="DRAFT">Borrador</SelectItem>
                <SelectItem value="SENT">Enviada</SelectItem>
                <SelectItem value="VIEWED">Vista</SelectItem>
                <SelectItem value="NEGOTIATING">Negociando</SelectItem>
                <SelectItem value="ACCEPTED">Aceptada</SelectItem>
                <SelectItem value="REJECTED">Rechazada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de cotizaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Cotizaciones ({filteredQuotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Número</th>
                  <th className="pb-3 font-medium">Colegio</th>
                  <th className="pb-3 font-medium">Contacto</th>
                  <th className="pb-3 font-medium text-center">Alumnos</th>
                  <th className="pb-3 font-medium text-right">Total Mensual</th>
                  <th className="pb-3 font-medium text-center">Estado</th>
                  <th className="pb-3 font-medium text-center">Expira</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer">
                    <td className="py-4">
                      <span className="font-mono text-sm">{quote.quoteNumber}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1B4079] rounded flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium">{quote.schoolName}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-900">{quote.contactName}</p>
                        <p className="text-xs text-gray-500">{quote.contactEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        {quote.estimatedStudents}
                      </span>
                    </td>
                    <td className="py-4 text-right font-medium">
                      {formatCurrency(quote.monthlyTotal)}
                    </td>
                    <td className="py-4 text-center">
                      {getStatusBadge(quote.status)}
                    </td>
                    <td className="py-4 text-center text-sm text-gray-500">
                      {new Date(quote.expiresAt).toLocaleDateString("es-MX")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredQuotes.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No hay cotizaciones {statusFilter !== "all" ? "con ese estado" : ""}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
