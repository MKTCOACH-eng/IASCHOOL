'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Copy, 
  CheckCircle, 
  School, 
  Gift, 
  TrendingUp, 
  Plus, 
  Loader2,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  affiliateCode: string;
  status: string;
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  createdAt: string;
}

interface Lead {
  id: string;
  schoolName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  city: string | null;
  status: string;
  createdAt: string;
  activatedAt: string | null;
  commissionAmount: number | null;
}

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewLead, setShowNewLead] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newLead, setNewLead] = useState({
    schoolName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    estimatedStudents: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [affiliateRes, leadsRes] = await Promise.all([
        fetch('/api/public-affiliates/me'),
        fetch('/api/public-affiliates/leads')
      ]);

      if (!affiliateRes.ok) {
        router.push('/affiliate/login');
        return;
      }

      const affiliateData = await affiliateRes.json();
      const leadsData = await leadsRes.json();

      setAffiliate(affiliateData);
      setLeads(Array.isArray(leadsData) ? leadsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      router.push('/affiliate/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/public-affiliates/logout', { method: 'POST' });
    router.push('/affiliate/login');
  };

  const copyReferralLink = () => {
    if (!affiliate) return;
    const link = `${window.location.origin}/ref/${affiliate.affiliateCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success('Link copiado al portapapeles');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/public-affiliates/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar colegio');
      }

      toast.success('¡Colegio registrado exitosamente!');
      setShowNewLead(false);
      setNewLead({
        schoolName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        city: '',
        estimatedStudents: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al registrar');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      PENDING: { bg: 'bg-gray-100', text: 'text-gray-600', icon: <Clock className="w-3 h-3" /> },
      CONTACTED: { bg: 'bg-blue-100', text: 'text-blue-600', icon: <AlertCircle className="w-3 h-3" /> },
      INTERESTED: { bg: 'bg-amber-100', text: 'text-amber-600', icon: <TrendingUp className="w-3 h-3" /> },
      REGISTERED: { bg: 'bg-purple-100', text: 'text-purple-600', icon: <School className="w-3 h-3" /> },
      ACTIVATED: { bg: 'bg-green-100', text: 'text-green-600', icon: <CheckCircle2 className="w-3 h-3" /> },
      EXPIRED: { bg: 'bg-red-100', text: 'text-red-600', icon: <XCircle className="w-3 h-3" /> },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-600', icon: <XCircle className="w-3 h-3" /> }
    };

    const statusNames: Record<string, string> = {
      PENDING: 'Pendiente',
      CONTACTED: 'Contactado',
      INTERESTED: 'Interesado',
      DEMO_SCHEDULED: 'Demo Agendada',
      REGISTERED: 'Registrado',
      ACTIVATED: 'Activado',
      EXPIRED: 'Expirado',
      REJECTED: 'Rechazado'
    };

    const style = styles[status] || styles.PENDING;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {statusNames[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  if (!affiliate) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/iaschool-logo-new.png" alt="IA School" width={40} height={40} className="rounded-lg" />
            <div>
              <span className="font-semibold text-gray-900 block">Portal de Afiliados</span>
              <span className="text-xs text-gray-500">IA School</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hola, {affiliate.name}</span>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <School className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Colegios Referidos</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{affiliate.totalReferrals}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Activados</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{affiliate.successfulReferrals}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Total Ganado</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">${Number(affiliate.totalEarnings).toLocaleString()} <span className="text-sm font-normal text-gray-500">MXN</span></p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-gray-500">Pendiente</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">${Number(affiliate.pendingEarnings).toLocaleString()} <span className="text-sm font-normal text-gray-500">MXN</span></p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-gradient-to-r from-[#1B4079] to-[#2d5a9e] rounded-xl p-6 mb-8 text-white">
          <h3 className="font-semibold mb-2">Tu Link de Afiliado</h3>
          <p className="text-white/70 text-sm mb-4">Comparte este link con colegios interesados en IA School</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/ref/${affiliate.affiliateCode}`}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/50"
            />
            <button
              onClick={copyReferralLink}
              className="bg-white text-[#1B4079] px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-white/90 transition-colors"
            >
              {copiedLink ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copiedLink ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Leads Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Colegios Referidos</h2>
              <p className="text-sm text-gray-500">Registra y da seguimiento a los colegios que refieres</p>
            </div>
            <button
              onClick={() => setShowNewLead(true)}
              className="bg-[#1B4079] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#152d57] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Registrar Colegio
            </button>
          </div>

          {leads.length === 0 ? (
            <div className="p-12 text-center">
              <School className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Aún no has referido colegios</h3>
              <p className="text-gray-500 text-sm mb-4">Registra un colegio para comenzar a ganar comisiones</p>
              <button
                onClick={() => setShowNewLead(true)}
                className="text-[#1B4079] font-medium hover:underline"
              >
                Registrar mi primer colegio
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <div key={lead.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{lead.schoolName}</h3>
                      <p className="text-sm text-gray-500">{lead.contactName} • {lead.contactEmail}</p>
                      {lead.city && <p className="text-sm text-gray-400">{lead.city}</p>}
                    </div>
                    <div className="text-right">
                      {getStatusBadge(lead.status)}
                      {lead.commissionAmount && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          +${Number(lead.commissionAmount).toLocaleString()} MXN
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Registrado: {new Date(lead.createdAt).toLocaleDateString('es-MX')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Lead Modal */}
      {showNewLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Registrar Colegio</h2>
              <p className="text-sm text-gray-500">Ingresa los datos del colegio que deseas referir</p>
            </div>
            
            <form onSubmit={handleSubmitLead} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Colegio *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none"
                  placeholder="Ej: Colegio San Pablo"
                  value={newLead.schoolName}
                  onChange={(e) => setNewLead({ ...newLead, schoolName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Contacto *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none"
                  placeholder="Director/a o encargado/a"
                  value={newLead.contactName}
                  onChange={(e) => setNewLead({ ...newLead, contactName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email del Contacto *</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none"
                  placeholder="director@colegio.edu"
                  value={newLead.contactEmail}
                  onChange={(e) => setNewLead({ ...newLead, contactEmail: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none"
                    placeholder="+52 55 1234 5678"
                    value={newLead.contactPhone}
                    onChange={(e) => setNewLead({ ...newLead, contactPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none"
                    placeholder="Ciudad de México"
                    value={newLead.city}
                    onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alumnos Estimados</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none"
                  placeholder="Ej: 500"
                  value={newLead.estimatedStudents}
                  onChange={(e) => setNewLead({ ...newLead, estimatedStudents: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#1B4079] focus:ring-1 focus:ring-[#1B4079] outline-none resize-none"
                  rows={3}
                  placeholder="Información adicional sobre el colegio..."
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewLead(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#1B4079] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#152d57] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar Colegio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
