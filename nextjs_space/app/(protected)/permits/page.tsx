"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  User,
  AlertTriangle,
  Stethoscope,
  LogOut,
  Camera,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";

interface Permit {
  id: string;
  type: string;
  status: string;
  title: string;
  reason: string;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewNotes: string | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    group: { name: string } | null;
  };
  createdBy: { name: string };
  reviewedBy: { name: string } | null;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

const PERMIT_TYPES = [
  { value: 'ABSENCE', label: 'Justificante de ausencia', icon: AlertTriangle },
  { value: 'EARLY_EXIT', label: 'Salida temprana', icon: LogOut },
  { value: 'LATE_ARRIVAL', label: 'Llegada tarde', icon: Clock },
  { value: 'MEDICAL', label: 'Permiso médico', icon: Stethoscope },
  { value: 'FIELD_TRIP', label: 'Autorización salida escolar', icon: MapPin },
  { value: 'PHOTO_VIDEO', label: 'Autorización foto/video', icon: Camera },
  { value: 'OTHER', label: 'Otro', icon: FileText }
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  APPROVED: { label: 'Aprobado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: XCircle },
  EXPIRED: { label: 'Expirado', color: 'bg-gray-100 text-gray-500', icon: AlertTriangle }
};

export default function PermitsPage() {
  const { data: session } = useSession() || {};
  const [permits, setPermits] = useState<Permit[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showReview, setShowReview] = useState<Permit | null>(null);
  const [creating, setCreating] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [filter, setFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    studentId: '',
    type: 'ABSENCE',
    title: '',
    reason: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: ''
  });
  
  const [reviewData, setReviewData] = useState({
    status: 'APPROVED',
    reviewNotes: ''
  });
  
  const userRole = (session?.user as any)?.role;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'PROFESOR'].includes(userRole);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [permitsRes, studentsRes] = await Promise.all([
        fetch('/api/permits'),
        fetch('/api/academic/students')
      ]);
      
      if (permitsRes.ok) {
        setPermits(await permitsRes.json());
      }
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data.students || data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.studentId || !formData.title || !formData.reason || !formData.startDate) {
      toast.error('Completa todos los campos requeridos');
      return;
    }
    
    setCreating(true);
    try {
      const res = await fetch('/api/permits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success('Permiso enviado correctamente');
        setShowCreate(false);
        setFormData({
          studentId: '',
          type: 'ABSENCE',
          title: '',
          reason: '',
          startDate: '',
          endDate: '',
          startTime: '',
          endTime: ''
        });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al crear');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setCreating(false);
    }
  };

  const handleReview = async () => {
    if (!showReview) return;
    
    setReviewing(true);
    try {
      const res = await fetch(`/api/permits/${showReview.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      
      if (res.ok) {
        toast.success(`Permiso ${reviewData.status === 'APPROVED' ? 'aprobado' : 'rechazado'}`);
        setShowReview(null);
        fetchData();
      } else {
        toast.error('Error al procesar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setReviewing(false);
    }
  };

  const filteredPermits = permits.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permisos y Justificantes</h1>
          <p className="text-gray-500">Solicita y gestiona permisos escolares</p>
        </div>
        {userRole === 'PADRE' && (
          <Button onClick={() => setShowCreate(true)} className="gap-2 text-white">
            <Plus className="w-4 h-4" />
            Nuevo Permiso
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? 'text-white' : ''}
          >
            {f === 'all' ? 'Todos' : STATUS_CONFIG[f]?.label}
          </Button>
        ))}
      </div>

      {/* Permits List */}
      {filteredPermits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin permisos</h3>
            <p className="text-gray-500">
              {userRole === 'PADRE' 
                ? 'Solicita un permiso cuando tu hijo necesite ausentarse' 
                : 'No hay permisos pendientes de revisar'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPermits.map((permit, index) => {
            const typeConfig = PERMIT_TYPES.find(t => t.value === permit.type);
            const statusConfig = STATUS_CONFIG[permit.status];
            const TypeIcon = typeConfig?.icon || FileText;
            const StatusIcon = statusConfig?.icon || Clock;
            
            return (
              <motion.div
                key={permit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <TypeIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{permit.title}</h3>
                            <Badge className={statusConfig?.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig?.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{permit.reason}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {permit.student.firstName} {permit.student.lastName}
                              {permit.student.group && ` (${permit.student.group.name})`}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(permit.startDate)}
                              {permit.endDate && ` - ${formatDate(permit.endDate)}`}
                            </span>
                            {permit.startTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {permit.startTime}{permit.endTime && ` - ${permit.endTime}`}
                              </span>
                            )}
                          </div>
                          {permit.reviewNotes && (
                            <p className="mt-2 text-sm text-gray-500 italic">
                              Nota: {permit.reviewNotes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {isAdmin && permit.status === 'PENDING' && (
                        <Button
                          onClick={() => {
                            setShowReview(permit);
                            setReviewData({ status: 'APPROVED', reviewNotes: '' });
                          }}
                          className="text-white"
                        >
                          Revisar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Solicitar Permiso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Estudiante *</label>
              <Select
                value={formData.studentId}
                onValueChange={(v) => setFormData({ ...formData, studentId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo de permiso *</label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERMIT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Título *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Cita médica"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Motivo *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Describe el motivo del permiso"
                className="w-full px-3 py-2 border rounded-lg text-sm min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Fecha inicio *</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Fecha fin</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            
            {['EARLY_EXIT', 'LATE_ARRIVAL'].includes(formData.type) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Hora inicio</label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Hora fin</label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={creating} className="text-white">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Solicitud'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={!!showReview} onOpenChange={() => setShowReview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Revisar Permiso</DialogTitle>
          </DialogHeader>
          {showReview && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{showReview.title}</p>
                <p className="text-sm text-gray-600 mt-1">{showReview.reason}</p>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Estudiante:</strong> {showReview.student.firstName} {showReview.student.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Fecha:</strong> {formatDate(showReview.startDate)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Decisión</label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={reviewData.status === 'APPROVED' ? 'default' : 'outline'}
                    onClick={() => setReviewData({ ...reviewData, status: 'APPROVED' })}
                    className={`flex-1 gap-2 ${reviewData.status === 'APPROVED' ? 'text-white bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprobar
                  </Button>
                  <Button
                    variant={reviewData.status === 'REJECTED' ? 'default' : 'outline'}
                    onClick={() => setReviewData({ ...reviewData, status: 'REJECTED' })}
                    className={`flex-1 gap-2 ${reviewData.status === 'REJECTED' ? 'text-white bg-red-600 hover:bg-red-700' : ''}`}
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Nota (opcional)</label>
                <textarea
                  value={reviewData.reviewNotes}
                  onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })}
                  placeholder="Agrega una nota para el padre"
                  className="w-full px-3 py-2 border rounded-lg text-sm min-h-[60px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReview(null)}>
              Cancelar
            </Button>
            <Button onClick={handleReview} disabled={reviewing} className="text-white">
              {reviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
