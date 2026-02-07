"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Bell, BellRing, ArrowRight, ClipboardList, FileText } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { AnnouncementCard } from "@/components/announcement-card";
import { AcademicAlerts } from "@/components/academic-alerts";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";

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
  const { t } = useLanguage();
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
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://cdn.abacus.ai/images/7d6234c5-6667-407b-b59d-fe8fe2bad088.png"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B4079]/95 to-[#4D7C8A]/85" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t.dashboard.welcome}, {userName ?? t.roles.parent} 👋</h1>
          <p className="text-white/80">
            {t.dashboard.welcomeParent}
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          title={t.dashboard.unreadAnnouncements}
          value={unreadCount ?? 0}
          icon={unreadCount > 0 ? BellRing : Bell}
          color={unreadCount > 0 ? "#E53E3E" : "#1B4079"}
          delay={0.1}
        />
        <Link href="/tasks">
          <StatCard
            title={t.nav.tasks}
            value={t.common.viewAll}
            icon={ClipboardList}
            color="#1B4079"
            delay={0.2}
          />
        </Link>
        <Link href="/dashboard/weekly-summary">
          <StatCard
            title="Resumen Semanal"
            value="Ver Ahora"
            icon={FileText}
            color="#4D7C8A"
            delay={0.3}
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
            {t.dashboard.recentAnnouncements}
          </h2>
          <Link
            href="/announcements"
            className="text-sm text-[#1B4079] hover:text-[#4D7C8A] font-medium flex items-center gap-1"
          >
            {t.common.viewAll}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {(recentAnnouncements ?? [])?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t.dashboard.noRecentAnnouncements}</p>
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
