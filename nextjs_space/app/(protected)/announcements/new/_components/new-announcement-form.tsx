"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, FileText, Type, AlertTriangle, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";

export function NewAnnouncementForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"NORMAL" | "URGENT">("NORMAL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title?.trim() || !content?.trim()) {
      toast.error("Por favor, completa todos los campos");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, priority }),
      });

      if (res.ok) {
        toast.success("Anuncio publicado exitosamente");
        router.push("/announcements");
      } else {
        const data = await res.json();
        toast.error(data?.error ?? "Error al publicar el anuncio");
      }
    } catch (error) {
      toast.error("Error al publicar el anuncio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/announcements"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B4079] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a anuncios
      </Link>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nuevo Anuncio</h1>
        <p className="text-gray-500 mb-8">
          Crea un anuncio para comunicarte con los padres de familia
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título del anuncio *
            </label>
            <div className="relative">
              <Type className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Reunión de padres de familia"
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-2 focus:ring-[#1B4079]/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Contenido *
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe el contenido del anuncio..."
                required
                rows={6}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-2 focus:ring-[#1B4079]/20 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Prioridad</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPriority("NORMAL")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  priority === "NORMAL"
                    ? "border-[#1B4079] bg-[#1B4079]/5 text-[#1B4079]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <span className="font-medium">Normal</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority("URGENT")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  priority === "URGENT"
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Urgente</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#1B4079] text-white font-semibold rounded-xl hover:bg-[#4D7C8A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Publicar anuncio
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
