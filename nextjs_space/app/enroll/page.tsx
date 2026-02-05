"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";

type Step = "validate" | "complete" | "success";

interface InvitationData {
  id: string;
  email: string;
  role: string;
  schoolName: string;
  schoolId: string;
}

export default function EnrollPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [step, setStep] = useState<Step>("validate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Step 1: Validation form
  const [schoolCode, setSchoolCode] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  // Step 2: Complete profile form
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/invitations/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, schoolCode, tempPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al validar");
        return;
      }

      setInvitationData(data.invitation);
      setStep("complete");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/invitations/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, phone, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al completar registro");
        return;
      }

      setStep("success");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN": return "Administrador";
      case "PROFESOR": return "Profesor";
      case "PADRE": return "Padre de familia";
      default: return role;
    }
  };

  if (!token && step === "validate") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link inválido</h1>
          <p className="text-gray-600 mb-6">
            Este enlace de invitación no es válido. Por favor, verifica el enlace que recibiste por correo.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#1B4079] font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B4079] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative w-40 h-16">
                <Image
                  src="/iaschool-logo.png"
                  alt="IA School Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Step 1: Validate */}
            {step === "validate" && (
              <>
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  Activar cuenta
                </h1>
                <p className="text-center text-gray-500 mb-8">
                  Ingresa el código de tu colegio y la contraseña temporal que recibiste
                </p>

                <form onSubmit={handleValidate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código del colegio
                    </label>
                    <input
                      type="text"
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent outline-none transition-all uppercase"
                      placeholder="Ej: VERMONT2026"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña temporal
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent outline-none transition-all pr-12"
                        placeholder="Contraseña del correo"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#1B4079] text-white font-semibold rounded-lg hover:bg-[#4D7C8A] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Validando...</>
                    ) : (
                      "Continuar"
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Step 2: Complete profile */}
            {step === "complete" && invitationData && (
              <>
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  Completar perfil
                </h1>
                <p className="text-center text-gray-500 mb-2">
                  Bienvenido a <strong className="text-[#1B4079]">{invitationData.schoolName}</strong>
                </p>
                <p className="text-center text-sm text-gray-400 mb-8">
                  Rol: {getRoleName(invitationData.role)}
                </p>

                <form onSubmit={handleComplete} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={invitationData.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent outline-none transition-all"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono <span className="text-gray-400">(opcional)</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent outline-none transition-all"
                      placeholder="+52 555 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent outline-none transition-all pr-12"
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar contraseña
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent outline-none transition-all"
                      placeholder="Repite tu contraseña"
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#1B4079] text-white font-semibold rounded-lg hover:bg-[#4D7C8A] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Creando cuenta...</>
                    ) : (
                      "Crear cuenta"
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Step 3: Success */}
            {step === "success" && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Cuenta creada!
                </h1>
                <p className="text-gray-600 mb-8">
                  Tu cuenta ha sido activada exitosamente. Ya puedes iniciar sesión.
                </p>
                <button
                  onClick={() => router.push("/login")}
                  className="w-full py-3 bg-[#1B4079] text-white font-semibold rounded-lg hover:bg-[#4D7C8A] transition-all"
                >
                  Iniciar sesión
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Powered by <span className="font-semibold text-[#4D7C8A]">IA School</span>
          </p>
        </div>
      </div>
    </main>
  );
}
