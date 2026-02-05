"use client";

import { useState, useEffect, useRef, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Loader2,
  MoreVertical,
  BellOff,
  Bell,
  User,
  Users,
  Paperclip,
  Image as ImageIcon,
  Pin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Participant {
  id: string;
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
  isMuted: boolean;
  lastReadAt: string | null;
}

interface ConversationDetails {
  id: string;
  type: string;
  name: string | null;
  participants: Participant[];
  group: {
    id: string;
    name: string;
    grade: string;
    section: string;
  } | null;
}

interface Message {
  id: string;
  type: string;
  content: string;
  fileUrl: string | null;
  fileName: string | null;
  isPinned: boolean;
  isEdited: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
}

interface SessionUser {
  id: string;
  name: string;
  role: string;
}

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { data: session } = useSession() || {};
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [conversation, setConversation] = useState<ConversationDetails | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const currentUser = session?.user as SessionUser | undefined;

  useEffect(() => {
    if (resolvedParams.id) {
      fetchConversation();
      fetchMessages();
      // Poll for new messages
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = async () => {
    try {
      const res = await fetch(`/api/conversations/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setConversation(data);
        const myParticipation = data.participants.find(
          (p: Participant) => p.user.id === currentUser?.id
        );
        setIsMuted(myParticipation?.isMuted || false);
      } else if (res.status === 404) {
        toast.error("Conversación no encontrada");
        router.push("/messages");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `/api/conversations/${resolvedParams.id}/messages`
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(
        `/api/conversations/${resolvedParams.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newMessage.trim() }),
        }
      );

      if (res.ok) {
        const message = await res.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
        inputRef.current?.focus();
      } else {
        toast.error("Error al enviar mensaje");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al enviar mensaje");
    } finally {
      setSending(false);
    }
  };

  const toggleMute = async () => {
    try {
      const res = await fetch(`/api/conversations/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isMuted: !isMuted }),
      });

      if (res.ok) {
        setIsMuted(!isMuted);
        toast.success(
          isMuted ? "Notificaciones activadas" : "Conversación silenciada"
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getConversationName = () => {
    if (!conversation) return "Cargando...";
    if (conversation.name) return conversation.name;
    if (conversation.type === "DIRECT") {
      const other = conversation.participants.find(
        (p) => p.user.id !== currentUser?.id
      );
      return other?.user.name || "Conversación";
    }
    return conversation.group?.name || "Grupo";
  };

  const getConversationSubtitle = () => {
    if (!conversation) return "";
    if (conversation.type === "DIRECT") {
      const other = conversation.participants.find(
        (p) => p.user.id !== currentUser?.id
      );
      const roleLabels: Record<string, string> = {
        ADMIN: "Administrador",
        PROFESOR: "Profesor",
        PADRE: "Padre de familia",
        ALUMNO: "Alumno",
      };
      return roleLabels[other?.user.role || ""] || "";
    }
    return `${conversation.participants.length} participantes`;
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateDivider = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return date.toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
  };

  const shouldShowDateDivider = (index: number) => {
    if (index === 0) return true;
    const currentDate = new Date(messages[index].createdAt).toDateString();
    const prevDate = new Date(messages[index - 1].createdAt).toDateString();
    return currentDate !== prevDate;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-purple-500",
      PROFESOR: "bg-blue-500",
      PADRE: "bg-green-500",
      ALUMNO: "bg-orange-500",
    };
    return colors[role] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-white">
        <Link
          href="/messages"
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>

        <div className="w-10 h-10 rounded-full bg-[#1B4079] text-white flex items-center justify-center">
          {conversation?.type === "DIRECT" ? (
            <User className="w-5 h-5" />
          ) : (
            <Users className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{getConversationName()}</h2>
          <p className="text-sm text-gray-500">{getConversationSubtitle()}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={toggleMute}>
              {isMuted ? (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Activar notificaciones
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 mr-2" />
                  Silenciar conversación
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">
              Inicia la conversación
            </h3>
            <p className="text-sm text-gray-500">
              Envía el primer mensaje para comenzar
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender.id === currentUser?.id;
            const showDivider = shouldShowDateDivider(index);

            return (
              <div key={message.id}>
                {showDivider && (
                  <div className="flex items-center justify-center my-4">
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                      {formatDateDivider(message.createdAt)}
                    </span>
                  </div>
                )}

                <div
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] ${
                      isOwn
                        ? "bg-[#1B4079] text-white rounded-tl-2xl rounded-tr-sm rounded-bl-2xl rounded-br-2xl"
                        : "bg-white border border-gray-200 text-gray-900 rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl"
                    } px-4 py-2 shadow-sm`}
                  >
                    {!isOwn && conversation?.type !== "DIRECT" && (
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${getRoleBadgeColor(
                            message.sender.role
                          )}`}
                        />
                        <span className="text-xs font-medium text-gray-600">
                          {message.sender.name}
                        </span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 ${
                        isOwn ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {message.isPinned && <Pin className="w-3 h-3" />}
                      {message.isEdited && (
                        <span className="text-[10px]">editado</span>
                      )}
                      <span className="text-[10px]">
                        {formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 p-4 border-t border-gray-200 bg-white"
      >
        <Input
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1"
          disabled={sending}
        />
        <Button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-[#1B4079] hover:bg-[#1B4079]/90"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
