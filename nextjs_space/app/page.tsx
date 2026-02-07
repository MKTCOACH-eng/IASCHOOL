"use client";

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
  UserCheck,
  DollarSign,
  BarChart3,
  MessageSquare,
  GraduationCap,
  Heart,
  ArrowRight,
  Star,
  Clock,
  Smartphone
} from "lucide-react";
import LandingChatbot from "@/components/landing-chatbot";
import { useLanguage } from "@/contexts/language-context";
import { Language } from "@/lib/i18n/translations";
import { AnimatePresence, motion } from "framer-motion";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'colegios' | 'vocales'>('colegios');
  const { language, setLanguage, t, languageNames, languageFlags } = useLanguage();
  const availableLanguages: Language[] = ['es', 'en', 'pt', 'de', 'fr', 'ja'];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Monocromático Azul */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#1B4079] via-[#1B4079] to-[#0f2847]">
        {/* Patrón decorativo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/5 to-transparent rounded-full" />
          
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
                  Plataforma Educativa con IA
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Moderniza tu colegio.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                    Multiplica tus ingresos.
                  </span>
                </h1>
                
                <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-xl">
                  La plataforma integral que transforma la gestión escolar. 
                  Colegios ganan <strong className="text-white">50% de cada suscripción</strong>. 
                  Vocales generan ingresos por referidos.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <a
                    href="#para-colegios"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1B4079] font-bold rounded-full hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    <Building2 className="w-5 h-5" />
                    Soy Colegio
                  </a>
                  <a
                    href="#para-vocales"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/20 transition-all border border-white/30"
                  >
                    <UserCheck className="w-5 h-5" />
                    Soy Vocal / Afiliado
                  </a>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center gap-8 text-white/60 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>Sin costo de implementación</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span>Datos 100% seguros</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Visual - Logo grande + Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                {/* Logo central */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-48 h-48">
                    <Image
                      src="/iaschool-logo-new.png"
                      alt="IA School"
                      fill
                      className="object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">50%</div>
                    <div className="text-white/60 text-sm">Comisión para colegios</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">85%</div>
                    <div className="text-white/60 text-sm">Menos carga administrativa</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">24/7</div>
                    <div className="text-white/60 text-sm">Disponibilidad total</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">6</div>
                    <div className="text-white/60 text-sm">Idiomas disponibles</div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                ¡Nuevo!
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Tabs: Colegios vs Vocales */}
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
                Para Colegios
              </button>
              <button
                onClick={() => setActiveTab('vocales')}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
                  activeTab === 'vocales'
                    ? 'bg-[#1B4079] text-white shadow-md'
                    : 'text-gray-600 hover:text-[#1B4079]'
                }`}
              >
                <Users className="w-5 h-5" />
                Para Vocales
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
              Solución para Instituciones Educativas
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Tu colegio, <span className="text-[#1B4079]">potenciado con IA</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Digitaliza la comunicación, automatiza procesos y genera un nuevo flujo de ingresos. 
              Todo desde una sola plataforma.
            </p>
          </div>

          {/* Video explicativo para colegios */}
          <div className="mb-20">
            <div className="relative bg-gradient-to-br from-[#1B4079] to-[#0f2847] rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-video relative">
                {/* Video placeholder con info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 hover:bg-white/30 transition-all cursor-pointer group">
                    <Play className="w-10 h-10 text-white ml-1 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">¿Qué es IA School?</h3>
                  <p className="text-white/70 text-center max-w-md">Descubre cómo nuestra plataforma puede transformar la gestión de tu institución educativa</p>
                </div>
                
                {/* Overlay con logo */}
                <div className="absolute bottom-6 right-6">
                  <div className="relative w-16 h-16 opacity-50">
                    <Image src="/iaschool-logo-new.png" alt="IA School" fill className="object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Beneficios para colegios */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#1B4079]/10 flex items-center justify-center mb-6">
                <DollarSign className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Genera Ingresos</h3>
              <p className="text-gray-600 mb-4">
                Recibe el <strong>50% de cada suscripción</strong> de tus familias. 
                Un colegio de 500 alumnos puede generar más de $500,000 MXN anuales.
              </p>
              <div className="text-[#1B4079] font-semibold text-sm">Sin inversión inicial →</div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#1B4079]/10 flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Control Total</h3>
              <p className="text-gray-600 mb-4">
                Dashboard administrativo con métricas en tiempo real. Cobranza, asistencia, 
                comunicación y reportes en un solo lugar.
              </p>
              <div className="text-[#1B4079] font-semibold text-sm">85% menos papeleo →</div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#1B4079]/10 flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comunicación Efectiva</h3>
              <p className="text-gray-600 mb-4">
                Mensajes, anuncios, calendario y notificaciones push. 
                Los padres siempre informados, el colegio siempre conectado.
              </p>
              <div className="text-[#1B4079] font-semibold text-sm">3x más engagement →</div>
            </div>
          </div>

          {/* Módulos incluidos */}
          <div className="bg-[#1B4079] rounded-3xl p-10 text-white">
            <h3 className="text-2xl font-bold mb-8 text-center">Módulos Incluidos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { icon: MessageSquare, label: 'Mensajería' },
                { icon: GraduationCap, label: 'Académico' },
                { icon: DollarSign, label: 'Pagos' },
                { icon: Clock, label: 'Asistencia' },
                { icon: Users, label: 'Directorio' },
                { icon: Heart, label: 'Enfermería' },
                { icon: Star, label: 'Gamificación' },
                { icon: BarChart3, label: 'Reportes' },
                { icon: Shield, label: 'Disciplina' },
                { icon: Smartphone, label: 'App PWA' },
                { icon: Zap, label: 'IA Assistant' },
                { icon: TrendingUp, label: 'CRM' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-2">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-white/80">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECCIÓN PARA VOCALES */}
      <section id="para-vocales" className={`py-20 bg-white ${activeTab !== 'vocales' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4079]/10 rounded-full text-[#1B4079] text-sm font-medium mb-4">
              <UserCheck className="w-4 h-4" />
              Programa de Vocales y Afiliados
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Gana dinero <span className="text-[#1B4079]">ayudando a tu comunidad</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conviértete en Vocal de Grupo o Afiliado. Recomienda IA School a familias 
              y gana comisiones por cada estudiante que se registre.
            </p>
          </div>

          {/* Video explicativo para vocales */}
          <div className="mb-20">
            <div className="relative bg-gradient-to-br from-[#1B4079] to-[#0f2847] rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-video relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 hover:bg-white/30 transition-all cursor-pointer group">
                    <Play className="w-10 h-10 text-white ml-1 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">¿Cómo ser Vocal?</h3>
                  <p className="text-white/70 text-center max-w-md">Conoce el proceso paso a paso para convertirte en Vocal y comenzar a generar ingresos</p>
                </div>
                
                <div className="absolute bottom-6 right-6">
                  <div className="relative w-16 h-16 opacity-50">
                    <Image src="/iaschool-logo-new.png" alt="IA School" fill className="object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proceso paso a paso */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center mb-12">Proceso en 4 pasos simples</h3>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Regístrate', desc: 'Crea tu cuenta como Vocal o Afiliado en la plataforma' },
                { step: '2', title: 'Obtén tu código', desc: 'Recibe tu código único de referido para compartir' },
                { step: '3', title: 'Comparte', desc: 'Invita a familias del colegio a usar IA School' },
                { step: '4', title: 'Gana', desc: 'Recibe comisiones por cada familia que se suscriba' },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="bg-[#1B4079] text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-600">{item.desc}</p>
                  {i < 3 && (
                    <ArrowRight className="hidden md:block absolute top-6 -right-4 w-8 h-8 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Beneficios para vocales */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-[#1B4079]" />
                Ganancias potenciales
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Por cada estudiante referido</span>
                  <span className="font-bold text-[#1B4079]">$50 MXN/mes</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">10 estudiantes referidos</span>
                  <span className="font-bold text-[#1B4079]">$500 MXN/mes</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">50 estudiantes referidos</span>
                  <span className="font-bold text-[#1B4079]">$2,500 MXN/mes</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">*Los montos son ilustrativos y pueden variar según el plan seleccionado</p>
            </div>

            <div className="bg-gradient-to-br from-[#1B4079] to-[#0f2847] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Star className="w-6 h-6" />
                Beneficios exclusivos
              </h3>
              <ul className="space-y-4">
                {[
                  'Panel de control para seguimiento de referidos',
                  'Materiales promocionales listos para usar',
                  'Soporte prioritario del equipo IA School',
                  'Bonos especiales por metas alcanzadas',
                  'Herramientas de gestión de grupo',
                  'Capacitación y webinars exclusivos'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Precios transparentes</h2>
            <p className="text-xl text-gray-600">Planes flexibles que se adaptan a cualquier institución</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan Básico */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Básico</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-[#1B4079]">$149</span>
                <span className="text-gray-500">MXN/alumno/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Comunicación', 'Tareas y calificaciones', 'Calendario', 'Asistencia', 'Pagos básicos'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full py-3 text-center bg-gray-100 text-[#1B4079] font-semibold rounded-xl hover:bg-gray-200 transition-all">
                Comenzar
              </Link>
            </div>

            {/* Plan Estándar */}
            <div className="bg-[#1B4079] rounded-2xl p-8 shadow-xl relative transform md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-[#1B4079] text-sm font-bold rounded-full shadow">
                Más Popular
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Estándar</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$199</span>
                <span className="text-white/70">MXN/alumno/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Todo lo del Básico', 'Enfermería digital', 'Tienda escolar', 'Programa de referidos', 'Asistente IA', 'Reportes avanzados'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full py-3 text-center bg-white text-[#1B4079] font-bold rounded-xl hover:bg-gray-100 transition-all">
                Elegir Estándar
              </Link>
            </div>

            {/* Plan Premium */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-[#1B4079]">$299</span>
                <span className="text-gray-500">MXN/alumno/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Todo lo del Estándar', 'Gamificación completa', 'Tips IA personalizados', 'Multi-vendor', 'CRM avanzado', 'Soporte 24/7'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full py-3 text-center bg-gray-100 text-[#1B4079] font-semibold rounded-xl hover:bg-gray-200 transition-all">
                Elegir Premium
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-8">
            <strong>Tu colegio recibe el 50%</strong> de cada suscripción. Pago anual: 2 meses gratis.
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-[#1B4079]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            ¿Listo para transformar tu colegio?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Únete a las instituciones que ya están modernizando su gestión educativa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-[#1B4079] font-bold rounded-full hover:bg-gray-100 transition-all shadow-xl"
            >
              Comenzar Ahora
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
              © 2026 IA School. Transformando la educación con tecnología.
            </p>
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <Link href="#" className="hover:text-white transition-colors">Soporte</Link>
              <Link href="#" className="hover:text-white transition-colors">Contacto</Link>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Chatbot flotante */}
      <LandingChatbot />
    </main>
  );
}
