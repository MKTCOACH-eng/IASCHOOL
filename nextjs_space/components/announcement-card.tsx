"use client";

import { motion } from "framer-motion";
import { Calendar, Bell, AlertTriangle, Eye, EyeOff, Trash2, Users } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AnnouncementCardProps {
  id: string;
  title: string;
  content: string;
  priority: "NORMAL" | "URGENT";
  createdAt: string | Date;
  createdBy?: { name: string } | string;
  isRead?: boolean;
  readCount?: number;
  totalParents?: number;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onClick?: () => void;
  delay?: number;
}

export function AnnouncementCard({
  id,
  title,
  content,
  priority,
  createdAt,
  createdBy,
  isRead = true,
  readCount,
  totalParents,
  isAdmin = false,
  onDelete,
  onClick,
  delay = 0,
}: AnnouncementCardProps) {
  const isUrgent = priority === "URGENT";
  const formattedDate = format(new Date(createdAt), "d 'de' MMMM, yyyy", { locale: es });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className={`group relative bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${
        isUrgent ? "border-l-red-500" : "border-l-[#1B4079]"
      } ${!isRead ? "ring-2 ring-[#CBDF90] ring-offset-2" : ""}`}
    >
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {isUrgent && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle className="w-3 h-3" />
            Urgente
          </span>
        )}
        {!isRead && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#CBDF90] text-[#1B4079]">
            <EyeOff className="w-3 h-3" />
            Nuevo
          </span>
        )}
        {isRead && !isAdmin && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            <Eye className="w-3 h-3" />
            Leído
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#1B4079] transition-colors">
        {title}
      </h3>

      {/* Content Preview */}
      <p className="text-gray-600 text-sm line-clamp-2 mb-4">{content}</p>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          {createdBy && (
            <span className="hidden sm:flex items-center gap-1">
              <Bell className="w-3.5 h-3.5" />
              {typeof createdBy === "string" ? createdBy : createdBy?.name}
            </span>
          )}
        </div>

        {isAdmin && readCount !== undefined && totalParents !== undefined && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-[#4D7C8A]">
              <Users className="w-3.5 h-3.5" />
              {readCount}/{totalParents} leído
            </span>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
