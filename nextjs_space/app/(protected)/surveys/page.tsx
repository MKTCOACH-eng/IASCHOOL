"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Plus,
  BarChart3,
  Users,
  Star,
  CheckCircle,
  Clock,
  Loader2,
  ChevronRight,
  Send,
  Trash2,
  Edit,
  Archive
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
import { toast } from "sonner";

interface Survey {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  isAnonymous: boolean;
  responseCount: number;
  averageScore: number | null;
  targetRoles: string[];
  createdAt: string;
  createdBy: { name: string };
  _count: { responses: number };
  responses?: Array<{ id: string }>;
}

const SURVEY_TYPES = [
  { value: 'NPS', label: 'NPS (0-10)', icon: BarChart3 },
  { value: 'SATISFACTION', label: 'Satisfacción (1-5⭐)', icon: Star },
  { value: 'FEEDBACK', label: 'Feedback libre', icon: Users },
  { value: 'POLL', label: 'Votación', icon: CheckCircle }
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
  ACTIVE: { label: 'Activa', color: 'bg-green-100 text-green-700' },
  CLOSED: { label: 'Cerrada', color: 'bg-blue-100 text-blue-700' },
  ARCHIVED: { label: 'Archivada', color: 'bg-gray-100 text-gray-500' }
};

export default function SurveysPage() {
  const { data: session } = useSession() || {};
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showRespond, setShowRespond] = useState<Survey | null>(null);
  const [creating, setCreating] = useState(false);
  const [responding, setResponding] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'SATISFACTION',
    isAnonymous: true,
    targetRoles: ['PADRE']
  });
  
  // Response state
  const [responseScore, setResponseScore] = useState<number | null>(null);
  
  const userRole = (session?.user as any)?.role;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userRole);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const res = await fetch('/api/surveys');
      if (res.ok) {
        const data = await res.json();
        setSurveys(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      return;
    }
    
    setCreating(true);
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          questions: formData.type === 'NPS' 
            ? [{ id: '1', text: '¿Qué tan probable es que recomiende nuestra escuela?', type: 'rating' }]
            : [{ id: '1', text: '¿Qué tan satisfecho está con nuestros servicios?', type: 'rating' }],
          status: 'ACTIVE'
        })
      });
      
      if (res.ok) {
        toast.success('Encuesta creada y publicada');
        setShowCreate(false);
        setFormData({ title: '', description: '', type: 'SATISFACTION', isAnonymous: true, targetRoles: ['PADRE'] });
        fetchSurveys();
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

  const handleRespond = async () => {
    if (responseScore === null) {
      toast.error('Selecciona una calificación');
      return;
    }
    
    setResponding(true);
    try {
      const res = await fetch(`/api/surveys/${showRespond?.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: { '1': responseScore },
          score: responseScore
        })
      });
      
      if (res.ok) {
        toast.success('¡Gracias por tu respuesta!');
        setShowRespond(null);
        setResponseScore(null);
        fetchSurveys();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al enviar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setResponding(false);
    }
  };

  const updateSurveyStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/surveys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success('Estado actualizado');
        fetchSurveys();
      }
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const deleteSurvey = async (id: string) => {
    if (!confirm('¿Eliminar esta encuesta?')) return;
    
    try {
      const res = await fetch(`/api/surveys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Encuesta eliminada');
        fetchSurveys();
      }
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const canRespond = (survey: Survey) => {
    return survey.status === 'ACTIVE' && 
           (!survey.responses || survey.responses.length === 0);
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
          <h1 className="text-2xl font-bold text-gray-900">Encuestas</h1>
          <p className="text-gray-500">Mide la satisfacción de padres y comunidad escolar</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)} className="gap-2 text-white">
            <Plus className="w-4 h-4" />
            Nueva Encuesta
          </Button>
        )}
      </div>

      {/* Survey List */}
      {surveys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin encuestas</h3>
            <p className="text-gray-500">
              {isAdmin ? 'Crea tu primera encuesta para medir la satisfacción' : 'No hay encuestas disponibles'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {surveys.map((survey, index) => (
            <motion.div
              key={survey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{survey.title}</h3>
                        <Badge className={STATUS_LABELS[survey.status]?.color}>
                          {STATUS_LABELS[survey.status]?.label}
                        </Badge>
                        <Badge variant="outline">
                          {SURVEY_TYPES.find(t => t.value === survey.type)?.label}
                        </Badge>
                      </div>
                      {survey.description && (
                        <p className="text-gray-600 text-sm mb-3">{survey.description}</p>
                      )}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {survey._count.responses} respuestas
                        </span>
                        {survey.averageScore !== null && (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {survey.averageScore.toFixed(1)} promedio
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(survey.createdAt).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Parent response button */}
                      {!isAdmin && canRespond(survey) && (
                        <Button 
                          onClick={() => setShowRespond(survey)}
                          className="gap-2 text-white"
                        >
                          <Send className="w-4 h-4" />
                          Responder
                        </Button>
                      )}
                      
                      {!isAdmin && survey.responses && survey.responses.length > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          Respondida
                        </Badge>
                      )}
                      
                      {/* Admin actions */}
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          {survey.status === 'ACTIVE' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateSurveyStatus(survey.id, 'CLOSED')}
                            >
                              Cerrar
                            </Button>
                          )}
                          {survey.status === 'CLOSED' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateSurveyStatus(survey.id, 'ARCHIVED')}
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteSurvey(survey.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Encuesta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Título</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Encuesta de satisfacción 2026"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Descripción (opcional)</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descripción"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo de encuesta</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {SURVEY_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.type === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <type.icon className={`w-5 h-5 mb-1 ${
                      formData.type === type.value ? 'text-primary' : 'text-gray-400'
                    }`} />
                    <p className="text-sm font-medium">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">
                Respuestas anónimas
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={creating} className="text-white">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear y Publicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Respond Dialog */}
      <Dialog open={!!showRespond} onOpenChange={() => setShowRespond(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{showRespond?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            {showRespond?.type === 'NPS' ? (
              <div>
                <p className="text-center text-gray-700 mb-4">
                  ¿Qué tan probable es que recomiende nuestra escuela a un amigo o familiar?
                </p>
                <div className="flex justify-center gap-1">
                  {[0,1,2,3,4,5,6,7,8,9,10].map((n) => (
                    <button
                      key={n}
                      onClick={() => setResponseScore(n)}
                      className={`w-9 h-9 rounded-lg font-medium transition-colors ${
                        responseScore === n
                          ? n >= 9 ? 'bg-green-500 text-white'
                            : n >= 7 ? 'bg-yellow-500 text-white'
                            : 'bg-red-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                  <span>Nada probable</span>
                  <span>Muy probable</span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-center text-gray-700 mb-4">
                  ¿Qué tan satisfecho está con nuestros servicios?
                </p>
                <div className="flex justify-center gap-2">
                  {[1,2,3,4,5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setResponseScore(n)}
                      className="p-2 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          responseScore && n <= responseScore
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRespond(null); setResponseScore(null); }}>
              Cancelar
            </Button>
            <Button onClick={handleRespond} disabled={responding || responseScore === null} className="text-white">
              {responding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Respuesta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
