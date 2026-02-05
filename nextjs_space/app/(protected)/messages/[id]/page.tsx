"use client";

import { useState, useEffect, useRef, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Pin,
  X,
  FileText,
  Download,
  SmilePlus,
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

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

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

interface Reaction {
  id: string;
  emoji: string;
  user: {
    id: string;
    name: string;
  };
}

interface Message {
  id: string;
  type: string;
  content: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  isPinned: boolean;
  isEdited: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  reactions: Reaction[];
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [showPinned, setShowPinned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = session?.user as SessionUser | undefined;

  useEffect(() => {
    if (resolvedParams.id) {
      fetchConversation();
      fetchMessages();
      fetchPinnedMessages();
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

  const fetchPinnedMessages = async () => {
    try {
      const res = await fetch(
        `/api/conversations/${resolvedParams.id}/pinned`
      );
      if (res.ok) {
        const data = await res.json();
        setPinnedMessages(data);
      }
    } catch (error) {
      console.error("Error fetching pinned:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || sending) return;

    setSending(true);

    try {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;
      let mimeType = null;
      let messageType = "TEXT";

      // Si hay un archivo, subirlo primero
      if (selectedFile) {
        setUploading(true);
        
        // Obtener presigned URL
        const presignedRes = await fetch("/api/upload/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: selectedFile.name,
            contentType: selectedFile.type,
            isPublic: false,
          }),
        });

        if (!presignedRes.ok) {
          throw new Error("Error al obtener URL de subida");
        }

        const { uploadUrl, cloud_storage_path } = await presignedRes.json();

        // Subir archivo a S3
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: selectedFile,
          headers: {
            "Content-Type": selectedFile.type,
          },
        });

        if (!uploadRes.ok) {
          throw new Error("Error al subir archivo");
        }

        fileUrl = cloud_storage_path;
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
        mimeType = selectedFile.type;
        messageType = selectedFile.type.startsWith("image/") ? "IMAGE" : "FILE";
        setUploading(false);
      }

      const res = await fetch(
        `/api/conversations/${resolvedParams.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newMessage.trim() || fileName || "",
            type: messageType,
            fileUrl,
            fileName,
            fileSize,
            mimeType,
          }),
        }
      );

      if (res.ok) {
        const message = await res.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
        setSelectedFile(null);
        inputRef.current?.focus();
      } else {
        toast.error("Error al enviar mensaje");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al enviar mensaje");
      setUploading(false);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo no debe superar los 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });

      if (res.ok) {
        // Refrescar mensajes para ver reacciones actualizadas
        fetchMessages();
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setShowReactions(null);
  };

  const togglePin = async (messageId: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}/pin`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        fetchMessages();
        fetchPinnedMessages();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al anclar mensaje");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getGroupedReactions = (reactions: Reaction[]) => {
    const grouped: Record<string, { count: number; users: string[]; hasOwn: boolean }> = {};
    reactions.forEach((r) => {
      if (!grouped[r.emoji]) {
        grouped[r.emoji] = { count: 0, users: [], hasOwn: false };
      }
      grouped[r.emoji].count++;
      grouped[r.emoji].users.push(r.user.name);
      if (r.user.id === currentUser?.id) {
        grouped[r.emoji].hasOwn = true;
      }
    });
    return grouped;
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

        {pinnedMessages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPinned(!showPinned)}
            className="relative"
          >
            <Pin className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1B4079] text-white text-[10px] rounded-full flex items-center justify-center">
              {pinnedMessages.length}
            </span>
          </Button>
        )}

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

      {/* Pinned Messages Panel */}
      {showPinned && pinnedMessages.length > 0 && (
        <div className="border-b border-gray-200 bg-amber-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-amber-800 flex items-center gap-1">
              <Pin className="w-4 h-4" />
              Mensajes anclados ({pinnedMessages.length})
            </span>
            <button onClick={() => setShowPinned(false)} className="text-amber-600 hover:text-amber-800">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {pinnedMessages.map((msg) => (
              <div key={msg.id} className="bg-white rounded p-2 text-sm">
                <span className="font-medium text-gray-700">{msg.sender.name}:</span>{" "}
                <span className="text-gray-600">{msg.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
                >
                  <div className="relative max-w-[75%]">
                    {/* Message Actions */}
                    <div
                      className={`absolute top-0 ${isOwn ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}
                    >
                      <button
                        onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Reaccionar"
                      >
                        <SmilePlus className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => togglePin(message.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title={message.isPinned ? "Desanclar" : "Anclar"}
                      >
                        <Pin className={`w-4 h-4 ${message.isPinned ? "text-amber-500" : "text-gray-500"}`} />
                      </button>
                    </div>

                    {/* Reaction Picker */}
                    {showReactions === message.id && (
                      <div className={`absolute ${isOwn ? "right-0" : "left-0"} -top-10 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1 flex items-center gap-1 z-10`}>
                        {REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(message.id, emoji)}
                            className="text-lg hover:scale-125 transition-transform p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      className={`${
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

                      {/* File/Image Content */}
                      {message.type === "IMAGE" && message.fileUrl && (
                        <div className="mb-2">
                          <div className="relative aspect-video max-w-[300px] rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={`/api/files/${encodeURIComponent(message.fileUrl)}`}
                              alt={message.fileName || "Imagen"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {message.type === "FILE" && message.fileUrl && (
                        <a
                          href={`/api/files/${encodeURIComponent(message.fileUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 p-2 rounded-lg mb-2 ${
                            isOwn ? "bg-white/10" : "bg-gray-50"
                          }`}
                        >
                          <FileText className={`w-8 h-8 ${isOwn ? "text-white/80" : "text-[#1B4079]"}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isOwn ? "text-white" : "text-gray-900"}`}>
                              {message.fileName}
                            </p>
                            {message.fileSize && (
                              <p className={`text-xs ${isOwn ? "text-white/70" : "text-gray-500"}`}>
                                {formatFileSize(message.fileSize)}
                              </p>
                            )}
                          </div>
                          <Download className={`w-4 h-4 ${isOwn ? "text-white/80" : "text-gray-400"}`} />
                        </a>
                      )}

                      {message.content && message.type === "TEXT" && (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}

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

                    {/* Reactions Display */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                        {Object.entries(getGroupedReactions(message.reactions)).map(
                          ([emoji, data]) => (
                            <button
                              key={emoji}
                              onClick={() => toggleReaction(message.id, emoji)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                                data.hasOwn
                                  ? "bg-[#1B4079]/10 border border-[#1B4079]/30"
                                  : "bg-gray-100 border border-gray-200"
                              }`}
                              title={data.users.join(", ")}
                            >
                              <span>{emoji}</span>
                              <span className="text-gray-600">{data.count}</span>
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200">
            <FileText className="w-8 h-8 text-[#1B4079]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 p-4 border-t border-gray-200 bg-white"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || uploading}
          title="Adjuntar archivo"
        >
          <Paperclip className="w-5 h-5 text-gray-500" />
        </Button>
        <Input
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1"
          disabled={sending || uploading}
        />
        <Button
          type="submit"
          disabled={(!newMessage.trim() && !selectedFile) || sending || uploading}
          className="bg-[#1B4079] hover:bg-[#1B4079]/90"
        >
          {sending || uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
