"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Settings, 
  Plus, 
  Save, 
  Trash2,
  Edit2,
  Loader2,
  Shield,
  Bell,
  Sliders,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { key: "general", label: "General", icon: Settings },
  { key: "security", label: "Seguridad", icon: Shield },
  { key: "notifications", label: "Notificaciones", icon: Bell },
  { key: "limits", label: "Límites", icon: Sliders }
];

export default function SystemConfigPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [grouped, setGrouped] = useState<Record<string, SystemConfig[]>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);
  
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    description: "",
    category: "general"
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchConfigs();
  }, [session, status, router]);

  const fetchConfigs = async () => {
    try {
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs);
        setGrouped(data.grouped);
      }
    } catch (error) {
      console.error("Error fetching configs:", error);
      toast.error("Error al cargar configuraciones");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.key) {
      toast.error("La clave es requerida");
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success(editingConfig ? "Configuración actualizada" : "Configuración creada");
        setShowModal(false);
        resetForm();
        fetchConfigs();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm("¿Estás seguro de eliminar esta configuración?")) return;
    
    try {
      const res = await fetch(`/api/admin/config?key=${key}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        toast.success("Configuración eliminada");
        fetchConfigs();
      }
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const openEditModal = (config: SystemConfig) => {
    setEditingConfig(config);
    setFormData({
      key: config.key,
      value: config.value,
      description: config.description || "",
      category: config.category
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      key: "",
      value: "",
      description: "",
      category: "general"
    });
    setEditingConfig(null);
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.key === category);
    return cat ? cat.icon : Settings;
  };

  if (status === "loading" || loading) {
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
            <span>Configuración</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setShowModal(true);
          }} 
          className="gap-2 bg-[#1B4079] hover:bg-[#15325f]"
        >
          <Plus className="h-4 w-4" />
          Nueva Configuración
        </Button>
      </div>

      {/* Category Cards */}
      {CATEGORIES.map((category) => {
        const categoryConfigs = grouped[category.key] || [];
        const Icon = category.icon;
        
        return (
          <Card key={category.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {category.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryConfigs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay configuraciones en esta categoría
                </p>
              ) : (
                <div className="space-y-3">
                  {categoryConfigs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm font-medium text-gray-900">{config.key}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 font-mono bg-white px-2 py-1 rounded border inline-block">
                          {config.value.length > 100 ? config.value.substring(0, 100) + "..." : config.value}
                        </p>
                        {config.description && (
                          <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(config)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(config.key)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={(open) => {
        if (!open) {
          setShowModal(false);
          resetForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? "Editar Configuración" : "Nueva Configuración"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key">Clave *</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({...formData, key: e.target.value})}
                placeholder="maintenance_mode"
                disabled={!!editingConfig}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Valor *</Label>
              <Textarea
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                placeholder="true"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.key} value={cat.key}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descripción de la configuración..."
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowModal(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1B4079] hover:bg-[#15325f]"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Guardar</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
