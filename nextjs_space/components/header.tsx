"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Bell, Home, Plus, Menu, X, UserPlus, MessageSquare, ClipboardList, Calendar, CalendarCheck, Wallet, BarChart3, Users, Vote, FileSignature, Bot, Building2, Settings, Activity, BookOpen, Mail, Globe, ShoppingBag, Image as ImageIcon, Clock, UsersRound, PiggyBank, ClipboardCheck, LayoutDashboard, FileQuestion } from "lucide-react";
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
        { href: "/polls", label: t.nav.polls, icon: Vote },
        { href: "/invitations", label: t.nav.invitations, icon: UserPlus },
      ];
    }

    if (isTeacher) {
      return [
        ...baseItems,
        { href: "/appointments", label: t.nav.appointments, icon: CalendarCheck },
        { href: "/attendance", label: t.nav.attendance, icon: Users },
        { href: "/gallery", label: t.nav.gallery, icon: ImageIcon },
        { href: "/tasks/new", label: t.tasks.newTask, icon: Plus },
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
      { href: "/appointments", label: t.nav.appointments, icon: CalendarCheck },
      { href: "/permits", label: "Permisos", icon: FileQuestion },
      { href: "/surveys", label: "Encuestas", icon: ClipboardCheck },
      { href: "/chatbot", label: t.nav.chatbot, icon: Bot },
      { href: "/attendance", label: t.nav.attendance, icon: Users },
      { href: "/store", label: t.nav.store, icon: ShoppingBag },
      { href: "/gallery", label: t.nav.gallery, icon: ImageIcon },
      { href: "/polls", label: t.nav.polls, icon: Vote },
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
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                title="Cambiar idioma"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">{languageFlags[language]}</span>
              </button>
              
              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                  >
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                          language === lang ? 'bg-[#1B4079]/5 text-[#1B4079]' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{languageFlags[lang]}</span>
                        <span className="text-sm font-medium">{languageNames[lang]}</span>
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
              <span className="text-sm">{t.nav.logout}</span>
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
                <span className="font-medium">{t.nav.logout}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
