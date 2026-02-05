import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Bell, Shield, Zap, Users, BookOpen, GraduationCap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section with Full Image Background */}
      <div className="relative min-h-[90vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/students_hero.jpg"
            alt="Estudiantes en aula moderna"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B4079]/90 via-[#1B4079]/70 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-2xl">
            {/* School Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div className="relative w-16 h-16 bg-white rounded-xl p-2 shadow-lg">
                <Image
                  src="/vermont-logo.svg"
                  alt="Vermont School Logo"
                  fill
                  className="object-contain p-1"
                  priority
                />
              </div>
              <span className="text-white/90 text-xl font-medium">Vermont School</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Tu conexión directa con la{" "}
              <span className="text-[#CBDF90]">educación de tus hijos</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-10 leading-relaxed">
              La plataforma integral que conecta a padres, profesores y directivos. 
              Comunicación, tareas, pagos y seguimiento académico en un solo lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1B4079] font-semibold rounded-xl hover:bg-[#CBDF90] transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Bell className="w-5 h-5" />
                Iniciar Sesión
              </Link>
              <a
                href="#funcionalidades"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                Conocer más
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-[#1B4079] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">100%</div>
              <div className="text-white/70 text-sm mt-1">Comunicación centralizada</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#CBDF90]">24/7</div>
              <div className="text-white/70 text-sm mt-1">Acceso a información</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">Multi-rol</div>
              <div className="text-white/70 text-sm mt-1">Padres, profes, directivos</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#CBDF90]">Seguro</div>
              <div className="text-white/70 text-sm mt-1">Datos protegidos</div>
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
                alt="Padres revisando información escolar"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4079]/10 rounded-full text-[#1B4079] text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                Para Padres de Familia
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Todo sobre la educación de tus hijos, al alcance de tu mano
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8FAD88] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Recibe anuncios importantes del colegio al instante</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8FAD88] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Consulta tareas, entregas y calificaciones en tiempo real</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8FAD88] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Comunícate directamente con profesores y administración</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8FAD88] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Gestiona múltiples hijos desde una sola cuenta</span>
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
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Herramientas que simplifican tu labor docente
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4D7C8A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Publica tareas y materiales con un solo clic</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4D7C8A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Lleva el control de asistencia digital</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4D7C8A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Comunícate de forma profesional con padres</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4D7C8A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Visualiza métricas de participación de tu grupo</span>
                </li>
              </ul>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl order-1 lg:order-2">
              <Image
                src="/teacher_hero.jpg"
                alt="Profesor usando tecnología educativa"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Una plataforma, infinitas posibilidades
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar la comunicación y administración escolar
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-[#1B4079]/10 flex items-center justify-center mb-5">
                <MessageSquare className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Comunicación Centralizada</h3>
              <p className="text-gray-600">
                Anuncios oficiales, mensajería directa y canales por grupo. Todo en un solo lugar.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-[#4D7C8A]/10 flex items-center justify-center mb-5">
                <Zap className="w-7 h-7 text-[#4D7C8A]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Gestión Académica</h3>
              <p className="text-gray-600">
                Tareas, entregas, calificaciones y seguimiento del progreso de cada alumno.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-[#8FAD88]/10 flex items-center justify-center mb-5">
                <Shield className="w-7 h-7 text-[#8FAD88]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Seguridad Total</h3>
              <p className="text-gray-600">
                Datos protegidos, acceso por roles y privacidad garantizada para toda la comunidad.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-[#CBDF90]/30 flex items-center justify-center mb-5">
                <GraduationCap className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Multi-Colegio</h3>
              <p className="text-gray-600">
                Arquitectura white-label que se adapta a la identidad de cada institución.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-[#7F9C96]/20 flex items-center justify-center mb-5">
                <Users className="w-7 h-7 text-[#4D7C8A]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Multi-Rol</h3>
              <p className="text-gray-600">
                Experiencia personalizada para directivos, profesores, padres y alumnos.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-[#1B4079]/10 flex items-center justify-center mb-5">
                <Bell className="w-7 h-7 text-[#1B4079]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Notificaciones Inteligentes</h3>
              <p className="text-gray-600">
                Alertas personalizadas para que nunca te pierdas lo importante.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-[#1B4079]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            ¿Listo para transformar la comunicación de tu colegio?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Únete a Vermont School y descubre una nueva forma de mantenerte conectado con la educación.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-[#1B4079] font-bold rounded-xl hover:bg-[#CBDF90] transition-all shadow-lg hover:shadow-xl hover:scale-105 text-lg"
          >
            Acceder a la Plataforma
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-white rounded-lg p-1">
                <Image
                  src="/vermont-logo.svg"
                  alt="Vermont School Logo"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <span className="text-white font-medium">Vermont School</span>
            </div>
            <p className="text-gray-400 text-sm">
              Powered by <span className="font-semibold text-[#CBDF90]">IAschool</span> · La tecnología que conecta familias y escuelas
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
