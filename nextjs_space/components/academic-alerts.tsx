"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Bell,
  X,
  BookOpen,
  FileCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type AlertType = "PROXIMA" | "VENCIDA" | "PENDIENTE_CALIFICAR" | "SIN_ENTREGAR";
type AlertPriority = "HIGH" | "MEDIUM" | "LOW";

interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  description: string;
  taskId: string;
  taskTitle: string;
  dueDate: string;
  studentName?: string;
  subjectName?: string;
  daysRemaining?: number;
  daysOverdue?: number;
}

interface AlertsSummary {
  total: number;
  high: number;
  medium: number;
  low: number;
}

interface AcademicAlertsProps {
  maxAlerts?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export function AcademicAlerts({
  maxAlerts = 5,
  showHeader = true,
  compact = false,
}: AcademicAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<AlertsSummary>({ total: 0, high: 0, medium: 0, low: 0 });
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/academic/alerts");
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.alerts || []);
          setSummary(data.summary || { total: 0, high: 0, medium: 0, low: 0 });
        }
      } catch (error) {
        console.error("Error fetching alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  };

  const visibleAlerts = alerts
    .filter((a) => !dismissedAlerts.has(a.id))
    .slice(0, maxAlerts);

  const getAlertIcon = (type: AlertType, priority: AlertPriority) => {
    if (type === "VENCIDA") {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    if (type === "PROXIMA") {
      return <Clock className={`w-5 h-5 ${priority === "HIGH" ? "text-orange-500" : "text-yellow-500"}`} />;
    }
    if (type === "PENDIENTE_CALIFICAR") {
      return <FileCheck className="w-5 h-5 text-blue-500" />;
    }
    return <Bell className="w-5 h-5 text-gray-500" />;
  };

  const getAlertBgColor = (type: AlertType, priority: AlertPriority) => {
    if (type === "VENCIDA") return "bg-red-50 border-red-200 hover:bg-red-100";
    if (type === "PROXIMA" && priority === "HIGH") return "bg-orange-50 border-orange-200 hover:bg-orange-100";
    if (type === "PROXIMA") return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
    if (type === "PENDIENTE_CALIFICAR") return "bg-blue-50 border-blue-200 hover:bg-blue-100";
    return "bg-gray-50 border-gray-200 hover:bg-gray-100";
  };

  const getPriorityBadge = (priority: AlertPriority) => {
    if (priority === "HIGH") {
      return <Badge variant="destructive" className="text-xs">Urgente</Badge>;
    }
    if (priority === "MEDIUM") {
      return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Importante</Badge>;
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-pulse flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleAlerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
            <p className="text-gray-600 font-medium">¡Todo al día!</p>
            <p className="text-sm text-gray-500">No tienes alertas pendientes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#1B4079]" />
              Alertas Académicas
              {summary.high > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {summary.high} urgente{summary.high !== 1 && "s"}
                </Badge>
              )}
            </CardTitle>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver tareas
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-0" : "py-4"}>
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {visibleAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={alert.taskId ? `/tasks/${alert.taskId}` : "/tasks"}>
                  <div
                    className={`relative p-3 rounded-lg border transition-colors cursor-pointer ${getAlertBgColor(
                      alert.type,
                      alert.priority
                    )}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getAlertIcon(alert.type, alert.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 text-sm">
                            {alert.title}
                          </span>
                          {getPriorityBadge(alert.priority)}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5 truncate">
                          {alert.description}
                        </p>
                        {!compact && (
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            {alert.studentName && (
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1B4079]"></span>
                                {alert.studentName}
                              </span>
                            )}
                            {alert.subjectName && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {alert.subjectName}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(alert.dueDate), "d MMM", { locale: es })}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          dismissAlert(alert.id);
                        }}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        title="Descartar"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {alerts.length > maxAlerts && (
          <div className="mt-3 text-center">
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="text-[#1B4079]">
                Ver {alerts.length - maxAlerts} alerta{alerts.length - maxAlerts !== 1 && "s"} más
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente para mostrar solo el contador de alertas (para el header)
export function AlertsCounter() {
  const [count, setCount] = useState(0);
  const [highCount, setHighCount] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/academic/alerts");
        if (res.ok) {
          const data = await res.json();
          setCount(data.summary?.total || 0);
          setHighCount(data.summary?.high || 0);
        }
      } catch {
        // Silent fail
      }
    };

    fetchAlerts();
    // Refetch every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <Link href="/tasks" className="relative">
      <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
        <AlertTriangle className={`w-5 h-5 ${highCount > 0 ? "text-red-500" : "text-yellow-500"}`} />
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      </div>
    </Link>
  );
}
