"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  PiggyBank,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Fund {
  id: string;
  title: string;
  description: string | null;
  amountPerStudent: number;
  goalAmount: number | null;
  totalCollected: number;
  dueDate: string | null;
  eventDate: string | null;
  status: string;
  createdAt: string;
  group: { id: string; name: string };
  createdBy: { id: string; name: string };
  linkedEvent: { id: string; title: string; startDate: string } | null;
  stats: {
    paidCount: number;
    pendingCount: number;
    totalContributions: number;
    totalCollected: number;
    totalExpenses: number;
    balance: number;
  };
}

interface Group {
  id: string;
  name: string;
}

export default function FundsPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get("groupId");

  const [funds, setFunds] = useState<Fund[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string>(initialGroupId || "all");
  const [showNewFundModal, setShowNewFundModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newFund, setNewFund] = useState({
    groupId: initialGroupId || "",
    title: "",
    description: "",
    amountPerStudent: "",
    goalAmount: "",
    dueDate: "",
    eventDate: ""
  });

  const user = session?.user as { role?: string; id?: string } | undefined;
  const isVocal = user?.role === "VOCAL" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Obtener colectas
      const fundsRes = await fetch("/api/vocal/funds");
      if (fundsRes.ok) {
        const fundsData = await fundsRes.json();
        setFunds(fundsData);

        // Extraer grupos únicos
        const uniqueGroups = Array.from(
          new Map(fundsData.map((f: Fund) => [f.group.id, f.group])).values()
        ) as Group[];
        setGroups(uniqueGroups);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar colectas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFund = async () => {
    if (!newFund.groupId || !newFund.title || !newFund.amountPerStudent) {
      toast.error("Completa los campos requeridos");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/vocal/funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFund)
      });

      if (res.ok) {
        toast.success("Colecta creada exitosamente");
        setShowNewFundModal(false);
        setNewFund({
          groupId: "",
          title: "",
          description: "",
          amountPerStudent: "",
          goalAmount: "",
          dueDate: "",
          eventDate: ""
        });
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al crear colecta");
      }
    } catch (error) {
      console.error("Error creating fund:", error);
      toast.error("Error al crear colecta");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFunds = funds.filter(fund => {
    const matchesSearch = fund.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fund.group.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || fund.status === statusFilter;
    const matchesGroup = groupFilter === "all" || fund.group.id === groupFilter;
    return matchesSearch && matchesStatus && matchesGroup;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Activa</Badge>;
      case "PAUSED":
        return <Badge className="bg-yellow-100 text-yellow-800">Pausada</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800">Completada</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4079]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colectas</h1>
          <p className="text-gray-600">Administra las colectas de los grupos</p>
        </div>
        {isVocal && (
          <Button
            onClick={() => setShowNewFundModal(true)}
            className="bg-[#1B4079] hover:bg-[#1B4079]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Colecta
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar colecta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ACTIVE">Activas</SelectItem>
                <SelectItem value="PAUSED">Pausadas</SelectItem>
                <SelectItem value="COMPLETED">Completadas</SelectItem>
                <SelectItem value="CANCELLED">Canceladas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grupos</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Funds List */}
      {filteredFunds.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <PiggyBank className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay colectas</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all" || groupFilter !== "all"
                ? "No se encontraron colectas con los filtros seleccionados"
                : "Aún no hay colectas creadas"}
            </p>
            {isVocal && (
              <Button onClick={() => setShowNewFundModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Colecta
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredFunds.map(fund => (
            <Link key={fund.id} href={`/vocal/funds/${fund.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{fund.title}</h3>
                        {getStatusBadge(fund.status)}
                      </div>
                      <p className="text-sm text-gray-600">{fund.group.name}</p>
                      {fund.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{fund.description}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600 mb-1">Pagados</p>
                      <p className="text-lg font-bold text-green-700">{fund.stats.paidCount}</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-600 mb-1">Pendientes</p>
                      <p className="text-lg font-bold text-yellow-700">{fund.stats.pendingCount}</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1">Balance</p>
                      <p className="text-lg font-bold text-blue-700">
                        ${fund.stats.balance.toLocaleString("es-MX")}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Recaudado</span>
                      <span className="font-semibold">
                        ${fund.stats.totalCollected.toLocaleString("es-MX")} / 
                        ${(fund.amountPerStudent * fund.stats.totalContributions).toLocaleString("es-MX")}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{
                          width: `${fund.stats.totalContributions > 0
                            ? (fund.stats.paidCount / fund.stats.totalContributions) * 100
                            : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>${fund.amountPerStudent} por alumno</span>
                    {fund.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Vence: {new Date(fund.dueDate).toLocaleDateString("es-MX")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* New Fund Modal */}
      <Dialog open={showNewFundModal} onOpenChange={setShowNewFundModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Colecta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupId">Grupo *</Label>
              <Select
                value={newFund.groupId}
                onValueChange={(value) => setNewFund({ ...newFund, groupId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un grupo" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={newFund.title}
                onChange={(e) => setNewFund({ ...newFund, title: e.target.value })}
                placeholder="Ej: Día de San Valentín"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={newFund.description}
                onChange={(e) => setNewFund({ ...newFund, description: e.target.value })}
                placeholder="Describe el propósito de la colecta..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="amountPerStudent">Monto por alumno *</Label>
              <Input
                id="amountPerStudent"
                type="number"
                value={newFund.amountPerStudent}
                onChange={(e) => setNewFund({ ...newFund, amountPerStudent: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Fecha límite</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newFund.dueDate}
                  onChange={(e) => setNewFund({ ...newFund, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="eventDate">Fecha del evento</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={newFund.eventDate}
                  onChange={(e) => setNewFund({ ...newFund, eventDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFundModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateFund}
              disabled={submitting}
              className="bg-[#1B4079] hover:bg-[#1B4079]/90"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Crear Colecta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
