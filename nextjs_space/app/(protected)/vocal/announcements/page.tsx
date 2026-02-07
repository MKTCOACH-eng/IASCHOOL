"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Megaphone,
  Pin,
  Paperclip,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  Eye
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  isPinned: boolean;
  isRead: boolean;
  createdAt: string;
  group: { id: string; name: string };
  createdBy: { id: string; name: string };
  linkedFund: { id: string; title: string; status: string } | null;
}

interface Group {
  id: string;
  name: string;
}

interface Fund {
  id: string;
  title: string;
  status: string;
  group: { id: string; name: string };
}

export default function GroupAnnouncementsPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get("groupId");

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>(initialGroupId || "all");
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    groupId: initialGroupId || "",
    title: "",
    content: "",
    linkedFundId: "",
    isPinned: false
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

      // Obtener grupos del usuario primero
      const groupsRes = await fetch("/api/groups/my-groups");
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        const vocalGroups = user?.role === "VOCAL" 
          ? groupsData.filter((g: { isVocal?: boolean }) => g.isVocal)
          : groupsData;
        setGroups(vocalGroups.map((g: { id: string; name: string }) => ({ id: g.id, name: g.name })));
      }

      // Obtener avisos
      const announcementsRes = await fetch("/api/vocal/announcements");
      if (announcementsRes.ok) {
        const data = await announcementsRes.json();
        setAnnouncements(data);
      }

      // Obtener colectas activas para vincular
      const fundsRes = await fetch("/api/vocal/funds?status=ACTIVE");
      if (fundsRes.ok) {
        const fundsData = await fundsRes.json();
        setFunds(fundsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar avisos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.groupId || !formData.title || !formData.content) {
      toast.error("Completa los campos requeridos");
      return;
    }

    try {
      setSubmitting(true);
      const url = editingAnnouncement
        ? `/api/vocal/announcements/${editingAnnouncement.id}`
        : "/api/vocal/announcements";
      const method = editingAnnouncement ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingAnnouncement ? "Aviso actualizado" : "Aviso creado exitosamente");
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al guardar aviso");
      }
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error("Error al guardar aviso");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este aviso?")) return;

    try {
      const res = await fetch(`/api/vocal/announcements/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Aviso eliminado");
        fetchData();
      } else {
        toast.error("Error al eliminar aviso");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Error al eliminar");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/vocal/announcements/${id}`);
      setAnnouncements(prev =>
        prev.map(a => a.id === id ? { ...a, isRead: true } : a)
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      groupId: announcement.group.id,
      title: announcement.title,
      content: announcement.content,
      linkedFundId: announcement.linkedFund?.id || "",
      isPinned: announcement.isPinned
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAnnouncement(null);
    setFormData({
      groupId: initialGroupId || "",
      title: "",
      content: "",
      linkedFundId: "",
      isPinned: false
    });
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = groupFilter === "all" || announcement.group.id === groupFilter;
    return matchesSearch && matchesGroup;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Avisos del Grupo</h1>
          <p className="text-gray-600">Comunicaciones de las vocales a los padres</p>
        </div>
        {isVocal && (
          <Button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-[#1B4079] hover:bg-[#1B4079]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Aviso
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
                placeholder="Buscar aviso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay avisos</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || groupFilter !== "all"
                ? "No se encontraron avisos con los filtros seleccionados"
                : "Aún no hay avisos de grupo"}
            </p>
            {isVocal && (
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Aviso
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map(announcement => (
            <Card
              key={announcement.id}
              className={`transition-colors ${
                !announcement.isRead ? "bg-blue-50 border-blue-200" : ""
              }`}
              onClick={() => !announcement.isRead && markAsRead(announcement.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {announcement.isPinned && (
                        <Badge variant="outline" className="text-xs">
                          <Pin className="w-3 h-3 mr-1" />
                          Fijado
                        </Badge>
                      )}
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {announcement.title}
                      </h3>
                      {!announcement.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>

                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                      {announcement.content}
                    </p>

                    {announcement.linkedFund && (
                      <Link href={`/vocal/funds/${announcement.linkedFund.id}`}>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer">
                          Colecta: {announcement.linkedFund.title}
                        </Badge>
                      </Link>
                    )}

                    {announcement.attachmentUrl && (
                      <a
                        href={announcement.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                      >
                        <Paperclip className="w-4 h-4" />
                        {announcement.attachmentName || "Archivo adjunto"}
                      </a>
                    )}

                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <span>{announcement.group.name}</span>
                      <span>•</span>
                      <span>{announcement.createdBy.name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(announcement.createdAt).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>

                  {isVocal && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(announcement);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(announcement.id);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? "Editar Aviso" : "Nuevo Aviso"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupId">Grupo *</Label>
              <Select
                value={formData.groupId}
                onValueChange={(value) => setFormData({ ...formData, groupId: value })}
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
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título del aviso"
              />
            </div>

            <div>
              <Label htmlFor="content">Contenido *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Escribe el contenido del aviso..."
                rows={5}
              />
            </div>

            <div>
              <Label>Vincular a colecta (opcional)</Label>
              <Select
                value={formData.linkedFundId}
                onValueChange={(value) => setFormData({ ...formData, linkedFundId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una colecta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguna</SelectItem>
                  {funds
                    .filter(f => f.group.id === formData.groupId || !formData.groupId)
                    .map(fund => (
                      <SelectItem key={fund.id} value={fund.id}>
                        {fund.title} ({fund.group.name})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Fijar aviso</Label>
                <p className="text-xs text-gray-500">Aparece primero en la lista</p>
              </div>
              <Switch
                checked={formData.isPinned}
                onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#1B4079] hover:bg-[#1B4079]/90"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingAnnouncement ? "Guardar Cambios" : "Crear Aviso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
