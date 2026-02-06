"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Bell, Home, Plus, Menu, X, UserPlus, MessageSquare, ClipboardList, Calendar, Wallet, BarChart3, Users, Vote, FileSignature, Bot, Building2, Settings, Activity } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertsCounter } from "@/components/academic-alerts";

interface HeaderProps {
  user?: {
    name?: string;
    role?: string;
    schoolName?: string;
  };
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isAdmin = user?.role === "ADMIN";
  const isTeacher = user?.role === "PROFESOR";
  const isStudent = user?.role === "ALUMNO";
  const isVocal = user?.role === "VOCAL";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const getRoleName = () => {
    switch (user?.role) {
      case "SUPER_ADMIN": return "Super Admin";
      case "ADMIN": return "Administrador";
      case "PROFESOR": return "Profesor";
      case "ALUMNO": return "Alumno";
      case "VOCAL": return "Vocal de Grupo";
      default: return "Padre de familia";
    }
  };

  const getNavItems = () => {
    // Items para Super Admin (gestión global)
    if (isSuperAdmin) {
      return [
        { href: "/super-admin", label: "Dashboard", icon: Home },
        { href: "/super-admin/schools", label: "Escuelas", icon: Building2 },
        { href: "/super-admin/config", label: "Configuración", icon: Settings },
        { href: "/super-admin/audit", label: "Auditoría", icon: Activity },
      ];
    }

    // Items para alumnos (vista simplificada)
    if (isStudent) {
      return [
        { href: "/dashboard", label: "Inicio", icon: Home },
        { href: "/tasks", label: "Tareas", icon: ClipboardList },
        { href: "/calendar", label: "Calendario", icon: Calendar },
        { href: "/messages", label: "Mensajes", icon: MessageSquare },
        { href: "/attendance", label: "Asistencia", icon: Users },
        { href: "/documents", label: "Documentos", icon: FileSignature },
        { href: "/announcements", label: "Anuncios", icon: Bell },
      ];
    }

    const baseItems = [
      { href: "/dashboard", label: "Inicio", icon: Home },
      { href: "/messages", label: "Mensajes", icon: MessageSquare },
      { href: "/tasks", label: "Tareas", icon: ClipboardList },
      { href: "/academic", label: "Progreso", icon: BarChart3 },
      { href: "/calendar", label: "Calendario", icon: Calendar },
      { href: "/payments", label: "Pagos", icon: Wallet },
      { href: "/documents", label: "Documentos", icon: FileSignature },
      { href: "/announcements", label: "Anuncios", icon: Bell },
    ];

    if (isAdmin) {
      return [
        ...baseItems,
        { href: "/chatbot", label: "Asistente IA", icon: Bot },
        { href: "/attendance", label: "Asistencia", icon: Users },
        { href: "/polls", label: "Encuestas", icon: Vote },
        { href: "/invitations", label: "Invitaciones", icon: UserPlus },
      ];
    }

    if (isTeacher) {
      return [
        ...baseItems,
        { href: "/attendance", label: "Asistencia", icon: Users },
        { href: "/tasks/new", label: "Nueva Tarea", icon: Plus },
      ];
    }

    if (isVocal) {
      return [
        ...baseItems,
        { href: "/chatbot", label: "Asistente IA", icon: Bot },
        { href: "/attendance", label: "Asistencia", icon: Users },
        { href: "/polls", label: "Encuestas", icon: Vote },
      ];
    }

    // Padres
    return [
      ...baseItems,
      { href: "/chatbot", label: "Asistente IA", icon: Bot },
      { href: "/attendance", label: "Asistencia", icon: Users },
      { href: "/polls", label: "Encuestas", icon: Vote },
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-28 py-[6px]">
          {/* Logo and School Name */}
          <Link href="/dashboard" className="flex items-center group h-full">
            <div className="relative w-[100px] h-full transition-transform group-hover:scale-105">
              <Image
                src="/iaschool-logo.png"
                alt="IA School Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems?.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-[#1B4079] hover:bg-[#1B4079]/5 transition-all"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* Alerts Counter */}
            <AlertsCounter />
            
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1B4079] flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name ?? "Usuario"}</p>
                <p className="text-xs text-[#4D7C8A]">
                  {getRoleName()}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Salir</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems?.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#1B4079]/5 transition-all"
                >
                  <item.icon className="w-5 h-5 text-[#1B4079]" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Cerrar sesión</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
