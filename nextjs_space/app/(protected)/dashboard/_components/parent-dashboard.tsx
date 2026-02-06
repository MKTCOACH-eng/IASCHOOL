"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, BellRing, ArrowRight, ClipboardList } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { AnnouncementCard } from "@/components/announcement-card";
import { AcademicAlerts } from "@/components/academic-alerts";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useRouter } from "next/navigation";

interface ParentDashboardProps {
  userId: string;
  schoolId: string;
  userName: string;
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

export function ParentDashboard({ userId, schoolId, userName }: ParentDashboardProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/announcements?limit=3");

        if (res.ok) {
          const data = await res.json();
          setRecentAnnouncements(data?.announcements ?? []);
          setUnreadCount(data?.unreadCount ?? 0);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAnnouncementClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await fetch("/api/announcements/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ announcementId: id }),
        });
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
    router.push("/announcements");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1B4079] to-[#4D7C8A] rounded-2xl p-6 sm:p-8 text-white"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Hola, {userName ?? "Padre"} 👋</h1>
        <p className="text-white/80">
          Mantente al día con todos los anuncios importantes del colegio.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard
          title="Anuncios sin leer"
          value={unreadCount ?? 0}
          icon={unreadCount > 0 ? BellRing : Bell}
          color={unreadCount > 0 ? "#E53E3E" : "#1B4079"}
          delay={0.1}
        />
        <Link href="/tasks">
          <StatCard
            title="Tareas"
            value="Ver todas"
            icon={ClipboardList}
            color="#1B4079"
            delay={0.2}
          />
        </Link>
      </div>

      {/* Academic Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AcademicAlerts maxAlerts={4} />
      </motion.div>

      {/* Recent Announcements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#1B4079]" />
            Últimos anuncios
          </h2>
          <Link
            href="/announcements"
            className="text-sm text-[#1B4079] hover:text-[#4D7C8A] font-medium flex items-center gap-1"
          >
            Ver todos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {(recentAnnouncements ?? [])?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay anuncios recientes.</p>
          ) : (
            (recentAnnouncements ?? [])?.map((announcement, index) => (
              <AnnouncementCard
                key={announcement?.id}
                {...(announcement ?? {})}
                isRead={announcement?.isRead ?? false}
                onClick={() => handleAnnouncementClick(announcement?.id, announcement?.isRead ?? false)}
                delay={0.1 * (index + 1)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
