'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Mail,
  FileText,
  Plus,
  Send,
  Clock,
  CheckCircle,
  Trash2,
  Edit,
  Eye,
  Loader2,
  Filter,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react';

interface Segment {
  id: string;
  name: string;
  description: string | null;
  filters: Record<string, unknown>;
  userCount: number;
  isActive: boolean;
  createdAt: string;
  _count: { campaigns: number };
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  totalRecipients: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  createdAt: string;
  segment: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
  _count: { recipients: number };
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

interface Group {
  id: string;
  name: string;
}

export default function CRMPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'segments' | 'campaigns' | 'templates'>('campaigns');
  const [loading, setLoading] = useState(true);
  
  // Estado para segmentos
  const [segments, setSegments] = useState<Segment[]>([]);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [segmentForm, setSegmentForm] = useState({ name: '', description: '', roles: [] as string[], groupIds: [] as string[] });
  
  // Estado para campañas
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    content: '',
    segmentId: '',
    scheduledAt: '',
    sendNow: false
  });
  
  // Estado para plantillas
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    id: '',
    name: '',
    subject: '',
    content: '',
    category: '',
    isDefault: false
  });
  
  // Grupos para filtros
  const [groups, setGroups] = useState<Group[]>([]);
  
  const [submitting, setSubmitting] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;

  // Verificar acceso
  useEffect(() => {
    if (session && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [session, user?.role, router]);

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [segmentsRes, campaignsRes, templatesRes, groupsRes] = await Promise.all([
        fetch('/api/crm/segments'),
        fetch('/api/crm/campaigns'),
        fetch('/api/crm/templates'),
        fetch('/api/groups')
      ]);

      if (segmentsRes.ok) {
        const data = await segmentsRes.json();
        setSegments(data.segments || []);
      }
      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setCampaigns(data.campaigns || []);
      }
      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates || []);
      }
      if (groupsRes.ok) {
        const data = await groupsRes.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Crear segmento
  const handleCreateSegment = async () => {
    if (!segmentForm.name) {
      toast.error('El nombre es requerido');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/crm/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: segmentForm.name,
          description: segmentForm.description,
          filters: {
            roles: segmentForm.roles,
            groupIds: segmentForm.groupIds
          }
        })
      });
      if (res.ok) {
        toast.success('Segmento creado');
        setShowSegmentModal(false);
        setSegmentForm({ name: '', description: '', roles: [], groupIds: [] });
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Error al crear segmento');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  // Crear campaña
  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject || !campaignForm.content) {
      toast.error('Nombre, asunto y contenido son requeridos');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/crm/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...campaignForm,
          segmentId: campaignForm.segmentId || null
        })
      });
      if (res.ok) {
        toast.success(campaignForm.sendNow ? 'Campaña enviada' : 'Campaña creada');
        setShowCampaignModal(false);
        setCampaignForm({ name: '', subject: '', content: '', segmentId: '', scheduledAt: '', sendNow: false });
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Error al crear campaña');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  // Crear/Actualizar plantilla
  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.content) {
      toast.error('Nombre, asunto y contenido son requeridos');
      return;
    }
    setSubmitting(true);
    try {
      const method = templateForm.id ? 'PUT' : 'POST';
      const res = await fetch('/api/crm/templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      });
      if (res.ok) {
        toast.success(templateForm.id ? 'Plantilla actualizada' : 'Plantilla creada');
        setShowTemplateModal(false);
        setTemplateForm({ id: '', name: '', subject: '', content: '', category: '', isDefault: false });
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Error al guardar plantilla');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar segmento
  const handleDeleteSegment = async (id: string) => {
    if (!confirm('¿Eliminar este segmento?')) return;
    try {
      const res = await fetch(`/api/crm/segments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Segmento eliminado');
        fetchData();
      }
    } catch {
      toast.error('Error al eliminar');
    }
  };

  // Eliminar campaña
  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('¿Eliminar esta campaña?')) return;
    try {
      const res = await fetch(`/api/crm/campaigns?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Campaña eliminada');
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Error al eliminar');
      }
    } catch {
      toast.error('Error al eliminar');
    }
  };

  // Eliminar plantilla
  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('¿Eliminar esta plantilla?')) return;
    try {
      const res = await fetch(`/api/crm/templates?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Plantilla eliminada');
        fetchData();
      }
    } catch {
      toast.error('Error al eliminar');
    }
  };

  // Usar plantilla en campaña
  const useTemplateInCampaign = (template: Template) => {
    setCampaignForm(prev => ({
      ...prev,
      subject: template.subject,
      content: template.content
    }));
    setShowCampaignModal(true);
    toast.success('Plantilla aplicada');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700',
      SCHEDULED: 'bg-blue-100 text-blue-700',
      SENDING: 'bg-yellow-100 text-yellow-700',
      SENT: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700'
    };
    const labels: Record<string, string> = {
      DRAFT: 'Borrador',
      SCHEDULED: 'Programada',
      SENDING: 'Enviando',
      SENT: 'Enviada',
      CANCELLED: 'Cancelada'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">CRM y Comunicación</h1>
        <p className="text-gray-600 mt-1">Gestiona segmentos, campañas de email y plantillas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'campaigns'
              ? 'border-[#1B4079] text-[#1B4079]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Mail className="w-5 h-5" />
          Campañas
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {campaigns.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('segments')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'segments'
              ? 'border-[#1B4079] text-[#1B4079]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-5 h-5" />
          Segmentos
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {segments.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'templates'
              ? 'border-[#1B4079] text-[#1B4079]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-5 h-5" />
          Plantillas
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {templates.length}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border">
        {/* Campañas Tab */}
        {activeTab === 'campaigns' && (
          <div>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Campañas de Email</h2>
              <Button onClick={() => setShowCampaignModal(true)} className="bg-[#1B4079]">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Campaña
              </Button>
            </div>
            
            {campaigns.length === 0 ? (
              <div className="p-12 text-center">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay campañas creadas</p>
                <Button
                  onClick={() => setShowCampaignModal(true)}
                  variant="outline"
                  className="mt-4"
                >
                  Crear primera campaña
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{campaign.subject}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {campaign.segment && (
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {campaign.segment.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {campaign.totalRecipients} destinatarios
                          </span>
                          {campaign.status === 'SENT' && (
                            <>
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {campaign.deliveredCount} entregados
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {campaign.openedCount} abiertos
                              </span>
                            </>
                          )}
                          {campaign.scheduledAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(campaign.scheduledAt).toLocaleString('es-MX')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {campaign.status === 'SENT' && (
                          <Button variant="ghost" size="sm">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        )}
                        {campaign.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Segmentos Tab */}
        {activeTab === 'segments' && (
          <div>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Segmentos de Usuarios</h2>
              <Button onClick={() => setShowSegmentModal(true)} className="bg-[#1B4079]">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Segmento
              </Button>
            </div>
            
            {segments.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay segmentos creados</p>
                <Button
                  onClick={() => setShowSegmentModal(true)}
                  variant="outline"
                  className="mt-4"
                >
                  Crear primer segmento
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {segments.map(segment => (
                  <div key={segment.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{segment.name}</h3>
                        {segment.description && (
                          <p className="text-sm text-gray-500 mt-1">{segment.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {segment.userCount} usuarios
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {segment._count.campaigns} campañas
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSegment(segment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Plantillas Tab */}
        {activeTab === 'templates' && (
          <div>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Plantillas de Email</h2>
              <Button onClick={() => setShowTemplateModal(true)} className="bg-[#1B4079]">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Plantilla
              </Button>
            </div>
            
            {templates.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay plantillas creadas</p>
                <Button
                  onClick={() => setShowTemplateModal(true)}
                  variant="outline"
                  className="mt-4"
                >
                  Crear primera plantilla
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {templates.map(template => (
                  <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        {template.isDefault && (
                          <span className="text-xs bg-[#CBDF90] text-[#1B4079] px-2 py-0.5 rounded-full">
                            Por defecto
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTemplateForm({
                              id: template.id,
                              name: template.name,
                              subject: template.subject,
                              content: template.content,
                              category: template.category || '',
                              isDefault: template.isDefault
                            });
                            setShowTemplateModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-1">{template.subject}</p>
                    {template.category && (
                      <span className="text-xs text-gray-400 mt-2 inline-block">
                        {template.category}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => useTemplateInCampaign(template)}
                    >
                      <Send className="w-3 h-3 mr-2" />
                      Usar en campaña
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Segmento */}
      {showSegmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Nuevo Segmento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <Input
                  value={segmentForm.name}
                  onChange={e => setSegmentForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Padres con pagos pendientes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <Input
                  value={segmentForm.description}
                  onChange={e => setSegmentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del segmento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Filtrar por rol</label>
                <div className="flex flex-wrap gap-2">
                  {['PADRE', 'PROFESOR', 'ALUMNO'].map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setSegmentForm(prev => ({
                          ...prev,
                          roles: prev.roles.includes(role)
                            ? prev.roles.filter(r => r !== role)
                            : [...prev.roles, role]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        segmentForm.roles.includes(role)
                          ? 'bg-[#1B4079] text-white border-[#1B4079]'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {role === 'PADRE' ? 'Padres' : role === 'PROFESOR' ? 'Profesores' : 'Alumnos'}
                    </button>
                  ))}
                </div>
              </div>
              {groups.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Filtrar por grupo</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {groups.map(group => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => {
                          setSegmentForm(prev => ({
                            ...prev,
                            groupIds: prev.groupIds.includes(group.id)
                              ? prev.groupIds.filter(id => id !== group.id)
                              : [...prev.groupIds, group.id]
                          }));
                        }}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          segmentForm.groupIds.includes(group.id)
                            ? 'bg-[#1B4079] text-white border-[#1B4079]'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {group.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSegmentModal(false);
                  setSegmentForm({ name: '', description: '', roles: [], groupIds: [] });
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateSegment} disabled={submitting} className="bg-[#1B4079]">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Segmento'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Campaña */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Nueva Campaña</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la campaña *</label>
                <Input
                  value={campaignForm.name}
                  onChange={e => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Recordatorio de pagos febrero"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Asunto del email *</label>
                <Input
                  value={campaignForm.subject}
                  onChange={e => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Ej: Recordatorio importante de pagos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Segmento de destinatarios</label>
                <select
                  value={campaignForm.segmentId}
                  onChange={e => setCampaignForm(prev => ({ ...prev, segmentId: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Todos los usuarios</option>
                  {segments.map(segment => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name} ({segment.userCount} usuarios)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contenido del email *</label>
                <textarea
                  value={campaignForm.content}
                  onChange={e => setCampaignForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escribe el contenido del email. Puedes usar {{nombre}} para personalizar."
                  className="w-full border rounded-lg px-3 py-2 min-h-[200px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usa <code className="bg-gray-100 px-1 rounded">{'{{'} nombre {'}}'}</code> para insertar el nombre del destinatario
                </p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={campaignForm.sendNow}
                    onChange={e => setCampaignForm(prev => ({ ...prev, sendNow: e.target.checked, scheduledAt: '' }))}
                    className="rounded"
                  />
                  <span className="text-sm">Enviar inmediatamente</span>
                </label>
              </div>
              {!campaignForm.sendNow && (
                <div>
                  <label className="block text-sm font-medium mb-1">Programar envío (opcional)</label>
                  <Input
                    type="datetime-local"
                    value={campaignForm.scheduledAt}
                    onChange={e => setCampaignForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCampaignModal(false);
                  setCampaignForm({ name: '', subject: '', content: '', segmentId: '', scheduledAt: '', sendNow: false });
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateCampaign} disabled={submitting} className="bg-[#1B4079]">
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : campaignForm.sendNow ? (
                  <><Send className="w-4 h-4 mr-2" /> Enviar Ahora</>
                ) : (
                  <><Clock className="w-4 h-4 mr-2" /> Guardar</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Plantilla */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {templateForm.id ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <Input
                  value={templateForm.name}
                  onChange={e => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Bienvenida nuevos padres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Asunto *</label>
                <Input
                  value={templateForm.subject}
                  onChange={e => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Ej: ¡Bienvenido a IA School!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select
                  value={templateForm.category}
                  onChange={e => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Sin categoría</option>
                  <option value="welcome">Bienvenida</option>
                  <option value="reminder">Recordatorio</option>
                  <option value="announcement">Anuncio</option>
                  <option value="payment">Pagos</option>
                  <option value="event">Eventos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contenido *</label>
                <textarea
                  value={templateForm.content}
                  onChange={e => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escribe el contenido del email..."
                  className="w-full border rounded-lg px-3 py-2 min-h-[200px]"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={templateForm.isDefault}
                  onChange={e => setTemplateForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Establecer como plantilla por defecto de su categoría</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTemplateModal(false);
                  setTemplateForm({ id: '', name: '', subject: '', content: '', category: '', isDefault: false });
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveTemplate} disabled={submitting} className="bg-[#1B4079]">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Plantilla'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
