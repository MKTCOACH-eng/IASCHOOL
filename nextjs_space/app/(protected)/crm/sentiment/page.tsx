"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  Loader2,
  Search,
  BarChart3,
  Users,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

interface Conversation {
  id: string;
  name: string | null;
  type: string;
  lastMessageAt: string | null;
  participants: Array<{
    user: {
      id: string;
      name: string;
      role: string;
    };
  }>;
  _count: {
    messages: number;
  };
}

interface SentimentAnalysis {
  sentiment: "positive" | "neutral" | "negative" | "concerned";
  confidence: number;
  summary: string;
  topics: string[];
  alerts: string[];
  messageCount: number;
  period?: {
    start: string;
    end: string;
  };
  participantStats?: Record<string, number>;
}

interface Stats {
  period: {
    start: string;
    end: string;
    label: string;
  };
  totalMessages: number;
  activeConversations: number;
  conversationTypes: Record<string, number>;
  activeParticipants: number;
  participantRoles: Record<string, number>;
}

export default function SentimentAnalysisPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>("");
  const [period, setPeriod] = useState<string>("week");
  const [stats, setStats] = useState<Stats | null>(null);
  const [analysis, setAnalysis] = useState<SentimentAnalysis | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const userRole = (session?.user as { role?: string })?.role;
    if (session?.user && !['ADMIN', 'SUPER_ADMIN'].includes(userRole || '')) {
      router.push("/dashboard");
      return;
    }

    if (session?.user) {
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      // Fetch conversations
      const convRes = await fetch("/api/conversations");
      const convData = await convRes.json();
      if (convData.conversations) {
        setConversations(convData.conversations);
      }

      // Fetch stats
      await fetchStats();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/messages/sentiment?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const analyzeConversation = async () => {
    if (!selectedConversation && !period) {
      toast.error("Selecciona una conversación o periodo para analizar");
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);

    try {
      const res = await fetch("/api/messages/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation || undefined,
          period: !selectedConversation ? period : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        toast.success("Análisis completado");
      } else {
        toast.error(data.error || "Error en el análisis");
      }
    } catch (error) {
      console.error("Error analyzing:", error);
      toast.error("Error al realizar el análisis");
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Smile className="h-8 w-8 text-green-500" />;
      case "neutral":
        return <Meh className="h-8 w-8 text-gray-500" />;
      case "negative":
        return <Frown className="h-8 w-8 text-red-500" />;
      case "concerned":
        return <AlertTriangle className="h-8 w-8 text-orange-500" />;
      default:
        return <Meh className="h-8 w-8 text-gray-500" />;
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    const labels: Record<string, string> = {
      positive: "Positivo",
      neutral: "Neutral",
      negative: "Negativo",
      concerned: "Preocupante",
    };
    return labels[sentiment] || sentiment;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "neutral":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      case "concerned":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getConversationName = (conv: Conversation) => {
    if (conv.name) return conv.name;
    if (conv.type === "DIRECT") {
      const otherParticipants = conv.participants
        .filter((p) => p.user.id !== (session?.user as { id?: string })?.id)
        .map((p) => p.user.name);
      return otherParticipants.join(", ") || "Chat directo";
    }
    return `${conv.type} Chat`;
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = getConversationName(conv).toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: "Administradores",
      PROFESOR: "Profesores",
      PADRE: "Padres",
      ALUMNO: "Alumnos",
      VOCAL: "Vocales",
    };
    return labels[role] || role;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DIRECT: "Directos",
      GROUP_PARENTS: "Grupos de Padres",
      GROUP_STUDENTS: "Grupos de Estudiantes",
      TEAM: "Equipos",
      ADMIN_CHANNEL: "Canales Admin",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis de Sentimientos</h1>
          <p className="text-gray-600 mt-1">
            Analiza el tono y contenido de las conversaciones escolares
          </p>
        </div>
        <Link href="/crm">
          <Button variant="outline">Volver a CRM</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mensajes ({stats.period.label})</p>
                  <p className="text-xl font-bold">{stats.totalMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Conversaciones Activas</p>
                  <p className="text-xl font-bold">{stats.activeConversations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Participantes Activos</p>
                  <p className="text-xl font-bold">{stats.activeParticipants}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipos de Chat</p>
                  <p className="text-xl font-bold">
                    {Object.keys(stats.conversationTypes).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Análisis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Conversación Específica (Opcional)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar conversación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 mb-2"
                />
              </div>
              <Select
                value={selectedConversation}
                onValueChange={setSelectedConversation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar conversación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Analizar por periodo</SelectItem>
                  {filteredConversations.map((conv) => (
                    <SelectItem key={conv.id} value={conv.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {conv.type}
                        </Badge>
                        <span>{getConversationName(conv)}</span>
                        <span className="text-gray-400 text-xs">
                          ({conv._count.messages} msgs)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Periodo de Análisis
              </label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Últimas 24 horas</SelectItem>
                  <SelectItem value="week">Últimos 7 días</SelectItem>
                  <SelectItem value="month">Últimos 30 días</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedConversation
                  ? "Se analizará solo la conversación seleccionada"
                  : "Se analizarán todas las conversaciones del periodo"}
              </p>
            </div>

            <div className="flex items-end">
              <Button
                onClick={analyzeConversation}
                disabled={analyzing}
                className="w-full bg-[#1B4079] hover:bg-[#143159]"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Analizar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card className={`border-2 ${getSentimentColor(analysis.sentiment)}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                {getSentimentIcon(analysis.sentiment)}
                <span>Resultado del Análisis</span>
              </CardTitle>
              <Badge className={getSentimentColor(analysis.sentiment)}>
                {getSentimentLabel(analysis.sentiment)}
                <span className="ml-1 opacity-75">
                  ({Math.round(analysis.confidence * 100)}% confianza)
                </span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Resumen</h4>
              <p className="text-gray-700 bg-white p-4 rounded-lg border">
                {analysis.summary}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Topics */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Temas Principales</h4>
                {analysis.topics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.topics.map((topic, idx) => (
                      <Badge key={idx} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No se identificaron temas específicos</p>
                )}
              </div>

              {/* Stats */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Estadísticas</h4>
                <div className="bg-white p-3 rounded-lg border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Mensajes analizados</span>
                    <span className="font-medium">{analysis.messageCount}</span>
                  </div>
                  {analysis.period && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Periodo</span>
                      <span className="font-medium text-xs">
                        {new Date(analysis.period.start).toLocaleDateString()} -{" "}
                        {new Date(analysis.period.end).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {analysis.participantStats && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-1">Participación por rol:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(analysis.participantStats).map(([role, count]) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {getRoleLabel(role)}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts */}
            {analysis.alerts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas Detectadas
                </h4>
                <ul className="space-y-2">
                  {analysis.alerts.map((alert, idx) => (
                    <li key={idx} className="text-red-700 text-sm flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Distribution by Type */}
      {stats && Object.keys(stats.conversationTypes).length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversaciones por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.conversationTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-600">{getTypeLabel(type)}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1B4079] rounded-full"
                          style={{
                            width: `${(count / stats.activeConversations) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-medium text-sm w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Participantes por Rol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.participantRoles).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-gray-600">{getRoleLabel(role)}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#CBDF90] rounded-full"
                          style={{
                            width: `${(count / stats.activeParticipants) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-medium text-sm w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
