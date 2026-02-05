import { LoginForm } from "./_components/login-form";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B4079] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16">
                <Image
                  src="/vermont-logo.svg"
                  alt="Vermont School Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Bienvenido
            </h1>
            <p className="text-center text-gray-500 mb-8">
              Ingresa a tu cuenta de Vermont School
            </p>

            <LoginForm />
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-8">
            Powered by <span className="font-semibold text-[#4D7C8A]">IAschool</span>
          </p>
        </div>
      </div>
    </main>
  );
}
