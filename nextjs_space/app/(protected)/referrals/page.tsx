"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  UserPlus,
  Gift,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Send,
  Phone,
  Mail,
  User,
  GraduationCap,
  FileText,
  Trophy,
  Star,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ReferralProgram {
  rewardType: string;
  rewardValue: number;
  rewardDescription: string | null;
  welcomeMessage: string | null;
  termsUrl: string | null;
}

interface MyReferral {
  id: string;
  referredName: string;
  referredChildName: string | null;
  status: string;
  createdAt: string;
  enrolledAt: string | null;
  reward: {
    id: string;
    isApplied: boolean;
    rewardType: string;
    rewardValue: number;
  } | null;
}

interface ReferralStats {
  total: number;
  successful: number;
  pending: number;
  remainingRewards: number;
}

const STATUS_INFO: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  CONTACTED: { label: "Contactado", color: "bg-blue-100 text-blue-800", icon: Phone },
  INTERESTED: { label: "Interesado", color: "bg-purple-100 text-purple-800", icon: Star },
  ENROLLED: { label: "¡Inscrito!", color: "bg-green-100 text-green-800", icon: CheckCircle },
  NOT_INTERESTED: { label: "Sin interés", color: "bg-gray-100 text-gray-800", icon: XCircle },
};

const REWARD_TYPE_LABELS: Record<string, string> = {
  DISCOUNT_PERCENTAGE: "de descuento",
  DISCOUNT_FIXED: "MXN de descuento",
  FREE_MONTHS: "mes(es) gratis",
  STORE_CREDIT: "MXN en crédito tienda",
  CUSTOM: "",
};

export default function ReferralsPage() {
  const { data: session } = useSession() || {};
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [available, setAvailable] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [eligibilityReason, setEligibilityReason] = useState("");
  const [program, setProgram] = useState<ReferralProgram | null>(null);
  const [myReferrals, setMyReferrals] = useState<MyReferral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({ total: 0, successful: 0, pending: 0, remainingRewards: 5 });
  
  // Formulario
  const [formData, setFormData] = useState({
    referredName: "",
    referredEmail: "",
    referredPhone: "",
    referredChildName: "",
    referredChildGrade: "",
    referredNotes: "",
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/referrals");
      const data = await res.json();
      
      setAvailable(data.available);
      setIsEligible(data.isEligible);
      setEligibilityReason(data.eligibilityReason || "");
      setProgram(data.program || null);
      setMyReferrals(data.myReferrals || []);
      setStats(data.stats || { total: 0, successful: 0, pending: 0, remainingRewards: 5 });
    } catch (error) {
      console.error("Error loading referral data:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.referredName || !formData.referredPhone) {
      toast.error("Nombre y teléfono son requeridos");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message || "¡Referido enviado exitosamente!");
        setFormData({
          referredName: "",
          referredEmail: "",
          referredPhone: "",
          referredChildName: "",
          referredChildGrade: "",
          referredNotes: "",
        });
        setShowForm(false);
        loadData();
      } else {
        if (data.alreadyReferred) {
          toast.error(data.error, {
            duration: 5000,
            icon: "\u26a0\ufe0f",
          });
        } else {
          toast.error(data.error || "Error al enviar referido");
        }
      }
    } catch (error) {
      toast.error("Error al enviar referido");
    } finally {
      setSubmitting(false);
    }
  }

  function getRewardText() {
    if (!program) return "";
    const suffix = REWARD_TYPE_LABELS[program.rewardType] || "";
    if (program.rewardType === "DISCOUNT_PERCENTAGE") {
      return `${program.rewardValue}% ${suffix}`;
    }
    return `${program.rewardValue} ${suffix}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!available) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Programa No Disponible</h2>
            <p className="text-muted-foreground">
              El programa de referidos no está activo en este momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-7 w-7 text-primary" />
            Recomienda a tu Escuela
          </h1>
          <p className="text-muted-foreground">
            Invita a nuevas familias y gana recompensas
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Banner de Recompensa */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-4 bg-primary/20 rounded-full">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-xl font-bold">
                Gana {getRewardText()}
              </h2>
              <p className="text-muted-foreground">
                {program?.rewardDescription || "Por cada familia que refieras y se inscriba en la escuela"}
              </p>
              {program?.welcomeMessage && (
                <p className="text-sm mt-2 italic">"{program.welcomeMessage}"</p>
              )}
            </div>
            {isEligible && (
              <Button onClick={() => setShowForm(true)} size="lg" className="whitespace-nowrap">
                <UserPlus className="h-5 w-5 mr-2" />
                Referir Ahora
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerta de No Elegible */}
      {!isEligible && eligibilityReason && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <p className="text-yellow-800">{eligibilityReason}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas Personales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Referidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.successful}</p>
            <p className="text-sm text-muted-foreground">Inscritos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">En Proceso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.remainingRewards}</p>
            <p className="text-sm text-muted-foreground">Recompensas Disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulario de Referido */}
      {showForm && isEligible && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Nuevo Referido
            </CardTitle>
            <CardDescription>
              Ingresa los datos de la familia que quieres recomendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nombre del Padre/Tutor *
                  </label>
                  <Input
                    placeholder="Nombre completo"
                    value={formData.referredName}
                    onChange={(e) => setFormData({ ...formData, referredName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono *
                  </label>
                  <Input
                    type="tel"
                    placeholder="55 1234 5678"
                    value={formData.referredPhone}
                    onChange={(e) => setFormData({ ...formData, referredPhone: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email (opcional)
                  </label>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.referredEmail}
                    onChange={(e) => setFormData({ ...formData, referredEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Nombre del Hijo(a) (opcional)
                  </label>
                  <Input
                    placeholder="Nombre del niño/a"
                    value={formData.referredChildName}
                    onChange={(e) => setFormData({ ...formData, referredChildName: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Grado de Interés (opcional)</label>
                  <Input
                    placeholder="Ej: 3ro Primaria"
                    value={formData.referredChildGrade}
                    onChange={(e) => setFormData({ ...formData, referredChildGrade: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notas adicionales (opcional)
                </label>
                <Textarea
                  placeholder="¿Cómo conoces a esta familia? ¿Algún detalle importante?"
                  value={formData.referredNotes}
                  onChange={(e) => setFormData({ ...formData, referredNotes: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Enviar Referido
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Mis Referidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Mis Referidos
          </CardTitle>
          <CardDescription>
            Historial de las familias que has recomendado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myReferrals.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aún no has referido a nadie</p>
              {isEligible && (
                <Button variant="link" onClick={() => setShowForm(true)} className="mt-2">
                  ¡Haz tu primer referido!
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {myReferrals.map((referral) => {
                const statusInfo = STATUS_INFO[referral.status] || STATUS_INFO.PENDING;
                const StatusIcon = statusInfo.icon;
                return (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{referral.referredName}</p>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      {referral.referredChildName && (
                        <p className="text-sm text-muted-foreground">
                          Hijo(a): {referral.referredChildName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Referido el {new Date(referral.createdAt).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                    {referral.reward && (
                      <div className="text-right">
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          <Gift className="h-3 w-3 mr-1" />
                          {referral.reward.isApplied ? "Recompensa Aplicada" : "Recompensa Pendiente"}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
