"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  Search,
  Plus,
  Loader2,
  User,
  BellOff,
  ChevronRight,
  GraduationCap,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Participant {
  id: string;
  name: string;
  role: string;
}

interface LastMessage {
  content: string;
  senderName: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  type: string;
  name: string;
  participants: Participant[];
  lastMessage: LastMessage | null;
  unreadCount: number;
  isMuted: boolean;
  groupId: string | null;
  groupName: string | null;
  createdAt: string;
}

interface UserForChat {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface GroupInfo {
  id: string;
  name: string;
  studentsCount: number;
  teacher: { id: string; name: string } | null;
  childName?: string;
  existingChat: { id: string; _count: { participants: number } } | null;
}

export default function MessagesPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserForChat[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState<"direct" | "groups">("direct");
  const [myGroups, setMyGroups] = useState<GroupInfo[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [joiningGroup, setJoiningGroup] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
    fetchMyGroups();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar conversaciones");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await fetch("/api/groups/my-groups");
      if (res.ok) {
        const data = await res.json();
        setMyGroups(data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const joinGroupChat = async (groupId: string) => {
    setJoiningGroup(groupId);
    try {
      const res = await fetch(`/api/groups/${groupId}/join-chat`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.isNew ? "Chat de grupo creado" : "Te uniste al chat");
        router.push(`/messages/${data.conversationId}`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al unirse al chat");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al unirse al chat del grupo");
    } finally {
      setJoiningGroup(null);
    }
  };

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/conversations/users");
      if (res.ok) {
        const data = await res.json();
        setAvailableUsers(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const startNewConversation = async (userId: string) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DIRECT",
          participantIds: [userId],
        }),
      });

      if (res.ok) {
        const conv = await res.json();
        router.push(`/messages/${conv.id}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear conversación");
    }
  };

  // Separar conversaciones directas y grupales
  const directConversations = conversations.filter(
    (conv) => conv.type === "DIRECT"
  );
  const groupConversations = conversations.filter(
    (conv) => conv.type !== "DIRECT"
  );

  const filteredDirectConversations = directConversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participants.some((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const filteredGroupConversations = groupConversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.groupName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return date.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Ayer";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("es-MX", { weekday: "short" });
    } else {
      return date.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
      });
    }
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case "DIRECT":
        return <User className="w-5 h-5" />;
      case "GROUP_PARENTS":
      case "GROUP_STUDENTS":
        return <Users className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-700",
      PROFESOR: "bg-blue-100 text-blue-700",
      PADRE: "bg-green-100 text-green-700",
      ALUMNO: "bg-orange-100 text-orange-700",
    };
    const labels: Record<string, string> = {
      ADMIN: "Admin",
      PROFESOR: "Profesor",
      PADRE: "Padre",
      ALUMNO: "Alumno",
    };
    return (
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors[role] || "bg-gray-100 text-gray-700"}`}
      >
        {labels[role] || role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
          <p className="text-gray-500 text-sm">
            Comunicación centralizada con profesores y el colegio
          </p>
        </div>
        <Button
          onClick={() => {
            setShowNewChat(!showNewChat);
            if (!showNewChat) fetchAvailableUsers();
          }}
          className="bg-[#1B4079] hover:bg-[#1B4079]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva conversación
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Buscar conversaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* New Chat Panel */}
      {showNewChat && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Nueva conversación</h3>
          {loadingUsers ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : availableUsers.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              No hay usuarios disponibles para chatear
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => startNewConversation(user.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1B4079]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#1B4079]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                      {getRoleBadge(user.role)}
                    </div>
                    <span className="text-sm text-gray-500">{user.email}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("direct")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "direct"
              ? "bg-white text-[#1B4079] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <User className="w-4 h-4" />
          Directos
          {directConversations.length > 0 && (
            <span className="bg-[#1B4079]/10 text-[#1B4079] text-xs px-2 py-0.5 rounded-full">
              {directConversations.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "groups"
              ? "bg-white text-[#1B4079] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Users className="w-4 h-4" />
          Grupos
          {groupConversations.length > 0 && (
            <span className="bg-[#1B4079]/10 text-[#1B4079] text-xs px-2 py-0.5 rounded-full">
              {groupConversations.length}
            </span>
          )}
        </button>
      </div>

      {/* Direct Conversations Tab */}
      {activeTab === "direct" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filteredDirectConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {searchTerm
                  ? "No se encontraron conversaciones"
                  : "No hay conversaciones directas"}
              </h3>
              <p className="text-gray-500 text-sm">
                {searchTerm
                  ? "Intenta con otro término de búsqueda"
                  : "Inicia una nueva conversación con un profesor o administrador"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredDirectConversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        conv.unreadCount > 0
                          ? "bg-[#1B4079] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getConversationIcon(conv.type)}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium truncate ${
                            conv.unreadCount > 0
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {conv.name}
                        </span>
                        {conv.participants[0] &&
                          getRoleBadge(conv.participants[0].role)}
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {conv.lastMessage
                          ? formatTime(conv.lastMessage.createdAt)
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm truncate flex-1 ${
                          conv.unreadCount > 0
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {conv.lastMessage ? (
                          <>
                            <span className="text-gray-400">
                              {conv.lastMessage.senderName}:
                            </span>{" "}
                            {conv.lastMessage.content}
                          </>
                        ) : (
                          <span className="text-gray-400 italic">
                            Sin mensajes aún
                          </span>
                        )}
                      </p>
                      {conv.isMuted && (
                        <BellOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === "groups" && (
        <div className="space-y-4">
          {/* My Groups Section */}
          {myGroups.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#1B4079]" />
                  Mis grupos escolares
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Grupos de tus hijos donde puedes comunicarte con otros padres y profesores
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {myGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#CBDF90]/30 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#1B4079]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{group.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-3">
                        <span>{group.studentsCount} alumnos</span>
                        {group.teacher && (
                          <span>• Prof. {group.teacher.name}</span>
                        )}
                        {group.childName && (
                          <span className="text-[#1B4079]">• {group.childName}</span>
                        )}
                      </div>
                    </div>
                    {group.existingChat ? (
                      <Link
                        href={`/messages/${group.existingChat.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1B4079] text-white rounded-lg hover:bg-[#1B4079]/90 transition-colors text-sm font-medium"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Ver chat ({group.existingChat._count.participants})
                      </Link>
                    ) : (
                      <button
                        onClick={() => joinGroupChat(group.id)}
                        disabled={joiningGroup === group.id}
                        className="flex items-center gap-2 px-4 py-2 bg-[#CBDF90] text-[#1B4079] rounded-lg hover:bg-[#CBDF90]/80 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {joiningGroup === group.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        Crear chat de grupo
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Group Chats */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#1B4079]" />
                Chats de grupo activos
              </h3>
            </div>
            {filteredGroupConversations.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No hay chats de grupo activos
                </h3>
                <p className="text-gray-500 text-sm">
                  {myGroups.length > 0
                    ? "Crea un chat de grupo desde la sección anterior"
                    : "No tienes grupos asignados"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredGroupConversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          conv.unreadCount > 0
                            ? "bg-[#1B4079] text-white"
                            : "bg-[#CBDF90]/30 text-[#1B4079]"
                        }`}
                      >
                        <Users className="w-6 h-6" />
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-medium truncate ${
                            conv.unreadCount > 0
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {conv.name}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {conv.lastMessage
                            ? formatTime(conv.lastMessage.createdAt)
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm truncate flex-1 ${
                            conv.unreadCount > 0
                              ? "text-gray-900 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {conv.lastMessage ? (
                            <>
                              <span className="text-gray-400">
                                {conv.lastMessage.senderName}:
                              </span>{" "}
                              {conv.lastMessage.content}
                            </>
                          ) : (
                            <span className="text-gray-400 italic">
                              Sin mensajes aún
                            </span>
                          )}
                        </p>
                        {conv.isMuted && (
                          <BellOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Loading state for groups */}
          {loadingGroups && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B4079]" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
