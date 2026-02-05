"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Users, Plus, ArrowRight, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { AnnouncementCard } from "@/components/announcement-card";
import { LoadingSpinner } from "@/components/loading-spinner";

interface AdminDashboardProps {
  userId: string;
  schoolId: string;
  userName: string;
}

interface Stats {
  totalAnnouncements: number;
  totalParents: number;
}

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

export function AdminDashboard({ userId, schoolId, userName }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, announcementsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/announcements?limit=3"),
        ]);

        if (statsRes.ok && announcementsRes.ok) {
          const statsData = await statsRes.json();
          const announcementsData = await announcementsRes.json();
          setStats(statsData);
          setRecentAnnouncements(announcementsData?.announcements ?? []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Hola, {userName ?? "Administrador"} 👋</h1>
        <p className="text-white/80 mb-6">
          Bienvenido al panel de administración. Aquí puedes gestionar los anuncios del colegio.
        </p>
        <Link
          href="/announcements/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#1B4079] font-semibold rounded-lg hover:bg-[#CBDF90] transition-all"
        >
          <Plus className="w-5 h-5" />
          Publicar nuevo anuncio
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard
          title="Total de anuncios"
          value={stats?.totalAnnouncements ?? 0}
          icon={Bell}
          color="#1B4079"
          delay={0.1}
        />
        <StatCard
          title="Padres registrados"
          value={stats?.totalParents ?? 0}
          icon={Users}
          color="#4D7C8A"
          delay={0.2}
        />
      </div>

      {/* Recent Announcements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1B4079]" />
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
          {(recentAnnouncements ?? [])?.map((announcement, index) => (
            <AnnouncementCard
              key={announcement?.id}
              {...(announcement ?? {})}
              isAdmin
              totalParents={announcement?.totalParents ?? 0}
              delay={0.1 * (index + 1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
