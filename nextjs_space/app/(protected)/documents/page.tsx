'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  FileSignature,
  Search,
  Filter,
  Loader2,
  Eye,
  Trash2,
  Send,
  Users,
  XCircle
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  targetRole: string | null;
  expiresAt: string | null;
  createdAt: string;
  userSigned: boolean;
  signatureCount: number;
  createdBy: {
    id: string;
    name: string;
  };
  group: {
    id: string;
    name: string;
  } | null;
}

interface Group {
  id: string;
  name: string;
}

const DOCUMENT_TYPES = [
  { value: 'PERMISO', label: 'Permiso' },
  { value: 'AUTORIZACION', label: 'Autorización' },
  { value: 'REGLAMENTO', label: 'Reglamento' },
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'CONSTANCIA', label: 'Constancia' },
  { value: 'CIRCULAR', label: 'Circular' },
  { value: 'OTRO', label: 'Otro' },
];

const ROLES = [
  { value: '', label: 'Todos los roles' },
  { value: 'PADRE', label: 'Padres' },
  { value: 'PROFESOR', label: 'Profesores' },
  { value: 'ALUMNO', label: 'Alumnos' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: <FileText className="h-4 w-4" /> },
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-4 w-4" /> },
  PARTIALLY_SIGNED: { label: 'Firmado parcial', color: 'bg-blue-100 text-blue-700', icon: <FileSignature className="h-4 w-4" /> },
  COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-4 w-4" /> },
  EXPIRED: { label: 'Expirado', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="h-4 w-4" /> },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500', icon: <XCircle className="h-4 w-4" /> },
};

export default function DocumentsPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    type: 'AUTORIZACION',
    targetRole: '',
    groupId: '',
    expiresAt: '',
    status: 'DRAFT'
  });

  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

  useEffect(() => {
    fetchDocuments();
    if (isAdmin) {
      fetchGroups();
    }
  }, [activeTab]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab === 'pending') params.append('view', 'pending');
      
      const res = await fetch(`/api/documents?${params}`);
      if (!res.ok) throw new Error('Error al cargar documentos');
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups/my-groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleCreateDocument = async (publish: boolean) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Título y contenido son requeridos');
      return;
    }

    try {
      setCreating(true);
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: publish ? 'PENDING' : 'DRAFT',
          targetRole: formData.targetRole || null,
          groupId: formData.groupId || null,
          expiresAt: formData.expiresAt || null
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear documento');
      }

      toast.success(publish ? 'Documento publicado exitosamente' : 'Borrador guardado');
      setIsDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        content: '',
        type: 'AUTORIZACION',
        targetRole: '',
        groupId: '',
        expiresAt: '',
        status: 'DRAFT'
      });
      fetchDocuments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear documento');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al eliminar');
      }
      toast.success('Documento eliminado');
      fetchDocuments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
    }
  };

  const handlePublishDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PENDING' })
      });

      if (!res.ok) throw new Error('Error al publicar');
      toast.success('Documento publicado');
      fetchDocuments();
    } catch {
      toast.error('Error al publicar documento');
    }
  };

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !filterStatus || doc.status === filterStatus;
    const matchesType = !filterType || doc.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = documents.filter(d => !d.userSigned && d.status !== 'COMPLETED' && d.status !== 'DRAFT').length;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Gestiona documentos institucionales' : 'Firma y consulta documentos'}
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1B4079] hover:bg-[#143156]">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Documento</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Autorización Salida Educativa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descripción del documento"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Documento</label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha Límite</label>
                    <Input
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Destinatarios (Rol)</label>
                    <Select
                      value={formData.targetRole}
                      onValueChange={(value) => setFormData({ ...formData, targetRole: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map(role => (
                          <SelectItem key={role.value || 'all'} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Grupo Específico</label>
                    <Select
                      value={formData.groupId}
                      onValueChange={(value) => setFormData({ ...formData, groupId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los grupos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los grupos</SelectItem>
                        {groups.map(group => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contenido del Documento *</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Escriba el contenido completo del documento que debe ser firmado..."
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Puedes usar HTML básico para formato</p>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleCreateDocument(false)}
                    disabled={creating}
                  >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Guardar Borrador
                  </Button>
                  <Button
                    onClick={() => handleCreateDocument(true)}
                    disabled={creating}
                    className="bg-[#1B4079] hover:bg-[#143156]"
                  >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Publicar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-[#1B4079] text-[#1B4079]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Todos los documentos
        </button>
        {!isAdmin && (
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'border-[#1B4079] text-[#1B4079]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pendientes de firma
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {isAdmin && (
          <>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                {DOCUMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
          <p className="text-gray-500">
            {activeTab === 'pending'
              ? 'No tienes documentos pendientes de firma'
              : isAdmin
                ? 'Crea tu primer documento'
                : 'No hay documentos disponibles'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((doc) => {
            const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.DRAFT;
            const typeLabel = DOCUMENT_TYPES.find(t => t.value === doc.type)?.label || doc.type;

            return (
              <div
                key={doc.id}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {typeLabel}
                      </span>
                      {doc.userSigned && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          <CheckCircle className="h-3 w-3" />
                          Firmado
                        </span>
                      )}
                    </div>

                    <Link href={`/documents/${doc.id}`} className="block">
                      <h3 className="font-semibold text-gray-900 hover:text-[#1B4079] transition-colors">
                        {doc.title}
                      </h3>
                    </Link>

                    {doc.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {doc.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {doc.signatureCount} {doc.signatureCount === 1 ? 'firma' : 'firmas'}
                      </span>
                      {doc.group && (
                        <span>Grupo: {doc.group.name}</span>
                      )}
                      {doc.targetRole && (
                        <span>Para: {ROLES.find(r => r.value === doc.targetRole)?.label || doc.targetRole}</span>
                      )}
                      {doc.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Vence: {new Date(doc.expiresAt).toLocaleDateString('es-MX')}
                        </span>
                      )}
                      <span>
                        Creado: {new Date(doc.createdAt).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/documents/${doc.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        {doc.status !== 'DRAFT' && !doc.userSigned && doc.status !== 'COMPLETED' ? 'Firmar' : 'Ver'}
                      </Button>
                    </Link>

                    {isAdmin && doc.status === 'DRAFT' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePublishDocument(doc.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
