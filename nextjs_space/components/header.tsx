"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Bell, Home, Plus, Menu, X, UserPlus, MessageSquare, ClipboardList, Calendar, CalendarCheck, Wallet, BarChart3, Users, Vote, FileSignature, Bot, Building2, Settings, Activity, BookOpen, Mail, Globe, ShoppingBag, Image as ImageIcon, Clock, UsersRound, PiggyBank, ClipboardCheck, LayoutDashboard, FileQuestion, FileText, TrendingUp, AlertTriangle, Heart, Upload, Video, Store, FileBarChart, Headphones, Star, Gift } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertsCounter } from "@/components/academic-alerts";
import { useLanguage } from "@/contexts/language-context";
import { Language } from "@/lib/i18n/translations";

interface HeaderProps {
  user?: {
    name?: string;
    role?: string;
    schoolName?: string;
  };
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const { language, setLanguage, languageNames, languageFlags, t } = useLanguage();
  
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isAdmin = user?.role === "ADMIN";
  const isTeacher = user?.role === "PROFESOR";
  const isStudent = user?.role === "ALUMNO";
  const isVocal = user?.role === "VOCAL";
  
  const availableLanguages: Language[] = ['es', 'en', 'pt', 'de', 'fr', 'ja'];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const getRoleName = () => {
    switch (user?.role) {
      case "SUPER_ADMIN": return t.roles.superAdmin;
      case "ADMIN": return t.roles.admin;
      case "PROFESOR": return t.roles.teacher;
      case "ALUMNO": return t.roles.student;
      case "VOCAL": return t.roles.vocal;
      default: return t.roles.parent;
    }
  };

  const getNavItems = () => {
    // Items para Super Admin (gestión global)
    if (isSuperAdmin) {
      return [
        { href: "/super-admin", label: t.nav.dashboard, icon: Home },
        { href: "/super-admin/schools", label: t.superAdmin.schools, icon: Building2 },
        { href: "/super-admin/config", label: t.common.settings, icon: Settings },
        { href: "/super-admin/audit", label: t.superAdmin.auditLog, icon: Activity },
      ];
    }

    // Items para alumnos (vista simplificada)
    if (isStudent) {
      return [
        { href: "/dashboard", label: t.nav.home, icon: Home },
        { href: "/tasks", label: t.nav.tasks, icon: ClipboardList },
        { href: "/schedules", label: t.nav.schedules || "Horarios", icon: Clock },
        { href: "/calendar", label: t.nav.calendar, icon: Calendar },
        { href: "/messages", label: t.nav.messages, icon: MessageSquare },
        { href: "/messages/teams", label: t.nav.teams || "Equipos", icon: UsersRound },
        { href: "/attendance", label: t.nav.attendance, icon: Users },
        { href: "/documents", label: t.nav.documents, icon: FileSignature },
        { href: "/announcements", label: t.nav.announcements, icon: Bell },
      ];
    }

    const baseItems = [
      { href: "/dashboard", label: t.nav.home, icon: Home },
      { href: "/messages", label: t.nav.messages, icon: MessageSquare },
      { href: "/tasks", label: t.nav.tasks, icon: ClipboardList },
      { href: "/schedules", label: t.nav.schedules || "Horarios", icon: Clock },
      { href: "/academic", label: t.nav.academic, icon: BarChart3 },
      { href: "/calendar", label: t.nav.calendar, icon: Calendar },
      { href: "/payments", label: t.nav.payments, icon: Wallet },
      { href: "/documents", label: t.nav.documents, icon: FileSignature },
      { href: "/announcements", label: t.nav.announcements, icon: Bell },
    ];

    if (isAdmin) {
      return [
        ...baseItems,
        { href: "/chatbot", label: t.nav.chatbot, icon: Bot },
        { href: "/attendance", label: t.nav.attendance, icon: Users },
        { href: "/directory", label: t.nav.directory, icon: BookOpen },
        { href: "/store", label: t.nav.store, icon: ShoppingBag },
        { href: "/gallery", label: t.nav.gallery, icon: ImageIcon },
        { href: "/crm", label: t.nav.crm, icon: Mail },
        { href: "/surveys", label: "Encuestas", icon: ClipboardCheck },
        { href: "/enrollments", label: "Inscripciones", icon: UserPlus },
        { href: "/permits", label: "Permisos", icon: FileQuestion },
        { href: "/dashboard/executive", label: "Dashboard Ejecutivo", icon: LayoutDashboard },
        { href: "/academic/report-cards", label: "Boletas", icon: FileText },
        { href: "/academic/progress", label: "Progreso", icon: TrendingUp },
        { href: "/discipline", label: "Disciplina", icon: AlertTriangle },
        { href: "/nurse", label: "Enfermería", icon: Heart },
        { href: "/appointments", label: "Citas", icon: Video },
        { href: "/import", label: "Importar", icon: Upload },
        { href: "/polls", label: t.nav.polls, icon: Vote },
        { href: "/invitations", label: t.nav.invitations, icon: UserPlus },
        { href: "/admin/referrals", label: "Programa Referidos", icon: Gift },
        { href: "/admin/performance", label: "Rendimiento", icon: Star },
        { href: "/admin/reports", label: "Reportes", icon: FileBarChart },
        { href: "/admin/vendors", label: "Proveedores", icon: Store },
        { href: "/support", label: "Soporte", icon: Headphones },
      ];
    }

    if (isTeacher) {
      return [
        ...baseItems,
        { href: "/appointments", label: t.nav.appointments, icon: CalendarCheck },
        { href: "/attendance", label: t.nav.attendance, icon: Users },
        { href: "/gallery", label: t.nav.gallery, icon: ImageIcon },
        { href: "/academic/report-cards", label: "Boletas", icon: FileText },
        { href: "/academic/progress", label: "Progreso", icon: TrendingUp },
        { href: "/discipline", label: "Disciplina", icon: AlertTriangle },
        { href: "/nurse", label: "Enfermería", icon: Heart },
        { href: "/tasks/new", label: t.tasks.newTask, icon: Plus },
        { href: "/teacher/performance", label: "Mi Rendimiento", icon: Star },
      ];
    }

    if (isVocal) {
      return [
        ...baseItems,
        { href: "/vocal", label: "Panel Vocal", icon: PiggyBank },
        { href: "/vocal/funds", label: "Colectas", icon: Wallet },
        { href: "/vocal/announcements", label: "Avisos Grupo", icon: Bell },
        { href: "/chatbot", label: t.nav.chatbot, icon: Bot },
        { href: "/attendance", label: t.nav.attendance, icon: Users },
        { href: "/store", label: t.nav.store, icon: ShoppingBag },
        { href: "/gallery", label: t.nav.gallery, icon: ImageIcon },
        { href: "/polls", label: t.nav.polls, icon: Vote },
      ];
    }

    // Padres
    return [
      ...baseItems,
      { href: "/vocal", label: "Grupo", icon: PiggyBank },
      { href: "/referrals", label: "Recomienda", icon: Gift },
      { href: "/appointments", label: t.nav.appointments, icon: CalendarCheck },
      { href: "/academic/progress", label: "Progreso", icon: TrendingUp },
      { href: "/academic/report-cards", label: "Boletas", icon: FileText },
      { href: "/permits", label: "Permisos", icon: FileQuestion },
      { href: "/surveys", label: "Encuestas", icon: ClipboardCheck },
      { href: "/chatbot", label: t.nav.chatbot, icon: Bot },
      { href: "/attendance", label: t.nav.attendance, icon: Users },
      { href: "/store", label: t.nav.store, icon: ShoppingBag },
      { href: "/gallery", label: t.nav.gallery, icon: ImageIcon },
      { href: "/polls", label: t.nav.polls, icon: Vote },
      { href: "/support", label: "Soporte", icon: Headphones },
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 py-2">
          {/* Logo and School Name */}
          <Link href="/dashboard" className="flex items-center group flex-shrink-0">
            <div className="relative w-[140px] h-16 transition-transform group-hover:scale-105">
              <Image
                src="/iaschool-logo.png"
                alt="IA School Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation - Scrollable */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center mx-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1">
              {navItems?.slice(0, 8).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 hover:text-[#1B4079] hover:bg-[#1B4079]/5 transition-all whitespace-nowrap"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-base font-medium">{item.label}</span>
                </Link>
              ))}
              {navItems && navItems.length > 8 && (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 hover:text-[#1B4079] hover:bg-[#1B4079]/5 transition-all">
                    <Menu className="w-5 h-5" />
                    <span className="text-base font-medium">Más</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all max-h-[70vh] overflow-y-auto">
                    {navItems.slice(8).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#1B4079]/5 hover:text-[#1B4079] transition-all"
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-base font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all"
                title="Cambiar idioma"
              >
                <Globe className="w-5 h-5" />
                <span className="text-base hidden sm:inline">{languageFlags[language]}</span>
              </button>
              
              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                  >
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          language === lang ? 'bg-[#1B4079]/5 text-[#1B4079]' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-xl">{languageFlags[lang]}</span>
                        <span className="text-base font-medium">{languageNames[lang]}</span>
                        {language === lang && (
                          <span className="ml-auto text-[#1B4079]">✓</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Alerts Counter */}
            <AlertsCounter />
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1B4079] flex items-center justify-center shadow-md">
                <span className="text-white text-base font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold text-gray-900">{user?.name ?? "Usuario"}</p>
                <p className="text-sm text-[#4D7C8A]">
                  {getRoleName()}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-base font-medium">{t.nav.logout}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            className="lg:hidden border-t border-gray-100 bg-white max-h-[80vh] overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems?.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-700 hover:bg-[#1B4079]/5 transition-all active:scale-[0.98]"
                >
                  <item.icon className="w-6 h-6 text-[#1B4079]" />
                  <span className="text-base font-medium">{item.label}</span>
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-3 mt-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-6 h-6" />
                  <span className="text-base font-medium">{t.nav.logout}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
