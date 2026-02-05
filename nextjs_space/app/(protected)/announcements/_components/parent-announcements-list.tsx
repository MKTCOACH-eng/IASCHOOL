"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, Filter } from "lucide-react";
import { AnnouncementCard } from "@/components/announcement-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";

interface ParentAnnouncementsListProps {
  userId: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "NORMAL" | "URGENT";
  createdAt: string;
  createdBy: { name: string };
  isRead: boolean;
}

type FilterType = "all" | "read" | "unread";

export function ParentAnnouncementsList({ userId }: ParentAnnouncementsListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

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

  const handleAnnouncementClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await fetch("/api/announcements/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ announcementId: id }),
        });
        // Update local state
        setAnnouncements((prev) =>
          (prev ?? [])?.map((a) => (a?.id === id ? { ...(a ?? {}), isRead: true } : a))
        );
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
  };

  const filteredAnnouncements = (announcements ?? [])?.filter((a) => {
    if (filter === "read") return a?.isRead;
    if (filter === "unread") return !a?.isRead;
    return true;
  });

  const filterButtons = [
    { key: "all" as FilterType, label: "Todos" },
    { key: "unread" as FilterType, label: "No leídos" },
    { key: "read" as FilterType, label: "Leídos" },
  ];

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
      >
        <h1 className="text-2xl font-bold text-gray-900">Anuncios</h1>
        <p className="text-gray-500 mt-1">Mantente informado con las novedades del colegio</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2"
      >
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex gap-2">
          {filterButtons?.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === btn.key
                  ? "bg-[#1B4079] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* List */}
      {(filteredAnnouncements ?? [])?.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === "unread" ? "No hay anuncios sin leer" : "No hay anuncios"}
          description={
            filter === "unread"
              ? "¡Excelente! Estás al día con todos los anuncios."
              : "Aún no hay anuncios publicados por el colegio."
          }
        />
      ) : (
        <div className="space-y-4">
          {(filteredAnnouncements ?? [])?.map((announcement, index) => (
            <AnnouncementCard
              key={announcement?.id}
              {...(announcement ?? {})}
              isRead={announcement?.isRead ?? false}
              onClick={() => handleAnnouncementClick(announcement?.id, announcement?.isRead ?? false)}
              delay={0.05 * (index + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
