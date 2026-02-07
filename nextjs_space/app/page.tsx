"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { MessageSquare, Shield, BookOpen, CreditCard, PlayCircle, FileText, Calendar, Brain, ChevronRight, Bell, Users, XCircle, CheckCircle, ArrowRight, Instagram, Facebook, Linkedin, Twitter, Globe, Star, Trophy, Heart, Store, Truck, BarChart3, Stethoscope, GraduationCap, Clock, Smartphone, Check } from "lucide-react";
import LandingChatbot from "@/components/landing-chatbot";
import { useLanguage } from "@/contexts/language-context";
import { Language } from "@/lib/i18n/translations";
import { AnimatePresence, motion } from "framer-motion";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
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
      {/* Navigation - Transparent on scroll */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-transparent shadow-none" 
          : "bg-white shadow-sm"
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[132px] py-[6px]">
          <Link href="/" className={`flex items-center h-full transition-opacity duration-300 ${isScrolled ? "opacity-0" : "opacity-100"}`}>
            <div className="relative h-[120px] w-[120px]">
              <Image
                src="/iaschool-logo.png"
                alt="IA School"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <div className={`flex items-center gap-3 transition-opacity duration-300 ${isScrolled ? "opacity-0" : "opacity-100"}`}>
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                title="Change language"
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
            <Link
              href="/login"
              className="px-6 py-3 text-base font-medium rounded-lg transition-all duration-300 bg-[#1B4079] text-white hover:bg-[#4D7C8A]"
            >
              {t.nav.login}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <div className="relative min-h-[95vh] flex items-center pt-[140px]">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="/students_hero.jpg"
          >
            <source src="https://videos.pexels.com/video-files/8196810/8196810-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B4079]/95 via-[#1B4079]/85 to-[#1B4079]/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 border border-white/20">
              <Brain className="w-4 h-4" />
              {t.landing.hero.badge}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t.landing.hero.title}{" "}
              <span className="text-[#CBDF90]">{t.landing.hero.titleHighlight}</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-10 leading-relaxed">
              {t.landing.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#CBDF90] text-[#1B4079] font-bold rounded-xl hover:bg-white transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                {t.landing.hero.cta}
                <ChevronRight className="w-5 h-5" />
              </Link>
              <a
                href="#funcionalidades"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/30"
              >
                {t.landing.hero.discover}
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-white/60 text-sm mb-4">{t.landing.trust.title}</p>
              <div className="flex items-center gap-6 text-white/80">
                <span className="text-sm font-medium">{t.landing.trust.schools}</span>
                <span className="text-white/30">|</span>
                <span className="text-sm font-medium">{t.landing.trust.families}</span>
                <span className="text-white/30">|</span>
                <span className="text-sm font-medium">{t.landing.trust.uptime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem/Solution Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t.landing.problem.title}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              {t.landing.problem.desc} <strong className="text-[#1B4079]">{t.landing.problem.solution}</strong>
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-[#1B4079] mb-2">{t.landing.problem.without}</h3>
              <p className="text-gray-500 text-sm">{t.landing.problem.withoutDesc}</p>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="w-10 h-10 text-[#1B4079]" />
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-[#1B4079] mb-2">{t.landing.problem.with}</h3>
              <p className="text-gray-600 text-sm">{t.landing.problem.withDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-[#1B4079] to-[#4D7C8A] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-white">85%</div>
              <div className="text-white/70 text-sm mt-2">{t.landing.stats.adminReduction}</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-[#CBDF90]">3x</div>
              <div className="text-white/70 text-sm mt-2">{t.landing.stats.communication}</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-white">100%</div>
              <div className="text-white/70 text-sm mt-2">{t.landing.stats.traceability}</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-[#CBDF90]">24/7</div>
              <div className="text-white/70 text-sm mt-2">{t.landing.stats.availability}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Para Padres Section */}
      <div id="funcionalidades" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/parents_hero.jpg"
                alt="Familia latina revisando información escolar en tablet"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#CBDF90] flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[#1B4079]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t.landing.forFamilies.newAnnouncement}</p>
                    <p className="text-sm font-medium text-gray-900">{t.landing.forFamilies.meetingFriday}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4079]/10 rounded-full text-[#1B4079] text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                {t.landing.forFamilies.badge}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t.landing.forFamilies.title}
              </h2>
              <p className="text-gray-600 mb-6">
                {t.landing.forFamilies.desc}
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8FAD88] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>{t.landing.forFamilies.feature1}</strong> — {t.landing.forFamilies.feature1Desc}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8FAD88] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>{t.landing.forFamilies.feature2}</strong> — {t.landing.forFamilies.feature2Desc}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8FAD88] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>{t.landing.forFamilies.feature3}</strong> — {t.landing.forFamilies.feature3Desc}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8FAD88] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>{t.landing.forFamilies.feature4}</strong> — {t.landing.forFamilies.feature4Desc}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Para Profesores Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4D7C8A]/10 rounded-full text-[#4D7C8A] text-sm font-medium mb-4">
                <BookOpen className="w-4 h-4" />
                {t.landing.forTeachers.badge}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t.landing.forTeachers.title}
              </h2>
              <p className="text-gray-600 mb-6">
                {t.landing.forTeachers.desc}
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4D7C8A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>{t.landing.forTeachers.feature1}</strong> — {t.landing.forTeachers.feature1Desc}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4D7C8A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>{t.landing.forTeachers.feature2}</strong> — {t.landing.forTeachers.feature2Desc}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4D7C8A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>{t.landing.forTeachers.feature3}</strong> — {t.landing.forTeachers.feature3Desc}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4D7C8A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>{t.landing.forTeachers.feature4}</strong> — {t.landing.forTeachers.feature4Desc}</span>
                </li>
              </ul>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl order-1 lg:order-2">
              <Image
                src="/teacher_hero.jpg"
                alt="Profesor latinoamericano usando tecnología educativa"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">28/30 {t.landing.forTeachers.tasksDelivered}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t.landing.features.title}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t.landing.features.subtitle}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                <MessageSquare className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">{t.landing.features.communication.title}</h3>
              <p className="text-gray-600">
                {t.landing.features.communication.desc}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                <BookOpen className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">{t.landing.features.academic.title}</h3>
              <p className="text-gray-600">
                {t.landing.features.academic.desc}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                <CreditCard className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">{t.landing.features.payments.title}</h3>
              <p className="text-gray-600">
                {t.landing.features.payments.desc}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                <Brain className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">{t.landing.features.ai.title}</h3>
              <p className="text-gray-600">
                {t.landing.features.ai.desc}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                <Calendar className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">{t.landing.features.calendar.title}</h3>
              <p className="text-gray-600">
                {t.landing.features.calendar.desc}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                <Shield className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">{t.landing.features.security.title}</h3>
              <p className="text-gray-600">
                {t.landing.features.security.desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Módulos Avanzados Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4079]/10 rounded-full text-[#1B4079] text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Módulos Avanzados
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que tu escuela necesita
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Funcionalidades diseñadas para modernizar cada aspecto de la gestión escolar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gamificación */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-purple-100">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Gamificación</h3>
              <p className="text-gray-600 text-sm">Puntos, insignias y rankings que motivan a los estudiantes a dar lo mejor de sí.</p>
            </div>

            {/* Tips IA */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-blue-100">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Tips Educativos IA</h3>
              <p className="text-gray-600 text-sm">Consejos personalizados por edad generados con IA para padres y familias.</p>
            </div>

            {/* Tienda */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-green-100">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <Store className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Tienda Multi-vendor</h3>
              <p className="text-gray-600 text-sm">Uniformes, libros y más. Con Stripe Connect para proveedores autorizados.</p>
            </div>

            {/* Enfermería */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-red-100">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Enfermería Digital</h3>
              <p className="text-gray-600 text-sm">Historial médico, alergias, visitas y alertas de salud de cada alumno.</p>
            </div>

            {/* Reportes */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-amber-100">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Reportes Inteligentes</h3>
              <p className="text-gray-600 text-sm">Académicos, financieros, asistencia y más. Programados o bajo demanda.</p>
            </div>

            {/* Rendimiento */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-indigo-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Rendimiento Docente</h3>
              <p className="text-gray-600 text-sm">Métricas, evaluaciones y feedback para el desarrollo profesional del maestro.</p>
            </div>

            {/* Recordatorios IA */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-teal-100">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Recordatorios IA</h3>
              <p className="text-gray-600 text-sm">Notificaciones automáticas de pagos, tareas, citas y eventos importantes.</p>
            </div>

            {/* PWA */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">App Móvil (PWA)</h3>
              <p className="text-gray-600 text-sm">Instálala en cualquier dispositivo. Funciona offline y recibe notificaciones push.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="precios" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#CBDF90]/30 rounded-full text-[#1B4079] text-sm font-medium mb-4">
              <CreditCard className="w-4 h-4" />
              Precios Transparentes
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Planes que se adaptan a tu escuela
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Desde $149 MXN por alumno al mes. <strong>El colegio recauda y gana 50%.</strong> Sin sorpresas, sin costos ocultos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Plan Básico */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-[#1B4079]/30 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Básico</h3>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl font-bold text-[#1B4079]">$149</span>
                  <span className="text-gray-500 mb-1">MXN/alumno/mes</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">50% para tu colegio: $74.50/alumno</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 text-sm">Comunicación (mensajes, anuncios)</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 text-sm">Tareas y calificaciones</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 text-sm">Calendario de eventos</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 text-sm">Control de asistencia</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 text-sm">Pagos y cobranza básica</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 text-sm">Soporte por chat</span></li>
              </ul>
              <Link href="/login" className="block w-full py-3 text-center bg-gray-100 text-[#1B4079] font-semibold rounded-xl hover:bg-gray-200 transition-all">
                Comenzar
              </Link>
            </div>

            {/* Plan Estándar - Recomendado */}
            <div className="bg-[#1B4079] rounded-2xl p-8 shadow-xl relative transform md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#CBDF90] text-[#1B4079] text-sm font-bold rounded-full">
                Más Popular
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Estándar</h3>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl font-bold text-[#CBDF90]">$199</span>
                  <span className="text-white/70 mb-1">MXN/alumno/mes</span>
                </div>
                <p className="text-sm text-white/60 mt-2">50% para tu colegio: $99.50/alumno</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-[#CBDF90] flex-shrink-0 mt-0.5" /><span className="text-white/90 text-sm">Todo lo del plan Básico</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-[#CBDF90] flex-shrink-0 mt-0.5" /><span className="text-white/90 text-sm">Enfermería y expediente médico</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-[#CBDF90] flex-shrink-0 mt-0.5" /><span className="text-white/90 text-sm">Tienda escolar integrada</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-[#CBDF90] flex-shrink-0 mt-0.5" /><span className="text-white/90 text-sm">Galería de fotos por evento</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-[#CBDF90] flex-shrink-0 mt-0.5" /><span className="text-white/90 text-sm">Reportes avanzados</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-[#CBDF90] flex-shrink-0 mt-0.5" /><span className="text-white/90 text-sm">Asistente IA para padres</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-[#CBDF90] flex-shrink-0 mt-0.5" /><span className="text-white/90 text-sm">Recordatorios automáticos</span></li>
              </ul>
              <Link href="/login" className="block w-full py-3 text-center bg-[#CBDF90] text-[#1B4079] font-bold rounded-xl hover:bg-white transition-all">
                Elegir Estándar
              </Link>
            </div>

            {/* Plan Premium */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-[#1B4079]/30 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl font-bold text-[#1B4079]">$299</span>
                  <span className="text-gray-500 mb-1">MXN/alumno/mes</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">50% para tu colegio: $149.50/alumno</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 text-sm">Todo lo del plan Estándar</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 text-sm">Gamificación con insignias</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 text-sm">Blog de tips educativos IA</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 text-sm">Multi-vendor con Stripe Connect</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 text-sm">Rendimiento de profesores</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 text-sm">CRM y campañas de email</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 text-sm">Soporte prioritario 24/7</span></li>
              </ul>
              <Link href="/login" className="block w-full py-3 text-center bg-gray-100 text-[#1B4079] font-semibold rounded-xl hover:bg-gray-200 transition-all">
                Elegir Premium
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              <strong>Pago anual:</strong> 2 meses gratis (paga 10, usa 12)
            </p>
            <p className="text-sm text-gray-500">
              Setup único desde $8,000 MXN según tamaño del colegio. Incluye capacitación, migración de datos y soporte de implementación.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonial/Social Proof */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-[#1B4079] rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4D7C8A]/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#CBDF90]/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <div className="text-5xl mb-6 text-white/80">"</div>
              <p className="text-xl md:text-2xl text-white leading-relaxed mb-8">
                {t.landing.testimonial.quote} <strong className="text-[#CBDF90]">{t.landing.testimonial.highlight}</strong>{t.landing.testimonial.quote2}
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                  MR
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">{t.landing.testimonial.author}</p>
                  <p className="text-white/70 text-sm">{t.landing.testimonial.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            {t.landing.cta.title}
          </h2>
          <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
            {t.landing.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#1B4079] text-white font-bold rounded-xl hover:bg-[#4D7C8A] transition-all shadow-lg hover:shadow-xl hover:scale-105 text-lg"
            >
              {t.landing.cta.button}
              <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="#funcionalidades"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 border-2 border-[#1B4079] text-[#1B4079] font-bold rounded-xl hover:bg-[#1B4079]/5 transition-all text-lg"
            >
              {t.landing.cta.learnMore}
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        {/* Pleca superior */}
        <div className="bg-[#1B4079] py-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-end">
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Linkedin className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Contenido del footer */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <p className="text-gray-400 text-sm max-w-md">
                {t.landing.footer.desc}
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t.landing.footer.product}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#funcionalidades" className="hover:text-white transition-colors">{t.landing.footer.features}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.pricing}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.caseStudies}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t.landing.footer.resources}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.blog}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.videos}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.support}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              {t.landing.footer.copyright}
            </p>
            <p className="text-gray-500 text-sm">
              {t.landing.footer.tagline}
            </p>
          </div>
        </div>
      </footer>
      
      {/* Chatbot flotante */}
      <LandingChatbot />
    </main>
  );
}
