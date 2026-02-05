import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Shield, BookOpen, CreditCard, PlayCircle, FileText, Calendar, Brain, ChevronRight, Bell, Users, XCircle, CheckCircle, ArrowRight, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation - White Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <div className="relative h-[86px] w-[240px]">
              <Image
                src="/iaschool-logo.png"
                alt="IA School"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
          <Link
            href="/login"
            className="px-6 py-2.5 bg-[#1B4079] text-white font-medium rounded-lg hover:bg-[#4D7C8A] transition-all"
          >
            Iniciar Sesión
          </Link>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <div className="relative min-h-[95vh] flex items-center pt-20">
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
              Plataforma educativa con Inteligencia Artificial
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              El sistema operativo para{" "}
              <span className="text-[#CBDF90]">colegios del futuro</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-10 leading-relaxed">
              Una plataforma integral que conecta a directivos, profesores y familias 
              para crear comunidades educativas más organizadas y eficientes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#CBDF90] text-[#1B4079] font-bold rounded-xl hover:bg-white transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Solicitar Demo
                <ChevronRight className="w-5 h-5" />
              </Link>
              <a
                href="#funcionalidades"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/30"
              >
                Descubrir IA School
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-white/60 text-sm mb-4">Confiado por instituciones educativas líderes</p>
              <div className="flex items-center gap-6 text-white/80">
                <span className="text-sm font-medium">+50 colegios</span>
                <span className="text-white/30">|</span>
                <span className="text-sm font-medium">+10,000 familias</span>
                <span className="text-white/30">|</span>
                <span className="text-sm font-medium">99.9% uptime</span>
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
              ¿Tu colegio también vive este caos?
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Información dispersa en WhatsApp, correos sin respuesta, pagos sin control, 
              profesores abrumados y padres desinformados. <strong className="text-[#1B4079]">IA School lo resuelve todo.</strong>
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-[#1B4079] mb-2">Sin IA School</h3>
              <p className="text-gray-500 text-sm">50+ grupos de WhatsApp, información perdida, padres confundidos, carga administrativa excesiva</p>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="w-10 h-10 text-[#1B4079]" />
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-[#1B4079] mb-2">Con IA School</h3>
              <p className="text-gray-600 text-sm">Una sola plataforma, comunicación clara, operación eficiente, familias satisfechas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              IA School vs. Otras Plataformas
            </h2>
            <p className="text-gray-600">
              Una comparación clara de por qué somos la mejor opción
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1B4079] text-white">
                  <th className="py-4 px-6 text-left font-semibold">Característica</th>
                  <th className="py-4 px-6 text-center font-semibold">IA School</th>
                  <th className="py-4 px-6 text-center font-semibold text-white/70">Otros</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 px-6 text-gray-700">Comunicación centralizada</td>
                  <td className="py-4 px-6 text-center"><CheckCircle className="w-5 h-5 text-[#1B4079] mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><XCircle className="w-5 h-5 text-gray-300 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-4 px-6 text-gray-700">Inteligencia Artificial integrada</td>
                  <td className="py-4 px-6 text-center"><CheckCircle className="w-5 h-5 text-[#1B4079] mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><XCircle className="w-5 h-5 text-gray-300 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700">Control de pagos y cobranza</td>
                  <td className="py-4 px-6 text-center"><CheckCircle className="w-5 h-5 text-[#1B4079] mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><XCircle className="w-5 h-5 text-gray-300 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-4 px-6 text-gray-700">White-label personalizable</td>
                  <td className="py-4 px-6 text-center"><CheckCircle className="w-5 h-5 text-[#1B4079] mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><XCircle className="w-5 h-5 text-gray-300 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700">Soporte en español 24/7</td>
                  <td className="py-4 px-6 text-center"><CheckCircle className="w-5 h-5 text-[#1B4079] mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><XCircle className="w-5 h-5 text-gray-300 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-4 px-6 text-gray-700">Diseñado para LATAM</td>
                  <td className="py-4 px-6 text-center"><CheckCircle className="w-5 h-5 text-[#1B4079] mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><XCircle className="w-5 h-5 text-gray-300 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-[#1B4079] to-[#4D7C8A] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-white">85%</div>
              <div className="text-white/70 text-sm mt-2">Reducción de carga administrativa</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-[#CBDF90]">3x</div>
              <div className="text-white/70 text-sm mt-2">Mejor comunicación familia-escuela</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-white">100%</div>
              <div className="text-white/70 text-sm mt-2">Trazabilidad en cobranza</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-[#CBDF90]">24/7</div>
              <div className="text-white/70 text-sm mt-2">Información disponible</div>
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
                    <p className="text-xs text-gray-500">Nuevo anuncio</p>
                    <p className="text-sm font-medium text-gray-900">Reunión de padres - Viernes 3pm</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4079]/10 rounded-full text-[#1B4079] text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                Para Familias
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Toda la información de tus hijos, en la palma de tu mano
              </h2>
              <p className="text-gray-600 mb-6">
                Nunca más pierdas un aviso importante. Desde tareas hasta pagos, 
                todo lo que necesitas saber sobre la educación de tus hijos está a un clic de distancia.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8FAD88] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>Anuncios en tiempo real</strong> — Recibe notificaciones instantáneas de todo lo importante</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8FAD88] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>Seguimiento académico</strong> — Tareas, calificaciones y progreso siempre actualizados</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8FAD88] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>Comunicación directa</strong> — Chat profesional con profesores y administración</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8FAD88] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>Multi-hijo</strong> — Gestiona la información de todos tus hijos en una sola cuenta</span>
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
                Para Profesores
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Más tiempo enseñando, menos tiempo administrando
              </h2>
              <p className="text-gray-600 mb-6">
                Herramientas intuitivas que automatizan las tareas repetitivas y te permiten 
                enfocarte en lo que realmente importa: la educación de tus alumnos.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4D7C8A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>Gestión de tareas simplificada</strong> — Publica, recibe y califica en minutos</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4D7C8A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>Asistencia digital</strong> — Control de asistencia con reportes automáticos</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4D7C8A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>Comunicación profesional</strong> — Canales formales con familias, sin WhatsApp</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4D7C8A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700"><strong>Métricas del grupo</strong> — Visualiza participación y rendimiento al instante</span>
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
                  <span className="text-sm font-medium text-gray-700">28/30 tareas entregadas</span>
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
              Todo lo que tu colegio necesita, en un solo lugar
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Módulos integrados que trabajan juntos para crear una experiencia educativa excepcional
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                <MessageSquare className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Comunicación Inteligente</h3>
              <p className="text-gray-600">
                Anuncios oficiales, mensajería directa, canales por grupo y notificaciones push. 
                Comunicación clara y trazable.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                <BookOpen className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Gestión Académica</h3>
              <p className="text-gray-600">
                Tareas, entregas, calificaciones, asistencia y reportes. 
                Seguimiento completo del progreso de cada alumno.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                <CreditCard className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Control de Pagos</h3>
              <p className="text-gray-600">
                Estados de cuenta, colegiaturas, recordatorios automáticos y reportes de cobranza 
                con visibilidad total.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                <Brain className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Inteligencia Artificial</h3>
              <p className="text-gray-600">
                Bot asistente para familias, análisis de sentimiento en comunicaciones, 
                alertas inteligentes y reportes automatizados.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                <Calendar className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Calendario Unificado</h3>
              <p className="text-gray-600">
                Eventos, entregas, reuniones y actividades. Un solo calendario 
                para toda la comunidad escolar.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                <Shield className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Seguridad y Privacidad</h3>
              <p className="text-gray-600">
                Datos protegidos, acceso por roles, cifrado de extremo a extremo 
                y cumplimiento de normativas de privacidad.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4079]/10 rounded-full text-[#1B4079] text-sm font-medium mb-4">
              <FileText className="w-4 h-4" />
              Recursos y Blog
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Aprende más sobre transformación educativa
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Videos, artículos y recursos para directivos y educadores que quieren llevar su colegio al siguiente nivel
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Video Card 1 */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
              <div className="relative aspect-video bg-[#1B4079]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">VIDEO</div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-2">Cómo eliminar WhatsApp de tu colegio</h3>
                <p className="text-gray-600 text-sm">Guía paso a paso para migrar la comunicación escolar a una plataforma profesional.</p>
                <p className="text-[#1B4079] text-sm font-medium mt-3">Ver video · 12 min</p>
              </div>
            </div>

            {/* Article Card 1 */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
              <div className="relative aspect-video bg-gradient-to-br from-[#4D7C8A] to-[#8FAD88]">
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <FileText className="w-16 h-16 text-white/80" />
                </div>
                <div className="absolute top-3 left-3 px-2 py-1 bg-[#1B4079] text-white text-xs font-medium rounded">ARTÍCULO</div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-2">5 señales de que tu colegio necesita digitalizarse</h3>
                <p className="text-gray-600 text-sm">Identifica si tu institución está lista para dar el salto a la transformación digital.</p>
                <p className="text-[#1B4079] text-sm font-medium mt-3">Leer artículo · 5 min</p>
              </div>
            </div>

            {/* Video Card 2 */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
              <div className="relative aspect-video bg-[#1B4079]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">VIDEO</div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-2">Demo completo de IA School</h3>
                <p className="text-gray-600 text-sm">Recorre todas las funcionalidades de la plataforma en esta demostración guiada.</p>
                <p className="text-[#1B4079] text-sm font-medium mt-3">Ver video · 20 min</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-[#1B4079] font-semibold hover:gap-3 transition-all"
            >
              Ver todos los recursos
              <ChevronRight className="w-5 h-5" />
            </a>
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
                IA School transformó completamente la forma en que nos comunicamos con las familias. 
                Pasamos de tener 47 grupos de WhatsApp a <strong className="text-[#CBDF90]">una sola plataforma 
                donde todo está organizado</strong>. Los padres están más informados y nosotros más tranquilos.
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                  MR
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">María Rodríguez</p>
                  <p className="text-white/70 text-sm">Directora, Colegio Vermont School</p>
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
            ¿Listo para transformar tu colegio?
          </h2>
          <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
            Únete a las instituciones educativas que ya están revolucionando 
            su operación con IA School. Agenda una demo personalizada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#1B4079] text-white font-bold rounded-xl hover:bg-[#4D7C8A] transition-all shadow-lg hover:shadow-xl hover:scale-105 text-lg"
            >
              Solicitar Demo Gratis
              <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="#funcionalidades"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 border-2 border-[#1B4079] text-[#1B4079] font-bold rounded-xl hover:bg-[#1B4079]/5 transition-all text-lg"
            >
              Conocer más
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
                El sistema operativo para colegios del futuro. Centraliza comunicación, 
                gestión académica, pagos y análisis con IA en una sola plataforma.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Casos de éxito</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Videos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Soporte</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 IA School. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-sm">
              La tecnología que conecta familias y escuelas
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
