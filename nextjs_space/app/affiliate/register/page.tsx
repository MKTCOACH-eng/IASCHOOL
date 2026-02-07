'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, CheckCircle, School, Gift, Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/language-context';

export default function AffiliateRegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.affiliate.registerSuccess}</h2>
          <p className="text-gray-600 mb-6">{t.affiliate.accountCreated}</p>
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
            <Image src="/iaschool-logo-white.png" alt="IA School" width={40} height={40} className="rounded-lg" />
            <span className="text-white font-semibold text-lg">IA School</span>
          </Link>
          <Link href="/affiliate/login" className="text-white/80 hover:text-white transition-colors">
            {t.affiliate.haveAccount} {t.affiliate.login}
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Benefits Section */}
          <div>
            <h1 className="text-4xl font-bold mb-4 text-white">{t.affiliate.program}</h1>
            <p className="text-xl text-white/80 mb-8">
              {t.affiliate.referSchools}
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <School className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-white">{t.affiliate.referTitle}</h3>
                  <p className="text-white/70">{t.affiliate.referDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-white">{t.affiliate.setupFee}</h3>
                  <p className="text-white/70">{t.affiliate.setupFeeDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-white">{t.affiliate.freeYear}</h3>
                  <p className="text-white/70">{t.affiliate.freeYearDesc}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20">
              <p className="text-sm text-white/80">
                <strong className="text-white">{t.affiliate.activationWindow}:</strong> {t.affiliate.activationDesc}
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.affiliate.createAccount}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.affiliate.fullName}</label>
                <input
                  type="text"
                  required
                  name="name"
                  id="affiliate-name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none transition-colors"
                  placeholder={t.affiliate.fullName}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.affiliate.email}</label>
                <input
                  type="email"
                  required
                  name="email"
                  id="affiliate-email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none transition-colors"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.affiliate.phone}</label>
                <input
                  type="tel"
                  name="phone"
                  id="affiliate-phone"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none transition-colors"
                  placeholder="+52 55 1234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.affiliate.password}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    name="password"
                    id="affiliate-password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none transition-colors pr-12"
                    placeholder={t.affiliate.minChars}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.affiliate.confirmPassword}</label>
                <input
                  type="password"
                  required
                  name="confirmPassword"
                  id="affiliate-confirm-password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none transition-colors"
                  placeholder={t.affiliate.repeatPassword}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  className="mt-1 w-4 h-4 text-[#1B4079] border-gray-300 rounded focus:ring-[#1B4079]"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  {t.affiliate.acceptTerms} <a href="#" className="text-[#1B4079] hover:underline">{t.affiliate.termsLink}</a> {t.affiliate.termsProgram}
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
                    {t.affiliate.createBtn} <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              {t.affiliate.haveAccount}{' '}
              <Link href="/affiliate/login" className="text-[#1B4079] hover:underline font-medium">
                {t.affiliate.login}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
