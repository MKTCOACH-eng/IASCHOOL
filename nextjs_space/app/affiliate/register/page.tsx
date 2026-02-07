'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, CheckCircle, School, Gift, Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AffiliateRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!formData.termsAccepted) {
      toast.error('Debes aceptar los términos del programa');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/public-affiliates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar');
      }

      setSuccess(true);
      toast.success('¡Registro exitoso!');
      
      setTimeout(() => {
        router.push('/affiliate/login');
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B4079] to-[#0d2847] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Registro Exitoso!</h2>
          <p className="text-gray-600 mb-6">Tu cuenta de afiliado ha sido creada. Redirigiendo al login...</p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1B4079]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B4079] to-[#0d2847]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/iaschool-logo-new.png" alt="IA School" width={40} height={40} className="rounded-lg" />
            <span className="text-white font-semibold text-lg">IA School</span>
          </Link>
          <Link href="/affiliate/login" className="text-white/80 hover:text-white transition-colors">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Benefits Section */}
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">Programa de Afiliados</h1>
            <p className="text-xl text-white/80 mb-8">
              Refiere colegios a IA School y obtén beneficios exclusivos
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <School className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Refiere Colegios</h3>
                  <p className="text-white/70">Identifica colegios que quieran modernizar su gestión escolar</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">10% del Setup</h3>
                  <p className="text-white/70">Recibe el 10% de la cuota de setup cuando el colegio active</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">1 Año Gratis</h3>
                  <p className="text-white/70">Si tienes hijos en un colegio con IA School, recibe 1 año gratis para uno de ellos</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20">
              <p className="text-sm text-white/80">
                <strong className="text-white">Ventana de activación:</strong> El colegio tiene 30 días desde su registro para activar y que recibas tus beneficios.
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Cuenta de Afiliado</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none transition-colors"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none transition-colors"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none transition-colors"
                  placeholder="+52 55 1234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none transition-colors pr-12"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none transition-colors"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 text-[#1B4079] border-gray-300 rounded focus:ring-[#1B4079]"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  Acepto los <a href="#" className="text-[#1B4079] hover:underline">términos y condiciones</a> del Programa de Afiliados de IA School
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#1B4079] to-[#2d5a9e] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Crear Cuenta <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              ¿Ya tienes cuenta?{' '}
              <Link href="/affiliate/login" className="text-[#1B4079] hover:underline font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
