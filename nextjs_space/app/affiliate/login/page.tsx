'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AffiliateLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/public-affiliates/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      toast.success('¡Bienvenido!');
      router.push('/affiliate/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B4079] to-[#0d2847] flex items-center justify-center p-4">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/iaschool-logo-new.png" alt="IA School" width={40} height={40} className="rounded-lg" />
            <span className="text-white font-semibold text-lg">IA School</span>
          </Link>
          <Link href="/affiliate/register" className="text-white/80 hover:text-white transition-colors">
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>
      </header>

      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl mt-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#1B4079] to-[#2d5a9e] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Image src="/iaschool-logo-new.png" alt="IA School" width={40} height={40} className="rounded-lg" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Portal de Afiliados</h1>
          <p className="text-gray-500 mt-1">Inicia sesión para acceder a tu dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none transition-colors"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none transition-colors pr-12"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#1B4079] to-[#2d5a9e] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Iniciar Sesión <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/affiliate/register" className="text-[#1B4079] hover:underline font-medium">
            Regístrate como afiliado
          </Link>
        </p>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            ¿Eres colegio o padre de familia?{' '}
            <Link href="/login" className="text-[#1B4079] hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
