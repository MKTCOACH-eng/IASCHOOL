"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Settings,
  Users,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Power,
  PowerOff,
  Loader2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface School {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  description: string | null;
  primaryColor: string;
  secondaryColor: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  settings: any;
  _count: {
    users: number;
    students: number;
    groups: number;
    announcements: number;
    documents: number;
  };
}

export default function SchoolsManagement() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    description: "",
    primaryColor: "#1B4079",
    secondaryColor: "#CBDF90"
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
    
    if (searchParams.get("action") === "create") {
      setShowCreateModal(true);
    }
  }, [session, status, router, searchParams]);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "10");
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      
      const res = await fetch(`/api/admin/schools?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSchools(data.schools);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast.error("Error al cargar escuelas");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    if (session?.user && (session.user as any).role === "SUPER_ADMIN") {
      fetchSchools();
    }
  }, [fetchSchools, session]);

  const handleCreateSchool = async () => {
    if (!formData.name || !formData.code) {
      toast.error("Nombre y código son requeridos");
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch("/api/admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success("Escuela creada exitosamente");
        setShowCreateModal(false);
        resetForm();
        fetchSchools();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al crear escuela");
      }
    } catch (error) {
      toast.error("Error al crear escuela");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSchool = async () => {
    if (!selectedSchool) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/schools/${selectedSchool.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success("Escuela actualizada exitosamente");
        setShowEditModal(false);
        resetForm();
        fetchSchools();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al actualizar escuela");
      }
    } catch (error) {
      toast.error("Error al actualizar escuela");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (school: School) => {
    try {
      const res = await fetch(`/api/admin/schools/${school.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !school.isActive })
      });
      
      if (res.ok) {
        toast.success(school.isActive ? "Escuela desactivada" : "Escuela activada");
        fetchSchools();
      }
    } catch (error) {
      toast.error("Error al cambiar estado");
    }
  };

  const openEditModal = (school: School) => {
    setSelectedSchool(school);
    setFormData({
      name: school.name,
      code: school.code,
      email: school.email || "",
      phone: school.phone || "",
      address: school.address || "",
      website: school.website || "",
      description: school.description || "",
      primaryColor: school.primaryColor,
      secondaryColor: school.secondaryColor || "#CBDF90"
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      description: "",
      primaryColor: "#1B4079",
      secondaryColor: "#CBDF90"
    });
    setSelectedSchool(null);
  };

  if (status === "loading" || (loading && schools.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/super-admin" className="hover:text-[#1B4079]">Super Admin</Link>
            <span>/</span>
            <span>Escuelas</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Escuelas</h1>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)} 
          className="gap-2 bg-[#1B4079] hover:bg-[#15325f]"
        >
          <Plus className="h-4 w-4" />
          Nueva Escuela
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar escuelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                Todas
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => setStatusFilter("active")}
                size="sm"
              >
                Activas
              </Button>
              <Button
                variant={statusFilter === "inactive" ? "default" : "outline"}
                onClick={() => setStatusFilter("inactive")}
                size="sm"
              >
                Inactivas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schools List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
            </div>
          ) : schools.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron escuelas</p>
            </div>
          ) : (
            <div className="divide-y">
              {schools.map((school) => (
                <div key={school.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: school.primaryColor }}
                      >
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{school.name}</h3>
                          <Badge variant={school.isActive ? "default" : "secondary"}>
                            {school.isActive ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">Código: {school.code}</p>
                        {school.email && (
                          <p className="text-sm text-gray-400">{school.email}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{school._count.users}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          <span>{school._count.students}</span>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/super-admin/schools/${school.id}`)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditModal(school)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(school)}>
                            {school.isActive ? (
                              <><PowerOff className="h-4 w-4 mr-2" /> Desactivar</>
                            ) : (
                              <><Power className="h-4 w-4 mr-2" /> Activar</>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {schools.length} de {pagination.total} escuelas
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page === pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showEditModal ? "Editar Escuela" : "Nueva Escuela"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nombre de la escuela"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="ESCUELA01"
                  disabled={showEditModal}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="contacto@escuela.edu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+52 55 1234 5678"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Calle, Número, Colonia, Ciudad"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                placeholder="https://www.escuela.edu"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descripción de la escuela..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Color Primario</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Color Secundario</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={showEditModal ? handleUpdateSchool : handleCreateSchool}
              disabled={saving}
              className="bg-[#1B4079] hover:bg-[#15325f]"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
              ) : (
                showEditModal ? "Actualizar" : "Crear Escuela"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
