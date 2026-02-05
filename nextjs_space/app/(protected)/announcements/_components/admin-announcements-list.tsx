"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Plus, Search } from "lucide-react";
import { AnnouncementCard } from "@/components/announcement-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import toast from "react-hot-toast";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "NORMAL" | "URGENT";
  createdAt: string;
  createdBy: { name: string };
  readCount: number;
  totalParents: number;
}

export function AdminAnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data?.announcements ?? []);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este anuncio?")) return;

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Anuncio eliminado correctamente");
        setAnnouncements((prev) => (prev ?? [])?.filter((a) => a?.id !== id));
      } else {
        toast.error("Error al eliminar el anuncio");
      }
    } catch (error) {
      toast.error("Error al eliminar el anuncio");
    }
  };

  const filteredAnnouncements = (announcements ?? [])?.filter(
    (a) =>
      a?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase() ?? "") ||
      a?.content?.toLowerCase()?.includes(searchQuery?.toLowerCase() ?? "")
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Anuncios</h1>
          <p className="text-gray-500 mt-1">Administra los anuncios del colegio</p>
        </div>
        <Link
          href="/announcements/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B4079] text-white font-semibold rounded-lg hover:bg-[#4D7C8A] transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo anuncio
        </Link>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar anuncios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-2 focus:ring-[#1B4079]/20 outline-none transition-all"
        />
      </motion.div>

      {/* List */}
      {(filteredAnnouncements ?? [])?.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No hay anuncios"
          description="Comienza creando tu primer anuncio para comunicarte con los padres de familia."
          action={
            <Link
              href="/announcements/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4079] text-white font-semibold rounded-lg hover:bg-[#4D7C8A] transition-all"
            >
              <Plus className="w-5 h-5" />
              Crear anuncio
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {(filteredAnnouncements ?? [])?.map((announcement, index) => (
            <AnnouncementCard
              key={announcement?.id}
              {...(announcement ?? {})}
              isAdmin
              onDelete={handleDelete}
              delay={0.05 * (index + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
