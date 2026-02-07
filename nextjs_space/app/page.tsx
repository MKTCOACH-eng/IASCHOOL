"use client";
// Landing page - IA School v3.0 - REBUILD 1707300000
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Globe, 
  Play,
  CheckCircle2,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Building2,
  BarChart3,
  MessageSquare,
  GraduationCap,
  Heart,
  ArrowRight,
  Star,
  Clock,
  Smartphone,
  Gift,
  Share2,
  CreditCard
} from "lucide-react";
import LandingChatbot from "@/components/landing-chatbot";
import { useLanguage } from "@/contexts/language-context";
import { Language } from "@/lib/i18n/translations";
import { AnimatePresence, motion } from "framer-motion";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'colegios' | 'afiliados'>('colegios');
  const { language, setLanguage, languageNames, languageFlags, t } = useLanguage();
  const availableLanguages: Language[] = ['es', 'en', 'pt', 'de', 'fr', 'ja'];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Module icons mapping
  const moduleIcons = [
    { icon: MessageSquare, key: 'moduleMessaging' },
    { icon: GraduationCap, key: 'moduleAcademic' },
    { icon: CreditCard, key: 'modulePayments' },
    { icon: Clock, key: 'moduleAttendance' },
    { icon: Users, key: 'moduleDirectory' },
    { icon: Heart, key: 'moduleNursery' },
    { icon: Star, key: 'moduleGamification' },
    { icon: BarChart3, key: 'moduleReports' },
    { icon: Shield, key: 'moduleDiscipline' },
    { icon: Smartphone, key: 'moduleApp' },
    { icon: Zap, key: 'moduleAI' },
    { icon: TrendingUp, key: 'moduleCRM' },
  ];

  const benefits = [
    t.home.affiliates.benefit1,
    t.home.affiliates.benefit2,
    t.home.affiliates.benefit3,
    t.home.affiliates.benefit4,
    t.home.affiliates.benefit5,
    t.home.affiliates.benefit6,
    t.home.affiliates.benefit7,
    t.home.affiliates.benefit8,
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center">
              <div className="relative h-14 w-14">
                <Image
                  src="/iaschool-logo-new.png"
                  alt="IA School"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className={`ml-3 text-xl font-bold transition-colors duration-300 ${
                isScrolled ? 'text-[#1B4079]' : 'text-white'
              }`}>
                IA School
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isScrolled 
                      ? 'text-gray-600 hover:bg-gray-100' 
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-lg">{languageFlags[language]}</span>
                </button>
                
                <AnimatePresence>
                  {showLanguageMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
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
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/login"
                className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                  isScrolled
                    ? 'bg-[#1B4079] text-white hover:bg-[#15325f]'
                    : 'bg-white text-[#1B4079] hover:bg-gray-100'
                }`}
              >
                {t.home.nav.login}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Con Video de Fondo */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Video de fondo */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster="https://cdn.abacus.ai/images/0a1556f4-8831-404e-ae29-cb9ebcbe0e4f.png"
          >
            <source src="https://cdn.abacus.ai/videos/87ac6081-4945-48d6-b1d7-89fe77b0d7ad.mp4" type="video/mp4" />
          </video>
          {/* Overlay oscuro para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B4079]/95 via-[#1B4079]/85 to-[#1B4079]/70" />
        </div>

        {/* Patrón decorativo */}
        <div className="absolute inset-0 overflow-hidden z-[1]">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Contenido */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8 border border-white/20">
                  <Zap className="w-4 h-4" />
                  {t.home.hero.badge}
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  {t.home.hero.title1}
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                    {t.home.hero.title2}
                  </span>
                </h1>
                
                <p className="text-xl text-white/90 mb-10 leading-relaxed max-w-xl">
                  {t.home.hero.subtitle}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <a
                    href="#para-colegios"
                    onClick={() => setActiveTab('colegios')}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1B4079] font-bold rounded-full hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    <Building2 className="w-5 h-5" />
                    {t.home.hero.ctaSchool}
                  </a>
                  <a
                    href="#para-afiliados"
                    onClick={() => setActiveTab('afiliados')}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/20 transition-all border border-white/30"
                  >
                    <Gift className="w-5 h-5" />
                    {t.home.hero.ctaAffiliate}
                  </a>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center gap-8 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>{t.home.hero.trustFast}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span>{t.home.hero.trustSecure}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Visual - Imagen + Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20">
                {/* Imagen principal */}
                <div className="relative aspect-video">
                  <Image
                    src="https://cdn.abacus.ai/images/427c1b82-c580-47fc-80bd-4a39097e6365.png"
                    alt="IA School Dashboard"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B4079]/80 to-transparent" />
                </div>

                {/* Stats grid overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-white">85%</div>
                      <div className="text-white/70 text-xs">{t.home.hero.statsAdmin}</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-white">24/7</div>
                      <div className="text-white/70 text-xs">{t.home.hero.statsAvailable}</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-white">6</div>
                      <div className="text-white/70 text-xs">{t.home.hero.statsLanguages}</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-white">+20</div>
                      <div className="text-white/70 text-xs">{t.home.hero.statsModules}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                {t.home.hero.badgeNew}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Tabs: Colegios vs Afiliados */}
      <section className="py-8 bg-gray-50 sticky top-20 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="inline-flex bg-white rounded-full p-1.5 shadow-lg border border-gray-200">
              <button
                onClick={() => setActiveTab('colegios')}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
                  activeTab === 'colegios'
                    ? 'bg-[#1B4079] text-white shadow-md'
                    : 'text-gray-600 hover:text-[#1B4079]'
                }`}
              >
                <Building2 className="w-5 h-5" />
                {t.home.tabs.schools}
              </button>
              <button
                onClick={() => setActiveTab('afiliados')}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
                  activeTab === 'afiliados'
                    ? 'bg-[#1B4079] text-white shadow-md'
                    : 'text-gray-600 hover:text-[#1B4079]'
                }`}
              >
                <Gift className="w-5 h-5" />
                {t.home.tabs.affiliates}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN PARA COLEGIOS */}
      <section id="para-colegios" className={`py-20 bg-white ${activeTab !== 'colegios' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4079]/10 rounded-full text-[#1B4079] text-sm font-medium mb-4">
              <Building2 className="w-4 h-4" />
              {t.home.schools.badge}
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white bg-[#1B4079] inline-block px-6 py-3 rounded-2xl mb-4">
              {t.home.schools.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6">
              {t.home.schools.subtitle}
            </p>
          </div>

          {/* Visual para colegios - Profesores */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Imagen de profesora */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="relative aspect-video">
                  <Image
                    src="https://cdn.abacus.ai/images/e2c188e2-232c-4886-b89f-6271ed54d66d.png"
                    alt="Profesora usando IA School"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              {/* Contenido */}
              <div className="lg:pl-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">{t.home.schools.videoTitle}</h3>
                <p className="text-gray-600 text-lg mb-6">{t.home.schools.videoSubtitle}</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Control total de asistencia, calificaciones y comunicación en un solo lugar</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Pizarra digital integrada con registro académico automatizado</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Reportes inteligentes generados por IA para cada estudiante</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Visual para familias */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Contenido */}
              <div className="lg:pr-8 order-2 lg:order-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Para las Familias</h3>
                <p className="text-gray-600 text-lg mb-6">Los padres siempre conectados con la educación de sus hijos</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Notificaciones en tiempo real de tareas, calificaciones y avisos</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Chat directo con profesores y administración escolar</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Pagos de colegiaturas y control de gastos desde la app</p>
                  </div>
                </div>
              </div>
              {/* Imagen de familia */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl order-1 lg:order-2">
                <div className="relative aspect-video">
                  <Image
                    src="https://cdn.abacus.ai/images/7d6234c5-6667-407b-b59d-fe8fe2bad088.png"
                    alt="Familia usando IA School App"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Beneficios para colegios */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#1B4079] flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white bg-[#1B4079] inline-block px-4 py-2 rounded-lg mb-3">{t.home.schools.benefit1Title}</h3>
              <p className="text-gray-600 mb-4">
                {t.home.schools.benefit1Desc}
              </p>
              <div className="text-[#1B4079] font-semibold text-sm">{t.home.schools.benefit1Cta}</div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#1B4079] flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white bg-[#1B4079] inline-block px-4 py-2 rounded-lg mb-3">{t.home.schools.benefit2Title}</h3>
              <p className="text-gray-600 mb-4">
                {t.home.schools.benefit2Desc}
              </p>
              <div className="text-[#1B4079] font-semibold text-sm">{t.home.schools.benefit2Cta}</div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#1B4079] flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white bg-[#1B4079] inline-block px-4 py-2 rounded-lg mb-3">{t.home.schools.benefit3Title}</h3>
              <p className="text-gray-600 mb-4">
                {t.home.schools.benefit3Desc}
              </p>
              <div className="text-[#1B4079] font-semibold text-sm">{t.home.schools.benefit3Cta}</div>
            </div>
          </div>

          {/* Módulos incluidos */}
          <div className="bg-[#1B4079] rounded-3xl p-10 text-white">
            <h3 className="text-2xl font-bold mb-8 text-center text-white">{t.home.schools.modulesTitle}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {moduleIcons.map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-2">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-white/80">{t.home.schools[item.key as keyof typeof t.home.schools]}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECCIÓN PARA AFILIADOS */}
      <section id="para-afiliados" className={`py-20 bg-white ${activeTab !== 'afiliados' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4079]/10 rounded-full text-[#1B4079] text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              {t.home.affiliates.badge}
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white bg-[#1B4079] inline-block px-6 py-3 rounded-2xl mb-4">
              {t.home.affiliates.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6">
              {t.home.affiliates.subtitle}
            </p>
          </div>

          {/* Visual para afiliados */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Imagen de afiliados */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="relative aspect-video">
                  <Image
                    src="https://cdn.abacus.ai/images/b84e6d63-c939-4b0d-be3e-885cbb67fd90.png"
                    alt="Programa de Afiliados IA School"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              {/* Contenido */}
              <div className="lg:pl-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">{t.home.affiliates.videoTitle}</h3>
                <p className="text-gray-600 text-lg mb-6">{t.home.affiliates.videoSubtitle}</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Gift className="w-6 h-6 text-[#1B4079] flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><strong>10% de comisión</strong> sobre la cuota de setup del colegio referido</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-6 h-6 text-[#1B4079] flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><strong>1 año gratis</strong> si eres padre del colegio que refieres</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-6 h-6 text-[#1B4079] flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Sin límite de referidos - <strong>ganancias ilimitadas</strong></p>
                  </div>
                </div>
                <Link
                  href="/affiliate/register"
                  className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-[#1B4079] text-white font-bold rounded-full hover:bg-[#15325f] transition-all shadow-lg hover:shadow-xl"
                >
                  <Gift className="w-5 h-5" />
                  Únete al Programa
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ¿Qué es el programa de afiliados? */}
          <div className="bg-gradient-to-r from-[#1B4079] to-[#0f2847] rounded-3xl p-10 text-white mb-16">
            <h3 className="text-2xl font-bold mb-6 text-center text-white">{t.home.affiliates.howTitle}</h3>
            <p className="text-white/90 text-center max-w-4xl mx-auto text-lg leading-relaxed mb-8">
              {t.home.affiliates.howDesc}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-2xl p-6 text-center">
                <Share2 className="w-10 h-10 mx-auto mb-3 text-cyan-300" />
                <h4 className="font-bold text-white mb-2">{t.home.affiliates.step1Title}</h4>
                <p className="text-white/70 text-sm">{t.home.affiliates.step1Desc}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 text-center">
                <Building2 className="w-10 h-10 mx-auto mb-3 text-cyan-300" />
                <h4 className="font-bold text-white mb-2">{t.home.affiliates.step2Title}</h4>
                <p className="text-white/70 text-sm">{t.home.affiliates.step2Desc}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 text-center">
                <Gift className="w-10 h-10 mx-auto mb-3 text-cyan-300" />
                <h4 className="font-bold text-white mb-2">{t.home.affiliates.step3Title}</h4>
                <p className="text-white/70 text-sm">{t.home.affiliates.step3Desc}</p>
              </div>
            </div>
          </div>

          {/* Proceso paso a paso */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center mb-12 text-white bg-[#1B4079] inline-block px-6 py-3 rounded-2xl mx-auto w-fit">{t.home.affiliates.processTitle}</h3>
            <div className="flex justify-center">
              <div className="grid md:grid-cols-4 gap-8 max-w-5xl">
                {[
                  { step: '1', title: t.home.affiliates.process1Title, desc: t.home.affiliates.process1Desc, icon: Building2 },
                  { step: '2', title: t.home.affiliates.process2Title, desc: t.home.affiliates.process2Desc, icon: Share2 },
                  { step: '3', title: t.home.affiliates.process3Title, desc: t.home.affiliates.process3Desc, icon: CheckCircle2 },
                  { step: '4', title: t.home.affiliates.process4Title, desc: t.home.affiliates.process4Desc, icon: Star },
                ].map((item, i) => (
                  <div key={i} className="relative text-center">
                    <div className="bg-[#1B4079] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto shadow-lg">
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div className="bg-[#1B4079] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold absolute -top-2 -right-2 border-4 border-white">
                      {item.step}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                    {i < 3 && (
                      <ArrowRight className="hidden md:block absolute top-8 -right-6 w-6 h-6 text-[#1B4079]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Beneficios para afiliados */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white bg-[#1B4079] inline-block px-4 py-2 rounded-lg mb-6">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t.home.affiliates.whoTitle}
                </span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 py-4 border-b border-gray-200">
                  <div className="w-12 h-12 rounded-xl bg-[#1B4079]/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-[#1B4079]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{t.home.affiliates.who1Title}</h4>
                    <p className="text-gray-600 text-sm">{t.home.affiliates.who1Desc}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-4 border-b border-gray-200">
                  <div className="w-12 h-12 rounded-xl bg-[#1B4079]/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-[#1B4079]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{t.home.affiliates.who2Title}</h4>
                    <p className="text-gray-600 text-sm">{t.home.affiliates.who2Desc}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1B4079]/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[#1B4079]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{t.home.affiliates.who3Title}</h4>
                    <p className="text-gray-600 text-sm">{t.home.affiliates.who3Desc}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1B4079] to-[#0f2847] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                <Star className="w-6 h-6" />
                {t.home.affiliates.benefitsTitle}
              </h3>
              <ul className="space-y-4">
                {benefits.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-white/60 text-xs mt-6">
                {t.home.affiliates.benefitNote}
              </p>
            </div>
          </div>

          {/* CTA Afiliados */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-cyan-500 to-[#1B4079] rounded-3xl p-10">
              <h3 className="text-3xl font-bold text-white mb-4">{t.home.affiliates.ctaTitle}</h3>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                {t.home.affiliates.ctaDesc}
              </p>
              <Link
                href="/affiliate/register"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-[#1B4079] font-bold rounded-full hover:bg-gray-100 transition-all shadow-xl text-lg"
              >
                {t.home.affiliates.ctaButton}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-white/60 text-sm mt-4">
                {t.home.affiliates.ctaLogin} <Link href="/affiliate/login" className="text-white underline hover:no-underline">{t.home.affiliates.ctaLoginLink}</Link>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-[#1B4079]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t.home.finalCta.title}
          </h2>
          <p className="text-xl text-white/80 mb-10">
            {t.home.finalCta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-[#1B4079] font-bold rounded-full hover:bg-gray-100 transition-all shadow-xl"
            >
              {t.home.finalCta.button}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image src="/iaschool-logo-new.png" alt="IA School" fill className="object-contain" />
              </div>
              <span className="text-white font-bold">IA School</span>
            </div>
            <p className="text-gray-400 text-sm text-center">
              {t.home.footer.copyright}
            </p>
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <Link href="#" className="hover:text-white transition-colors">{t.home.footer.support}</Link>
              <Link href="#" className="hover:text-white transition-colors">{t.home.footer.contact}</Link>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Chatbot flotante */}
      <LandingChatbot />
    </main>
  );
}
