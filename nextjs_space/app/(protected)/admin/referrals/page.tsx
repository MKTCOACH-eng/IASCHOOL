"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  Settings,
  Gift,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Mail,
  Calendar,
  Loader2,
  Save,
  RefreshCw,
  UserPlus,
  TrendingUp,
  AlertCircle,
  BadgePercent,
  DollarSign,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReferralProgram {
  id: string;
  isActive: boolean;
  rewardType: string;
  rewardValue: number;
  rewardDescription: string | null;
  maxRewardsPerYear: number | null;
  minEnrollmentValue: number | null;
  requiresActiveAccount: boolean;
  requiresMinMonths: number | null;
  welcomeMessage: string | null;
  thankYouMessage: string | null;
  termsUrl: string | null;
  totalReferrals: number;
  successfulReferrals: number;
}

interface Referral {
  id: string;
  referredName: string;
  referredEmail: string | null;
  referredPhone: string;
  referredChildName: string | null;
  referredChildGrade: string | null;
  referredNotes: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  contactedAt: string | null;
  enrolledAt: string | null;
  referrer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  reward: {
    id: string;
    isApplied: boolean;
    rewardType: string;
    rewardValue: number;
  } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  CONTACTED: { label: "Contactado", color: "bg-blue-100 text-blue-800", icon: Phone },
  INTERESTED: { label: "Interesado", color: "bg-purple-100 text-purple-800", icon: Star },
  ENROLLED: { label: "Inscrito ✓", color: "bg-green-100 text-green-800", icon: CheckCircle },
  NOT_INTERESTED: { label: "Sin interés", color: "bg-gray-100 text-gray-800", icon: XCircle },
  ALREADY_REFERRED: { label: "Ya referido", color: "bg-orange-100 text-orange-800", icon: AlertCircle },
  INVALID: { label: "Inválido", color: "bg-red-100 text-red-800", icon: XCircle },
};

const REWARD_TYPES = [
  { value: "DISCOUNT_PERCENTAGE", label: "Descuento porcentual (%)", icon: BadgePercent },
  { value: "DISCOUNT_FIXED", label: "Descuento fijo ($)", icon: DollarSign },
  { value: "FREE_MONTHS", label: "Meses gratis", icon: Calendar },
  { value: "STORE_CREDIT", label: "Crédito en tienda", icon: Gift },
  { value: "CUSTOM", label: "Personalizado", icon: Star },
];

export default function AdminReferralsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("leads");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Configuración del programa
  const [program, setProgram] = useState<ReferralProgram | null>(null);
  const [config, setConfig] = useState({
    isActive: true,
    rewardType: "DISCOUNT_PERCENTAGE",
    rewardValue: 10,
    rewardDescription: "",
    maxRewardsPerYear: 5,
    requiresActiveAccount: true,
    requiresMinMonths: 3,
    welcomeMessage: "",
    thankYouMessage: "",
    termsUrl: "",
  });
  
  // Leads
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as any)?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    loadData();
  }, [session, status, router]);

  async function loadData() {
    setLoading(true);
    try {
      // Cargar configuración
      const configRes = await fetch("/api/admin/referrals/config");
      const configData = await configRes.json();
      
      if (configData.program) {
        setProgram(configData.program);
        setConfig({
          isActive: configData.program.isActive,
          rewardType: configData.program.rewardType,
          rewardValue: Number(configData.program.rewardValue),
          rewardDescription: configData.program.rewardDescription || "",
          maxRewardsPerYear: configData.program.maxRewardsPerYear || 5,
          requiresActiveAccount: configData.program.requiresActiveAccount,
          requiresMinMonths: configData.program.requiresMinMonths || 3,
          welcomeMessage: configData.program.welcomeMessage || "",
          thankYouMessage: configData.program.thankYouMessage || "",
          termsUrl: configData.program.termsUrl || "",
        });
      } else if (configData.defaults) {
        setConfig({ ...config, ...configData.defaults });
      }
      
      // Cargar leads
      const leadsRes = await fetch("/api/admin/referrals/leads");
      const leadsData = await leadsRes.json();
      setReferrals(leadsData.referrals || []);
      setStats(leadsData.stats || {});
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  async function saveConfig() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/referrals/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setProgram(data.program);
        toast.success("Configuración guardada");
      } else {
        toast.error(data.error || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  }

  async function updateReferralStatus(referralId: string, newStatus: string) {
    setUpdatingStatus(referralId);
    try {
      const res = await fetch("/api/admin/referrals/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referralId,
          status: newStatus,
          adminNotes: selectedReferral?.id === referralId ? adminNotes : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          newStatus === "ENROLLED" 
            ? "¡Inscrito! Se creó la recompensa para el referidor." 
            : "Estado actualizado"
        );
        loadData();
        setSelectedReferral(null);
        setAdminNotes("");
      } else {
        toast.error(data.error || "Error al actualizar");
      }
    } catch (error) {
      toast.error("Error al actualizar estado");
    } finally {
      setUpdatingStatus(null);
    }
  }

  const filteredReferrals = filterStatus === "ALL" 
    ? referrals 
    : referrals.filter(r => r.status === filterStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-7 w-7 text-primary" />
            Programa de Referidos
          </h1>
          <p className="text-muted-foreground">
            Gestiona el programa "Recomienda a tu Escuela"
          </p>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{program?.totalReferrals || 0}</p>
                <p className="text-xs text-muted-foreground">Total Referidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{program?.successfulReferrals || 0}</p>
                <p className="text-xs text-muted-foreground">Inscritos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.PENDING || 0}</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {program?.totalReferrals ? ((program.successfulReferrals / program.totalReferrals) * 100).toFixed(0) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Conversión</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Leads ({referrals.length})
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        {/* TAB: LEADS */}
        <TabsContent value="leads" className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("ALL")}
            >
              Todos ({referrals.length})
            </Button>
            {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
              <Button
                key={key}
                variant={filterStatus === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(key)}
              >
                {label} ({stats[key] || 0})
              </Button>
            ))}
          </div>

          {/* Lista de Leads */}
          <div className="space-y-3">
            {filteredReferrals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay referidos en esta categoría</p>
                </CardContent>
              </Card>
            ) : (
              filteredReferrals.map((referral) => {
                const statusInfo = STATUS_LABELS[referral.status] || STATUS_LABELS.PENDING;
                const StatusIcon = statusInfo.icon;
                return (
                  <Card key={referral.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{referral.referredName}</h3>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            {referral.reward && (
                              <Badge variant="outline" className="border-green-500 text-green-700">
                                <Gift className="h-3 w-3 mr-1" />
                                Recompensa {referral.reward.isApplied ? "aplicada" : "pendiente"}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {referral.referredPhone}
                              {referral.referredEmail && (
                                <>
                                  <Mail className="h-3 w-3 ml-2" />
                                  {referral.referredEmail}
                                </>
                              )}
                            </p>
                            {referral.referredChildName && (
                              <p>Hijo(a): {referral.referredChildName} {referral.referredChildGrade && `(${referral.referredChildGrade})`}</p>
                            )}
                            <p className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              Referido el {new Date(referral.createdAt).toLocaleDateString("es-MX")}
                              {" por "}
                              <span className="font-medium text-primary">{referral.referrer.name}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {referral.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReferralStatus(referral.id, "CONTACTED")}
                              disabled={updatingStatus === referral.id}
                            >
                              {updatingStatus === referral.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Phone className="h-4 w-4 mr-1" />
                                  Marcar Contactado
                                </>
                              )}
                            </Button>
                          )}
                          {["CONTACTED", "INTERESTED"].includes(referral.status) && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateReferralStatus(referral.id, "INTERESTED")}
                                disabled={updatingStatus === referral.id || referral.status === "INTERESTED"}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Interesado
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => updateReferralStatus(referral.id, "ENROLLED")}
                                disabled={updatingStatus === referral.id}
                              >
                                {updatingStatus === referral.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    ¡Inscrito!
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateReferralStatus(referral.id, "NOT_INTERESTED")}
                                disabled={updatingStatus === referral.id}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* TAB: CONFIGURACIÓN */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Configuración del Programa
              </CardTitle>
              <CardDescription>
                Define las recompensas y reglas para los padres que refieran nuevas familias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Estado del programa */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Programa Activo</p>
                  <p className="text-sm text-muted-foreground">
                    Los padres podrán ver y usar el programa de referidos
                  </p>
                </div>
                <Switch
                  checked={config.isActive}
                  onCheckedChange={(checked) => setConfig({ ...config, isActive: checked })}
                />
              </div>

              {/* Tipo y valor de recompensa */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Recompensa</label>
                  <Select
                    value={config.rewardType}
                    onValueChange={(value) => setConfig({ ...config, rewardType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REWARD_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Valor de la Recompensa
                    {config.rewardType === "DISCOUNT_PERCENTAGE" && " (%)"}
                    {config.rewardType === "DISCOUNT_FIXED" && " (MXN)"}
                    {config.rewardType === "FREE_MONTHS" && " (meses)"}
                    {config.rewardType === "STORE_CREDIT" && " (MXN)"}
                  </label>
                  <Input
                    type="number"
                    value={config.rewardValue}
                    onChange={(e) => setConfig({ ...config, rewardValue: Number(e.target.value) })}
                    min={1}
                  />
                </div>
              </div>

              {/* Descripción personalizada */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción de la Recompensa (opcional)</label>
                <Textarea
                  placeholder="Ej: 10% de descuento en la colegiatura del próximo mes"
                  value={config.rewardDescription}
                  onChange={(e) => setConfig({ ...config, rewardDescription: e.target.value })}
                />
              </div>

              {/* Límites */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Máximo de recompensas por padre/año</label>
                  <Input
                    type="number"
                    value={config.maxRewardsPerYear}
                    onChange={(e) => setConfig({ ...config, maxRewardsPerYear: Number(e.target.value) })}
                    min={1}
                    max={20}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meses mínimos en la escuela</label>
                  <Input
                    type="number"
                    value={config.requiresMinMonths}
                    onChange={(e) => setConfig({ ...config, requiresMinMonths: Number(e.target.value) })}
                    min={0}
                    max={24}
                  />
                </div>
              </div>

              {/* Requisito de cuenta al corriente */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Requiere cuenta al corriente</p>
                  <p className="text-sm text-muted-foreground">
                    Solo padres sin adeudos pueden participar
                  </p>
                </div>
                <Switch
                  checked={config.requiresActiveAccount}
                  onCheckedChange={(checked) => setConfig({ ...config, requiresActiveAccount: checked })}
                />
              </div>

              {/* Mensajes personalizados */}
              <div className="space-y-4">
                <h4 className="font-medium">Mensajes Personalizados</h4>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mensaje de bienvenida (visible para padres)</label>
                  <Textarea
                    placeholder="Ej: ¡Gracias por ser parte de nuestra comunidad! Recomienda a tus amigos y gana descuentos."
                    value={config.welcomeMessage}
                    onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mensaje de agradecimiento (cuando convierten)</label>
                  <Textarea
                    placeholder="Ej: ¡Felicidades! Tu referido se ha inscrito. Tu recompensa está lista."
                    value={config.thankYouMessage}
                    onChange={(e) => setConfig({ ...config, thankYouMessage: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={saveConfig} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
