"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  UsersRound, Plus, X, Loader2, MessageSquare, LogOut,
  Search, User, ChevronRight, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";

interface Team {
  id: string;
  name: string;
  participants: {
    user: { id: string; name: string };
  }[];
  messages: {
    content: string;
    createdAt: string;
  }[];
}

interface Classmate {
  id: string;
  name: string;
  email: string;
  studentId: string;
}

export default function TeamsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [teamName, setTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/login");
      return;
    }
    if (userRole !== "ALUMNO") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [session, status, userRole]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamsRes, classmatesRes] = await Promise.all([
        fetch("/api/teams"),
        fetch("/api/teams/classmates")
      ]);

      if (teamsRes.ok) setTeams(await teamsRes.json());
      if (classmatesRes.ok) setClassmates(await classmatesRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Escribe un nombre para el equipo");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("Selecciona al menos un compañero");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName,
          memberIds: selectedMembers
        })
      });

      if (res.ok) {
        toast.success("¡Equipo creado!");
        setShowModal(false);
        setTeamName("");
        setSelectedMembers([]);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al crear equipo");
      }
    } catch (error) {
      toast.error("Error al crear equipo");
    } finally {
      setCreating(false);
    }
  };

  const leaveTeam = async (teamId: string) => {
    if (!confirm("¿Seguro que quieres salir de este equipo?")) return;
    try {
      const res = await fetch(`/api/teams?id=${teamId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Has salido del equipo");
        fetchData();
      }
    } catch (error) {
      toast.error("Error al salir del equipo");
    }
  };

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) 
        ? prev.filter(m => m !== id)
        : [...prev, id]
    );
  };

  const filteredClassmates = classmates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatLastMessage = (team: Team) => {
    if (team.messages.length === 0) return "Sin mensajes aún";
    const msg = team.messages[0];
    const time = new Date(msg.createdAt).toLocaleDateString();
    return `${msg.content.substring(0, 30)}${msg.content.length > 30 ? '...' : ''} • ${time}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <UsersRound className="w-7 h-7 text-[#1B4079]" />
            {t.nav.teams || "Mis Equipos"}
          </h1>
          <p className="text-gray-500 mt-1">
            Crea y gestiona equipos de trabajo con tus compañeros
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-[#1B4079] hover:bg-[#4D7C8A]">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Equipo
        </Button>
      </div>

      {/* Lista de equipos */}
      {teams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <UsersRound className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes equipos aún</h3>
          <p className="text-gray-500 mb-6">Crea un equipo para colaborar con tus compañeros</p>
          <Button onClick={() => setShowModal(true)} className="bg-[#1B4079] hover:bg-[#4D7C8A]">
            <Plus className="w-4 h-4 mr-2" />
            Crear mi primer equipo
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map(team => (
            <div
              key={team.id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <Link 
                  href={`/messages/${team.id}`}
                  className="flex-1 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1B4079] to-[#4D7C8A] rounded-full flex items-center justify-center">
                    <UsersRound className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {formatLastMessage(team)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {team.participants.length} miembros
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
                <button
                  onClick={() => leaveTeam(team.id)}
                  className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Salir del equipo"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
              {/* Miembros */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  {team.participants.map(p => (
                    <span 
                      key={p.user.id}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      {p.user.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear equipo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Crear Nuevo Equipo</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del equipo *
                </label>
                <Input
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="Ej: Equipo de Ciencias"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecciona compañeros ({selectedMembers.length} seleccionados)
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="pl-10"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2">
                  {filteredClassmates.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No se encontraron compañeros
                    </p>
                  ) : (
                    filteredClassmates.map(classmate => (
                      <button
                        key={classmate.id}
                        onClick={() => toggleMember(classmate.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                          selectedMembers.includes(classmate.id)
                            ? "bg-[#1B4079]/10 text-[#1B4079]"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          selectedMembers.includes(classmate.id)
                            ? "bg-[#1B4079] text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{classmate.name}</span>
                        {selectedMembers.includes(classmate.id) && (
                          <span className="ml-auto text-xs bg-[#1B4079] text-white px-2 py-0.5 rounded-full">
                            ✓
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowModal(false)} 
                className="flex-1"
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button 
                onClick={createTeam} 
                className="flex-1 bg-[#1B4079] hover:bg-[#4D7C8A]"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  "Crear Equipo"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
