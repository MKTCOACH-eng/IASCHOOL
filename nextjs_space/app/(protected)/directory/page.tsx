"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users,
  GraduationCap,
  UserCheck,
  Search,
  Download,
  Phone,
  Mail,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  Upload,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  group?: { id: string; name: string };
  parents: { id: string; name: string; email: string; phone?: string }[];
  user?: { email: string };
}

interface Parent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  children: { id: string; firstName: string; lastName: string; group?: { id: string; name: string } }[];
}

interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  teacherGroups: { id: string; name: string }[];
}

interface Group {
  id: string;
  name: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function DirectoryPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"students" | "parents" | "staff">("students");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  
  // Data
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const user = session?.user as any;

  useEffect(() => {
    if (user && !["ADMIN", "PROFESOR", "SUPER_ADMIN"].includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    fetchData();
  }, [activeTab, search, selectedGroup, selectedRole, pagination.page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      if (search) params.set("search", search);

      switch (activeTab) {
        case "students":
          endpoint = "/api/admin/directory/students";
          if (selectedGroup) params.set("groupId", selectedGroup);
          break;
        case "parents":
          endpoint = "/api/admin/directory/parents";
          if (selectedGroup) params.set("groupId", selectedGroup);
          break;
        case "staff":
          endpoint = "/api/admin/directory/staff";
          if (selectedRole) params.set("role", selectedRole);
          break;
      }

      const res = await fetch(`${endpoint}?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar directorio");
      
      const data = await res.json();

      if (activeTab === "students") {
        setStudents(data.students);
        setGroups(data.groups || []);
      } else if (activeTab === "parents") {
        setParents(data.parents);
        setGroups(data.groups || []);
      } else {
        setStaff(data.staff);
      }

      setPagination(data.pagination);
    } catch (error) {
      toast.error("Error al cargar el directorio");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      let endpoint = "";
      const params = new URLSearchParams();
      params.set("export", "csv");
      if (search) params.set("search", search);

      switch (activeTab) {
        case "students":
          endpoint = "/api/admin/directory/students";
          if (selectedGroup) params.set("groupId", selectedGroup);
          break;
        case "parents":
          endpoint = "/api/admin/directory/parents";
          if (selectedGroup) params.set("groupId", selectedGroup);
          break;
        case "staff":
          endpoint = "/api/admin/directory/staff";
          if (selectedRole) params.set("role", selectedRole);
          break;
      }

      const res = await fetch(`${endpoint}?${params.toString()}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `directorio_${activeTab}_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      toast.success("Archivo exportado exitosamente");
    } catch (error) {
      toast.error("Error al exportar");
    }
  };

  const handleTabChange = (tab: "students" | "parents" | "staff") => {
    setActiveTab(tab);
    setSearch("");
    setSelectedGroup("");
    setSelectedRole("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const tabs = [
    { id: "students" as const, label: "Alumnos", icon: GraduationCap },
    { id: "parents" as const, label: "Padres", icon: Users },
    { id: "staff" as const, label: "Personal", icon: Building2, adminOnly: true },
  ];

  const visibleTabs = tabs.filter(tab => !tab.adminOnly || user?.role === "ADMIN");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Directorio Escolar</h1>
          <p className="text-gray-600">Consulta y exporta información de contacto</p>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === "ADMIN" && (
            <>
              <Link href="/directory/metrics">
                <Button variant="outline" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Métricas
                </Button>
              </Link>
              <Link href="/directory/import">
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Importar CSV
                </Button>
              </Link>
            </>
          )}
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-[#1B4079] text-[#1B4079]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {(activeTab === "students" || activeTab === "parents") && groups.length > 0 && (
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los grupos</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {activeTab === "staff" && (
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="ADMIN">Administradores</SelectItem>
              <SelectItem value="PROFESOR">Profesores</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B4079]" />
        </div>
      ) : (
        <>
          {/* Students List */}
          {activeTab === "students" && (
            <div className="grid gap-4">
              {students.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No se encontraron alumnos
                </div>
              ) : (
                students.map((student) => (
                  <div
                    key={student.id}
                    className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-[#CBDF90]/30 flex items-center justify-center">
                          <GraduationCap className="h-6 w-6 text-[#1B4079]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {student.group?.name || "Sin grupo asignado"}
                          </p>
                          {student.user?.email && (
                            <p className="text-xs text-[#1B4079]">
                              {student.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      {student.parents.length > 0 && (
                        <div className="sm:text-right">
                          <p className="text-xs text-gray-400 mb-1">Contacto padre/madre:</p>
                          {student.parents.map((parent) => (
                            <div key={parent.id} className="text-sm">
                              <p className="font-medium text-gray-700">{parent.name}</p>
                              <div className="flex items-center gap-3 text-gray-500">
                                {parent.email && (
                                  <a href={`mailto:${parent.email}`} className="flex items-center gap-1 hover:text-[#1B4079]">
                                    <Mail className="h-3 w-3" />
                                    <span className="text-xs">{parent.email}</span>
                                  </a>
                                )}
                                {parent.phone && (
                                  <a href={`tel:${parent.phone}`} className="flex items-center gap-1 hover:text-[#1B4079]">
                                    <Phone className="h-3 w-3" />
                                    <span className="text-xs">{parent.phone}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Parents List */}
          {activeTab === "parents" && (
            <div className="grid gap-4">
              {parents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No se encontraron padres
                </div>
              ) : (
                parents.map((parent) => (
                  <div
                    key={parent.id}
                    className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{parent.name}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <a href={`mailto:${parent.email}`} className="flex items-center gap-1 hover:text-[#1B4079]">
                              <Mail className="h-3 w-3" />
                              {parent.email}
                            </a>
                            {parent.phone && (
                              <a href={`tel:${parent.phone}`} className="flex items-center gap-1 hover:text-[#1B4079]">
                                <Phone className="h-3 w-3" />
                                {parent.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      {parent.children.length > 0 && (
                        <div className="sm:text-right">
                          <p className="text-xs text-gray-400 mb-1">Hijos:</p>
                          {parent.children.map((child) => (
                            <p key={child.id} className="text-sm text-gray-700">
                              {child.firstName} {child.lastName}
                              <span className="text-gray-400 ml-1">({child.group?.name || "Sin grupo"})</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Staff List */}
          {activeTab === "staff" && (
            <div className="grid gap-4">
              {staff.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No se encontró personal
                </div>
              ) : (
                staff.map((person) => (
                  <div
                    key={person.id}
                    className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          person.role === "ADMIN" ? "bg-purple-100" : "bg-green-100"
                        }`}>
                          <UserCheck className={`h-6 w-6 ${
                            person.role === "ADMIN" ? "text-purple-600" : "text-green-600"
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{person.name}</h3>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                            person.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {person.role === "ADMIN" ? "Administrador" : "Profesor"}
                          </span>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                            <a href={`mailto:${person.email}`} className="flex items-center gap-1 hover:text-[#1B4079]">
                              <Mail className="h-3 w-3" />
                              {person.email}
                            </a>
                            {person.phone && (
                              <a href={`tel:${person.phone}`} className="flex items-center gap-1 hover:text-[#1B4079]">
                                <Phone className="h-3 w-3" />
                                {person.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      {person.teacherGroups.length > 0 && (
                        <div className="sm:text-right">
                          <p className="text-xs text-gray-400 mb-1">Grupos asignados:</p>
                          <div className="flex flex-wrap gap-1 sm:justify-end">
                            {person.teacherGroups.map((group) => (
                              <span
                                key={group.id}
                                className="text-xs bg-[#CBDF90]/30 text-[#1B4079] px-2 py-0.5 rounded"
                              >
                                {group.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 py-1 text-sm">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
