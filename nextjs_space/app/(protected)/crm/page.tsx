"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Mail, 
  Users, 
  Send, 
  BarChart3, 
  FileText, 
  Plus, 
  Trash2, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Target,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";

interface Stats {
  totalContacts: number;
  totalCampaigns: number;
  totalSegments: number;
  totalTemplates: number;
  emailsSent: number;
  emailsOpened: number;
  openRate: number;
  recentCommunications: number;
  campaignsByStatus: Record<string, number>;
  recentCampaigns: Campaign[];
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  totalRecipients: number;
  deliveredCount: number;
  openedCount: number;
  sentAt: string | null;
  createdAt: string;
  segment?: { name: string } | null;
  createdBy?: { name: string };
}

interface Segment {
  id: string;
  name: string;
  description: string | null;
  userCount: number;
  filters: any;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string | null;
  isDefault: boolean;
  createdAt: string;
}

type TabType = "dashboard" | "campaigns" | "segments" | "templates";

export default function CRMPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  
  // Modal states
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  
  // Form states
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    subject: "",
    content: "",
    segmentId: ""
  });
  const [segmentForm, setSegmentForm] = useState({
    name: "",
    description: "",
    roles: [] as string[]
  });
  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    content: "",
    category: ""
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [session, status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, campaignsRes, segmentsRes, templatesRes] = await Promise.all([
        fetch("/api/crm/stats"),
        fetch("/api/crm/campaigns"),
        fetch("/api/crm/segments"),
        fetch("/api/crm/templates")
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
      if (segmentsRes.ok) setSegments(await segmentsRes.json());
      if (templatesRes.ok) setTemplates(await templatesRes.json());
    } catch (error) {
      console.error("Error fetching CRM data:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject || !campaignForm.content) {
      toast.error("Completa todos los campos");
      return;
    }

    try {
      const res = await fetch("/api/crm/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignForm)
      });

      if (res.ok) {
        const newCampaign = await res.json();
        setCampaigns([newCampaign, ...campaigns]);
        setShowCampaignModal(false);
        setCampaignForm({ name: "", subject: "", content: "", segmentId: "" });
        toast.success("Campaña creada");
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al crear campaña");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const sendCampaign = async (id: string) => {
    setSending(id);
    try {
      const res = await fetch(`/api/crm/campaigns/${id}`, {
        method: "POST"
      });

      if (res.ok) {
        toast.success("Campaña enviada exitosamente");
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al enviar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSending(null);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm("¿Eliminar esta campaña?")) return;

    try {
      const res = await fetch(`/api/crm/campaigns/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setCampaigns(campaigns.filter(c => c.id !== id));
        toast.success("Campaña eliminada");
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const createSegment = async () => {
    if (!segmentForm.name) {
      toast.error("El nombre es requerido");
      return;
    }

    try {
      const res = await fetch("/api/crm/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: segmentForm.name,
          description: segmentForm.description,
          filters: { roles: segmentForm.roles }
        })
      });

      if (res.ok) {
        const newSegment = await res.json();
        setSegments([newSegment, ...segments]);
        setShowSegmentModal(false);
        setSegmentForm({ name: "", description: "", roles: [] });
        toast.success("Segmento creado");
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al crear segmento");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const deleteSegment = async (id: string) => {
    if (!confirm("¿Eliminar este segmento?")) return;

    try {
      const res = await fetch(`/api/crm/segments?id=${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setSegments(segments.filter(s => s.id !== id));
        toast.success("Segmento eliminado");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const createTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.content) {
      toast.error("Completa todos los campos");
      return;
    }

    try {
      const res = await fetch("/api/crm/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateForm)
      });

      if (res.ok) {
        const newTemplate = await res.json();
        setTemplates([newTemplate, ...templates]);
        setShowTemplateModal(false);
        setTemplateForm({ name: "", subject: "", content: "", category: "" });
        toast.success("Plantilla creada");
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al crear plantilla");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("¿Eliminar esta plantilla?")) return;

    try {
      const res = await fetch(`/api/crm/templates?id=${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setTemplates(templates.filter(t => t.id !== id));
        toast.success("Plantilla eliminada");
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-700",
      SCHEDULED: "bg-blue-100 text-blue-700",
      SENDING: "bg-yellow-100 text-yellow-700",
      SENT: "bg-green-100 text-green-700",
      FAILED: "bg-red-100 text-red-700"
    };
    const labels: Record<string, string> = {
      DRAFT: "Borrador",
      SCHEDULED: "Programada",
      SENDING: "Enviando",
      SENT: "Enviada",
      FAILED: "Fallida"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.DRAFT}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Mail className="w-7 h-7 text-[#1B4079]" />
          {t.crm.title}
        </h1>
        <p className="text-gray-500 mt-1">Gestiona la comunicación con familias y contactos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: "dashboard", label: "Dashboard", icon: BarChart3 },
          { key: "campaigns", label: t.crm.campaigns, icon: Send },
          { key: "segments", label: "Segmentos", icon: Target },
          { key: "templates", label: t.crm.templates, icon: FileText }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-[#1B4079] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && stats && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
                  <p className="text-sm text-gray-500">{t.crm.contacts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Send className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.emailsSent}</p>
                  <p className="text-sm text-gray-500">{t.crm.emailsSent}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.openRate}%</p>
                  <p className="text-sm text-gray-500">{t.crm.openRate}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
                  <p className="text-sm text-gray-500">{t.crm.campaigns}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis Link */}
          <Link href="/crm/sentiment">
            <div className="bg-gradient-to-r from-[#1B4079] to-[#4D7C8A] rounded-xl p-5 text-white cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Análisis de Sentimientos</h3>
                    <p className="text-white/80 text-sm">Analiza el tono de las conversaciones con IA</p>
                  </div>
                </div>
                <div className="text-white/60">&rarr;</div>
              </div>
            </div>
          </Link>

          {/* Recent Campaigns */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Campañas Recientes</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.recentCampaigns.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No hay campañas aún
                </div>
              ) : (
                stats.recentCampaigns.map(campaign => (
                  <div key={campaign.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{campaign.name}</p>
                      <p className="text-sm text-gray-500">{campaign.subject}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{campaign.totalRecipients} destinatarios</p>
                        <p className="text-xs text-gray-500">
                          {campaign.sentAt 
                            ? new Date(campaign.sentAt).toLocaleDateString()
                            : new Date(campaign.createdAt).toLocaleDateString()
                          }
                        </p>
                      </div>
                      {getStatusBadge(campaign.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Todas las Campañas</h2>
            <Button onClick={() => setShowCampaignModal(true)} className="bg-[#1B4079] hover:bg-[#4D7C8A]">
              <Plus className="w-4 h-4 mr-2" />
              {t.crm.newCampaign}
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asunto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segmento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinatarios</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No hay campañas. Crea la primera.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map(campaign => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{campaign.name}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{campaign.subject}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{campaign.segment?.name || "Todos"}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{campaign.totalRecipients}</td>
                        <td className="px-4 py-3">{getStatusBadge(campaign.status)}</td>
                        <td className="px-4 py-3 text-gray-500 text-sm">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {campaign.status === "DRAFT" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => sendCampaign(campaign.id)}
                                  disabled={sending === campaign.id}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {sending === campaign.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Send className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteCampaign(campaign.id)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {campaign.status === "SENT" && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Enviada
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Segments Tab */}
      {activeTab === "segments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Segmentos de Audiencia</h2>
            <Button onClick={() => setShowSegmentModal(true)} className="bg-[#1B4079] hover:bg-[#4D7C8A]">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Segmento
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-100">
                No hay segmentos. Crea el primero para segmentar tu audiencia.
              </div>
            ) : (
              segments.map(segment => (
                <div key={segment.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1B4079]/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-[#1B4079]" />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSegment(segment.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{segment.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{segment.description || "Sin descripción"}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-600">
                      <Users className="w-4 h-4 inline mr-1" />
                      {segment.userCount} contactos
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(segment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Plantillas de Email</h2>
            <Button onClick={() => setShowTemplateModal(true)} className="bg-[#1B4079] hover:bg-[#4D7C8A]">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {templates.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-100">
                No hay plantillas. Crea la primera para agilizar tus campañas.
              </div>
            ) : (
              templates.map(template => (
                <div key={template.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500">{template.subject}</p>
                    </div>
                    {!template.isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 max-h-24 overflow-hidden">
                    {template.content.substring(0, 150)}...
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    {template.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {template.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Nueva Campaña</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <Input
                  value={campaignForm.name}
                  onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  placeholder="Ej: Comunicado mensual"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto del email</label>
                <Input
                  value={campaignForm.subject}
                  onChange={e => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                  placeholder="Ej: Información importante para febrero"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Segmento (opcional)</label>
                <select
                  value={campaignForm.segmentId}
                  onChange={e => setCampaignForm({ ...campaignForm, segmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]/20"
                >
                  <option value="">Todos los padres</option>
                  {segments.map(seg => (
                    <option key={seg.id} value={seg.id}>{seg.name} ({seg.userCount})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                <textarea
                  value={campaignForm.content}
                  onChange={e => setCampaignForm({ ...campaignForm, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]/20 resize-none"
                  placeholder="Escribe el contenido del email..."
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowCampaignModal(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={createCampaign} className="bg-[#1B4079] hover:bg-[#4D7C8A]">
                {t.common.create}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Segment Modal */}
      {showSegmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Nuevo Segmento</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <Input
                  value={segmentForm.name}
                  onChange={e => setSegmentForm({ ...segmentForm, name: e.target.value })}
                  placeholder="Ej: Padres de secundaria"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <Input
                  value={segmentForm.description}
                  onChange={e => setSegmentForm({ ...segmentForm, description: e.target.value })}
                  placeholder="Descripción del segmento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por rol</label>
                <div className="space-y-2">
                  {["PADRE", "PROFESOR", "ALUMNO"].map(role => (
                    <label key={role} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={segmentForm.roles.includes(role)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSegmentForm({ ...segmentForm, roles: [...segmentForm.roles, role] });
                          } else {
                            setSegmentForm({ ...segmentForm, roles: segmentForm.roles.filter(r => r !== role) });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        {role === "PADRE" ? "Padres" : role === "PROFESOR" ? "Profesores" : "Alumnos"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowSegmentModal(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={createSegment} className="bg-[#1B4079] hover:bg-[#4D7C8A]">
                {t.common.create}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Nueva Plantilla</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <Input
                  value={templateForm.name}
                  onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="Ej: Recordatorio de pago"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <Input
                  value={templateForm.subject}
                  onChange={e => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  placeholder="Ej: Recordatorio: Pago pendiente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={templateForm.category}
                  onChange={e => setTemplateForm({ ...templateForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]/20"
                >
                  <option value="">Sin categoría</option>
                  <option value="welcome">Bienvenida</option>
                  <option value="reminder">Recordatorio</option>
                  <option value="announcement">Anuncio</option>
                  <option value="payment">Pagos</option>
                  <option value="academic">Académico</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                <textarea
                  value={templateForm.content}
                  onChange={e => setTemplateForm({ ...templateForm, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]/20 resize-none"
                  placeholder="Escribe el contenido de la plantilla..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usa {'{{nombre}}'} para personalizar con el nombre del destinatario
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={createTemplate} className="bg-[#1B4079] hover:bg-[#4D7C8A]">
                {t.common.create}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
