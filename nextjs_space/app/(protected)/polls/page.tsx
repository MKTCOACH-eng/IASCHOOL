"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Users,
  Vote,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  hasVoted: boolean;
}

interface Poll {
  id: string;
  title: string;
  description: string | null;
  status: "ACTIVE" | "CLOSED";
  allowMultiple: boolean;
  isAnonymous: boolean;
  endsAt: string | null;
  groupId: string;
  group: { name: string };
  createdBy: { name: string };
  createdAt: string;
  options: PollOption[];
  totalVotes: number;
}

interface Group {
  id: string;
  name: string;
}

export default function PollsPage() {
  const { data: session } = useSession() || {};
  const user = session?.user as { id?: string; role?: string } | undefined;
  const isVocal = user?.role === "VOCAL";
  const isAdmin = user?.role === "ADMIN";
  const canCreate = isVocal || isAdmin;

  const [polls, setPolls] = useState<Poll[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [newPoll, setNewPoll] = useState({
    groupId: "",
    title: "",
    description: "",
    options: ["", ""],
    allowMultiple: false,
    isAnonymous: false,
    endsAt: "",
  });

  useEffect(() => {
    fetchPolls();
    if (canCreate) fetchGroups();
  }, [canCreate]);

  async function fetchPolls() {
    try {
      const res = await fetch("/api/polls");
      if (res.ok) {
        const data = await res.json();
        setPolls(data);
      }
    } catch (error) {
      console.error("Error fetching polls:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchGroups() {
    try {
      const res = await fetch("/api/groups/my-groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  }

  async function vote(pollId: string, optionIds: string[]) {
    setVoting(pollId);
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIds }),
      });

      if (res.ok) {
        toast.success("Voto registrado");
        fetchPolls();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al votar");
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Error al votar");
    } finally {
      setVoting(null);
    }
  }

  async function createPoll() {
    if (!newPoll.title.trim() || !newPoll.groupId) {
      toast.error("Completa los campos requeridos");
      return;
    }

    const validOptions = newPoll.options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      toast.error("Se requieren al menos 2 opciones");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPoll,
          options: validOptions,
          endsAt: newPoll.endsAt || null,
        }),
      });

      if (res.ok) {
        toast.success("Encuesta creada");
        setShowCreate(false);
        setNewPoll({
          groupId: "",
          title: "",
          description: "",
          options: ["", ""],
          allowMultiple: false,
          isAnonymous: false,
          endsAt: "",
        });
        fetchPolls();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al crear");
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error("Error al crear encuesta");
    } finally {
      setCreating(false);
    }
  }

  async function closePoll(pollId: string) {
    try {
      const res = await fetch(`/api/polls/${pollId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });

      if (res.ok) {
        toast.success("Encuesta cerrada");
        fetchPolls();
      }
    } catch (error) {
      console.error("Error closing poll:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Encuestas y Votaciones</h1>
          <p className="text-gray-500">Participa en las decisiones del grupo</p>
        </div>
        
        {canCreate && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Encuesta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Encuesta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Grupo *</label>
                  <Select
                    value={newPoll.groupId}
                    onValueChange={(v) => setNewPoll({ ...newPoll, groupId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Título *</label>
                  <Input
                    value={newPoll.title}
                    onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
                    placeholder="¿Qué quieres preguntar?"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Textarea
                    value={newPoll.description}
                    onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
                    placeholder="Detalles adicionales (opcional)"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Opciones *</label>
                  <div className="space-y-2 mt-1">
                    {newPoll.options.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const opts = [...newPoll.options];
                            opts[i] = e.target.value;
                            setNewPoll({ ...newPoll, options: opts });
                          }}
                          placeholder={`Opción ${i + 1}`}
                        />
                        {newPoll.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const opts = newPoll.options.filter((_, idx) => idx !== i);
                              setNewPoll({ ...newPoll, options: opts });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, ""] })}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Agregar opción
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={newPoll.allowMultiple}
                      onCheckedChange={(c) => setNewPoll({ ...newPoll, allowMultiple: !!c })}
                    />
                    <span className="text-sm">Permitir múltiples opciones</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={newPoll.isAnonymous}
                      onCheckedChange={(c) => setNewPoll({ ...newPoll, isAnonymous: !!c })}
                    />
                    <span className="text-sm">Anónima</span>
                  </label>
                </div>

                <div>
                  <label className="text-sm font-medium">Fecha límite (opcional)</label>
                  <Input
                    type="datetime-local"
                    value={newPoll.endsAt}
                    onChange={(e) => setNewPoll({ ...newPoll, endsAt: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreate(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createPoll} disabled={creating}>
                    {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Vote className="h-4 w-4 mr-2" />}
                    Crear Encuesta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Lista de encuestas */}
      {polls.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay encuestas activas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onVote={vote}
              onClose={closePoll}
              voting={voting === poll.id}
              canClose={poll.createdBy.name === session?.user?.name || isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PollCard({
  poll,
  onVote,
  onClose,
  voting,
  canClose,
}: {
  poll: Poll;
  onVote: (pollId: string, optionIds: string[]) => void;
  onClose: (pollId: string) => void;
  voting: boolean;
  canClose: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(
    poll.options.filter((o) => o.hasVoted).map((o) => o.id)
  );
  const hasVoted = poll.options.some((o) => o.hasVoted);
  const isActive = poll.status === "ACTIVE";
  const isExpired = poll.endsAt && new Date(poll.endsAt) < new Date();

  function toggleOption(optionId: string) {
    if (!isActive || isExpired) return;

    if (poll.allowMultiple) {
      setSelected((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      );
    } else {
      setSelected([optionId]);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{poll.title}</CardTitle>
              <Badge variant={isActive && !isExpired ? "default" : "secondary"}>
                {isActive && !isExpired ? "Activa" : "Cerrada"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {poll.group.name} • Por {poll.createdBy.name}
            </p>
            {poll.description && <p className="text-sm text-gray-600 mt-2">{poll.description}</p>}
          </div>
          {canClose && isActive && !isExpired && (
            <Button variant="ghost" size="sm" onClick={() => onClose(poll.id)}>
              Cerrar
            </Button>
          )}
        </div>
        {poll.endsAt && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
            <Clock className="h-4 w-4" />
            Termina: {format(new Date(poll.endsAt), "d MMM yyyy, HH:mm", { locale: es })}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {poll.options.map((option) => {
            const percentage = poll.totalVotes > 0 ? Math.round((option.voteCount / poll.totalVotes) * 100) : 0;
            const isSelected = selected.includes(option.id);

            return (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                disabled={!isActive || !!isExpired || voting}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  isSelected
                    ? "border-[#1B4079] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                } ${(!isActive || isExpired) ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-[#1B4079]" />}
                    <span className="font-medium">{option.text}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {option.voteCount} {option.voteCount === 1 ? "voto" : "votos"}
                  </span>
                </div>
                {(hasVoted || !isActive || isExpired) && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1B4079] transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {isActive && !isExpired && selected.length > 0 && !hasVoted && (
          <Button
            className="w-full mt-4"
            onClick={() => onVote(poll.id, selected)}
            disabled={voting}
          >
            {voting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Vote className="h-4 w-4 mr-2" />
            )}
            Votar
          </Button>
        )}

        <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          {poll.totalVotes} {poll.totalVotes === 1 ? "voto total" : "votos totales"}
          {poll.isAnonymous && (
            <Badge variant="outline" className="ml-2">
              Anónima
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
