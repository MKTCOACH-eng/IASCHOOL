"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Trash2, Copy, CheckCircle, Clock, XCircle, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface Invitation {
  id: string;
  email: string;
  role: string;
  tempPassword: string;
  token: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt: string | null;
  user: { id: string; name: string; email: string } | null;
  school?: { code: string };
  schoolCode?: string;
}

export default function InvitationsPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newInvitation, setNewInvitation] = useState<Partial<Invitation> | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("PADRE");

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await fetch("/api/invitations");
      if (response.status === 403) {
        // Not authorized - redirect to dashboard
        router.push("/dashboard");
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Error al crear invitación");
        return;
      }

      setNewInvitation(data.invitation);
      setEmail("");
      setRole("PADRE");
      fetchInvitations();
      toast.success("Invitación creada exitosamente");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta invitación?")) return;

    try {
      const response = await fetch(`/api/invitations?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setInvitations(invitations.filter((inv) => inv.id !== id));
        toast.success("Invitación eliminada");
      }
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Aceptada
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" /> Expirada
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN": return "Administrador";
      case "PROFESOR": return "Profesor";
      case "PADRE": return "Padre";
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invitaciones</h1>
          <p className="text-gray-600">Gestiona las invitaciones de usuarios</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4079] text-white font-medium rounded-lg hover:bg-[#4D7C8A] transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Nueva invitación
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Crear nueva invitación</h2>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent outline-none"
                placeholder="usuario@email.com"
                required
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent outline-none"
              >
                <option value="PADRE">Padre</option>
                <option value="PROFESOR">Profesor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 bg-[#1B4079] text-white font-medium rounded-lg hover:bg-[#4D7C8A] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Crear
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Invitation Details */}
      {newInvitation && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-green-800 mb-2">¡Invitación creada!</h3>
              <p className="text-green-700 text-sm mb-4">Comparte estos datos con el usuario:</p>
            </div>
            <button
              onClick={() => setNewInvitation(null)}
              className="text-green-600 hover:text-green-800"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between bg-white rounded-lg p-3">
              <div>
                <span className="text-gray-500">Link de registro:</span>
                <p className="font-mono text-xs break-all">{baseUrl}/enroll?token={newInvitation.token}</p>
              </div>
              <button
                onClick={() => copyToClipboard(`${baseUrl}/enroll?token=${newInvitation.token}`, "Link")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex items-center justify-between bg-white rounded-lg p-3">
              <div>
                <span className="text-gray-500">Código del colegio:</span>
                <p className="font-bold">{newInvitation.schoolCode}</p>
              </div>
              <button
                onClick={() => copyToClipboard(newInvitation.schoolCode || "", "Código")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex items-center justify-between bg-white rounded-lg p-3">
              <div>
                <span className="text-gray-500">Contraseña temporal:</span>
                <p className="font-bold font-mono">{newInvitation.tempPassword}</p>
              </div>
              <button
                onClick={() => copyToClipboard(newInvitation.tempPassword || "", "Contraseña")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invitations List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rol</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No hay invitaciones aún</p>
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{inv.email}</p>
                        {inv.user && (
                          <p className="text-xs text-gray-500">{inv.user.name}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{getRoleName(inv.role)}</td>
                    <td className="py-3 px-4">{getStatusBadge(inv.status)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(inv.createdAt).toLocaleDateString("es-MX")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {inv.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyToClipboard(`${baseUrl}/enroll?token=${inv.token}`, "Link")}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#1B4079]"
                            title="Copiar link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
