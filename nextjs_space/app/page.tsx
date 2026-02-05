import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Bell, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B4079]/5 via-white to-[#CBDF90]/10" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center">
            {/* School Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative w-20 h-20">
                <Image
                  src="/vermont-logo.svg"
                  alt="Vermont School Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Bienvenido a{" "}
              <span className="text-[#1B4079]">Vermont School</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Comunicación escolar simplificada. Todos los anuncios importantes en un solo lugar,
              sin el caos de los grupos de WhatsApp.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#1B4079] text-white font-semibold rounded-xl hover:bg-[#4D7C8A] transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Bell className="w-5 h-5" />
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-[#1B4079]/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-[#1B4079]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Comunicación Clara</h3>
            <p className="text-sm text-gray-600">
              Recibe todos los anuncios del colegio de forma organizada y sin ruido.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-[#4D7C8A]/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-[#4D7C8A]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Información Instantánea</h3>
            <p className="text-sm text-gray-600">
              Entérate de lo importante al instante. Anuncios urgentes destacados.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-[#8FAD88]/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#8FAD88]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Seguro y Privado</h3>
            <p className="text-sm text-gray-600">
              Información exclusiva para la comunidad de Vermont School.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-gray-400">
            Powered by <span className="font-semibold text-[#4D7C8A]">IAschool</span>
          </p>
          <p className="text-xs text-gray-300 mt-1">
            La mejor tecnología es la que no se siente complicada
          </p>
        </div>
      </footer>
    </main>
  );
}
