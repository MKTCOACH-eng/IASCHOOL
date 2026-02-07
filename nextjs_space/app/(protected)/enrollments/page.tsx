"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UserPlus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  Mail,
  Phone,
  Loader2,
  Eye,
  ChevronDown,
  Users,
  GraduationCap
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Enrollment {
  id: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  relationship: string;
  studentName: string;
  studentBirthDate: string;
  studentGender: string | null;
  currentSchool: string | null;
  currentGrade: string | null;
  requestedGrade: string;
  requestedYear: number;
  siblings: string | null;
  howDidYouHear: string | null;
  specialNeeds: string | null;
  comments: string | null;
  status: string;
  priority: number;
  interviewDate: string | null;
  interviewNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: { name: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  REVIEWING: { label: 'En revisión', color: 'bg-blue-100 text-blue-700', icon: FileText },
  DOCUMENTS: { label: 'Documentos', color: 'bg-orange-100 text-orange-700', icon: FileText },
  INTERVIEW: { label: 'Entrevista', color: 'bg-purple-100 text-purple-700', icon: Calendar },
  ACCEPTED: { label: 'Aceptado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: XCircle },
  WAITLIST: { label: 'Lista de espera', color: 'bg-gray-100 text-gray-700', icon: Users },
  ENROLLED: { label: 'Inscrito', color: 'bg-emerald-100 text-emerald-700', icon: GraduationCap },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500', icon: XCircle }
};

export default function EnrollmentsPage() {
  const { data: session, status: sessionStatus } = useSession() || {};
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [showDetail, setShowDetail] = useState<Enrollment | null>(null);
  const [updating, setUpdating] = useState(false);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      router.push('/dashboard');
      return;
    }
    fetchEnrollments();
  }, [session, sessionStatus, userRole]);

  const fetchEnrollments = async () => {
    try {
      const res = await fetch('/api/enrollments');
      if (res.ok) {
        setEnrollments(await res.json());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string, extra?: any) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/enrollments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...extra })
      });
      
      if (res.ok) {
        toast.success('Estado actualizado');
        fetchEnrollments();
        if (showDetail?.id === id) {
          const updated = await res.json();
          setShowDetail({ ...showDetail, ...updated });
        }
      } else {
        toast.error('Error al actualizar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setUpdating(false);
    }
  };

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = 
      e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.parentEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    const matchesYear = filterYear === 'all' || e.requestedYear.toString() === filterYear;
    return matchesSearch && matchesStatus && matchesYear;
  });

  const stats = {
    total: enrollments.length,
    pending: enrollments.filter(e => ['PENDING', 'REVIEWING'].includes(e.status)).length,
    accepted: enrollments.filter(e => e.status === 'ACCEPTED').length,
    enrolled: enrollments.filter(e => e.status === 'ENROLLED').length
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const years = [...new Set(enrollments.map(e => e.requestedYear))].sort((a, b) => b - a);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Inscripción</h1>
        <p className="text-gray-500">Gestiona las solicitudes de nuevos alumnos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total solicitudes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-sm text-gray-500">Aceptados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-emerald-600">{stats.enrolled}</p>
            <p className="text-sm text-gray-500">Inscritos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Enrollments List */}
      {filteredEnrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserPlus className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin solicitudes</h3>
            <p className="text-gray-500">No hay solicitudes que coincidan con los filtros</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEnrollments.map((enrollment, index) => {
            const statusConfig = STATUS_CONFIG[enrollment.status];
            const StatusIcon = statusConfig?.icon || Clock;
            
            return (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{enrollment.studentName}</h3>
                            <Badge className={statusConfig?.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig?.label}
                            </Badge>
                            <Badge variant="outline">{enrollment.requestedGrade}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            {calculateAge(enrollment.studentBirthDate)} años • Ciclo {enrollment.requestedYear}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {enrollment.parentName} ({enrollment.relationship})
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {enrollment.parentEmail}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(enrollment.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDetail(enrollment)}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Button>
                        
                        {['PENDING', 'REVIEWING', 'DOCUMENTS', 'INTERVIEW', 'WAITLIST'].includes(enrollment.status) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" className="gap-1 text-white">
                                Cambiar estado
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {enrollment.status === 'PENDING' && (
                                <DropdownMenuItem onClick={() => updateStatus(enrollment.id, 'REVIEWING')}>
                                  Marcar en revisión
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => updateStatus(enrollment.id, 'DOCUMENTS')}>
                                Solicitar documentos
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(enrollment.id, 'INTERVIEW')}>
                                Agendar entrevista
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(enrollment.id, 'WAITLIST')}>
                                Lista de espera
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateStatus(enrollment.id, 'ACCEPTED')}
                                className="text-green-600"
                              >
                                Aceptar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  const reason = prompt('Motivo del rechazo:');
                                  if (reason) updateStatus(enrollment.id, 'REJECTED', { rejectionReason: reason });
                                }}
                                className="text-red-600"
                              >
                                Rechazar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        
                        {enrollment.status === 'ACCEPTED' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(enrollment.id, 'ENROLLED')}
                            className="gap-1 text-white bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Finalizar inscripción
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Solicitud</DialogTitle>
          </DialogHeader>
          {showDetail && (
            <div className="space-y-6">
              {/* Student Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Datos del Estudiante</h4>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Nombre</p>
                    <p className="font-medium">{showDetail.studentName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha de nacimiento</p>
                    <p className="font-medium">
                      {formatDate(showDetail.studentBirthDate)} ({calculateAge(showDetail.studentBirthDate)} años)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Género</p>
                    <p className="font-medium">{showDetail.studentGender || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Grado solicitado</p>
                    <p className="font-medium">{showDetail.requestedGrade} - Ciclo {showDetail.requestedYear}</p>
                  </div>
                  {showDetail.currentSchool && (
                    <div>
                      <p className="text-xs text-gray-500">Escuela actual</p>
                      <p className="font-medium">{showDetail.currentSchool}</p>
                    </div>
                  )}
                  {showDetail.currentGrade && (
                    <div>
                      <p className="text-xs text-gray-500">Grado actual</p>
                      <p className="font-medium">{showDetail.currentGrade}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Parent Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Datos del Padre/Tutor</h4>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Nombre</p>
                    <p className="font-medium">{showDetail.parentName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Relación</p>
                    <p className="font-medium capitalize">{showDetail.relationship}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a href={`mailto:${showDetail.parentEmail}`} className="font-medium text-primary hover:underline">
                      {showDetail.parentEmail}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <a href={`tel:${showDetail.parentPhone}`} className="font-medium text-primary hover:underline">
                      {showDetail.parentPhone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(showDetail.siblings || showDetail.howDidYouHear || showDetail.specialNeeds || showDetail.comments) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Información Adicional</h4>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    {showDetail.siblings && (
                      <div>
                        <p className="text-xs text-gray-500">Hermanos en la escuela</p>
                        <p className="text-sm">{showDetail.siblings}</p>
                      </div>
                    )}
                    {showDetail.howDidYouHear && (
                      <div>
                        <p className="text-xs text-gray-500">¿Cómo nos conoció?</p>
                        <p className="text-sm">{showDetail.howDidYouHear}</p>
                      </div>
                    )}
                    {showDetail.specialNeeds && (
                      <div>
                        <p className="text-xs text-gray-500">Necesidades especiales</p>
                        <p className="text-sm">{showDetail.specialNeeds}</p>
                      </div>
                    )}
                    {showDetail.comments && (
                      <div>
                        <p className="text-xs text-gray-500">Comentarios</p>
                        <p className="text-sm">{showDetail.comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Info */}
              {(showDetail.rejectionReason || showDetail.interviewNotes) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notas del Proceso</h4>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    {showDetail.rejectionReason && (
                      <div>
                        <p className="text-xs text-red-500">Motivo de rechazo</p>
                        <p className="text-sm">{showDetail.rejectionReason}</p>
                      </div>
                    )}
                    {showDetail.interviewNotes && (
                      <div>
                        <p className="text-xs text-gray-500">Notas de entrevista</p>
                        <p className="text-sm">{showDetail.interviewNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetail(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
