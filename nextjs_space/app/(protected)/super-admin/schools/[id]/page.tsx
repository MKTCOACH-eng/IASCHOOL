"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  GraduationCap,
  BookOpen,
  FileText,
  MessageSquare,
  Calendar,
  CreditCard,
  ArrowLeft,
  Edit,
  Power,
  PowerOff,
  Settings,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const AVAILABLE_MODULES = [
  { key: "announcements", label: "Anuncios" },
  { key: "messages", label: "Mensajería" },
  { key: "tasks", label: "Tareas" },
  { key: "calendar", label: "Calendario" },
  { key: "payments", label: "Pagos" },
  { key: "attendance", label: "Asistencias" },
  { key: "documents", label: "Documentos" },
  { key: "chatbot", label: "Chatbot IA" },
  { key: "polls", label: "Encuestas" }
];

export default function SchoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  
  const [school, setSchool] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [settingsForm, setSettingsForm] = useState({
    modulesEnabled: [] as string[],
    maxUsers: 500,
    maxStudents: 1000,
    maxGroups: 50,
    storageLimit: 5120,
    planType: "standard"
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchSchoolData();
  }, [session, status, router, resolvedParams.id]);

  const fetchSchoolData = async () => {
    try {
      const [schoolRes, settingsRes] = await Promise.all([
        fetch(`/api/admin/schools/${resolvedParams.id}`),
        fetch(`/api/admin/schools/${resolvedParams.id}/settings`)
      ]);
      
      if (schoolRes.ok) {
        const schoolData = await schoolRes.json();
        setSchool(schoolData);
      }
      
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
        setSettingsForm({
          modulesEnabled: JSON.parse(settingsData.modulesEnabled || "[]"),
          maxUsers: settingsData.maxUsers,
          maxStudents: settingsData.maxStudents,
          maxGroups: settingsData.maxGroups,
          storageLimit: settingsData.storageLimit,
          planType: settingsData.planType
        });
      }
    } catch (error) {
      console.error("Error fetching school:", error);
      toast.error("Error al cargar datos de la escuela");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!school) return;
    try {
      const res = await fetch(`/api/admin/schools/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !school.isActive })
      });
      
      if (res.ok) {
        toast.success(school.isActive ? "Escuela desactivada" : "Escuela activada");
        fetchSchoolData();
      }
    } catch (error) {
      toast.error("Error al cambiar estado");
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/schools/${resolvedParams.id}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settingsForm,
          modulesEnabled: JSON.stringify(settingsForm.modulesEnabled)
        })
      });
      
      if (res.ok) {
        toast.success("Configuración guardada");
        setShowSettingsModal(false);
        fetchSchoolData();
      } else {
        toast.error("Error al guardar configuración");
      }
    } catch (error) {
      toast.error("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (moduleKey: string) => {
    setSettingsForm(prev => ({
      ...prev,
      modulesEnabled: prev.modulesEnabled.includes(moduleKey)
        ? prev.modulesEnabled.filter(m => m !== moduleKey)
        : [...prev.modulesEnabled, moduleKey]
    }));
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Escuela no encontrada</p>
        <Link href="/super-admin/schools">
          <Button variant="outline" className="mt-4">Volver</Button>
        </Link>
      </div>
    );
  }

  const stats = [
    { label: "Usuarios", value: school._count.users, icon: Users },
    { label: "Alumnos", value: school._count.students, icon: GraduationCap },
    { label: "Grupos", value: school._count.groups, icon: BookOpen },
    { label: "Anuncios", value: school._count.announcements, icon: FileText },
    { label: "Documentos", value: school._count.documents, icon: FileText },
    { label: "Conversaciones", value: school._count.conversations, icon: MessageSquare },
    { label: "Eventos", value: school._count.events, icon: Calendar },
    { label: "Cargos", value: school._count.charges, icon: CreditCard }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/super-admin" className="hover:text-[#1B4079]">Super Admin</Link>
            <span>/</span>
            <Link href="/super-admin/schools" className="hover:text-[#1B4079]">Escuelas</Link>
            <span>/</span>
            <span>{school.code}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{school.name}</h1>
            <Badge variant={school.isActive ? "default" : "secondary"}>
              {school.isActive ? "Activa" : "Inactiva"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSettingsModal(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
          <Button 
            variant={school.isActive ? "destructive" : "default"}
            onClick={handleToggleActive}
          >
            {school.isActive ? (
              <><PowerOff className="h-4 w-4 mr-2" /> Desactivar</>
            ) : (
              <><Power className="h-4 w-4 mr-2" /> Activar</>
            )}
          </Button>
        </div>
      </div>

      {/* School Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div 
              className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: school.primaryColor }}
            >
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Código:</span>
                  <span>{school.code}</span>
                </div>
                {school.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{school.email}</span>
                  </div>
                )}
                {school.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{school.phone}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {school.address && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{school.address}</span>
                  </div>
                )}
                {school.website && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="h-4 w-4" />
                    <a href={school.website} target="_blank" rel="noopener" className="text-[#1B4079] hover:underline">
                      {school.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Palette className="h-4 w-4" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: school.primaryColor }} />
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: school.secondaryColor || "#CBDF90" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {school.description && (
            <p className="mt-4 text-gray-600 border-t pt-4">{school.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <stat.icon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Administradores de la Escuela
          </CardTitle>
        </CardHeader>
        <CardContent>
          {school.users && school.users.length > 0 ? (
            <div className="space-y-3">
              {school.users.map((admin: any) => (
                <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{admin.name}</p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </div>
                  <Badge>Admin</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay administradores registrados</p>
          )}
        </CardContent>
      </Card>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configuración de {school.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Plan */}
            <div className="space-y-2">
              <Label>Plan de Suscripción</Label>
              <Select
                value={settingsForm.planType}
                onValueChange={(value) => setSettingsForm({...settingsForm, planType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratuito</SelectItem>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="standard">Estándar</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Máximo Usuarios</Label>
                <Input
                  type="number"
                  value={settingsForm.maxUsers}
                  onChange={(e) => setSettingsForm({...settingsForm, maxUsers: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Máximo Alumnos</Label>
                <Input
                  type="number"
                  value={settingsForm.maxStudents}
                  onChange={(e) => setSettingsForm({...settingsForm, maxStudents: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Máximo Grupos</Label>
                <Input
                  type="number"
                  value={settingsForm.maxGroups}
                  onChange={(e) => setSettingsForm({...settingsForm, maxGroups: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Límite Almacenamiento (MB)</Label>
                <Input
                  type="number"
                  value={settingsForm.storageLimit}
                  onChange={(e) => setSettingsForm({...settingsForm, storageLimit: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            {/* Modules */}
            <div className="space-y-3">
              <Label>Módulos Habilitados</Label>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_MODULES.map((module) => (
                  <div key={module.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">{module.label}</span>
                    <Switch
                      checked={settingsForm.modulesEnabled.includes(module.key)}
                      onCheckedChange={() => toggleModule(module.key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSettingsModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-[#1B4079] hover:bg-[#15325f]"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
