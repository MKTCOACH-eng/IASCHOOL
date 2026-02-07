import { LoginForm } from "./_components/login-form";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Shield, Clock, Users } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1B4079]">
        <Image
          src="https://cdn.abacus.ai/images/bf878abc-a73f-4b3f-a55b-caba779e7dd0.jpg"
          alt="IA School Platform"
          fill
          className="object-cover opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B4079]/80 to-[#0d2847]/90" />
        
        {/* Content over image */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image src="/iaschool-logo-white.png" alt="IA School" width={50} height={50} />
              <span className="text-2xl font-bold">IA School</span>
            </Link>
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4">
                El sistema operativo para colegios del futuro
              </h2>
              <p className="text-lg text-white/80">
                Conecta a directivos, profesores y familias en una sola plataforma inteligente.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6" />
                </div>
                <p className="text-sm text-white/70">Seguro y confiable</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-sm text-white/70">24/7 disponible</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-sm text-white/70">+10,000 familias</p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-white/50">
            © 2026 IA School. Transformando la educación con tecnología.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B4079] mb-8 transition-colors lg:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          {/* Desktop Back Link */}
          <Link
            href="/"
            className="hidden lg:inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B4079] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1B4079] to-[#2d5a9e] rounded-2xl flex items-center justify-center">
                <Image
                  src="/iaschool-logo-white.png"
                  alt="IA School Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Bienvenido
            </h1>
            <p className="text-center text-gray-500 mb-8">
              Ingresa a tu cuenta de IA School
            </p>

            <LoginForm />
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-8">
            Powered by <span className="font-semibold text-[#1B4079]">IA School</span>
          </p>
        </div>
      </div>
    </main>
  );
}
