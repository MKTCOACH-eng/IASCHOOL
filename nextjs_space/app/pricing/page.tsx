'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Star,
  Users,
  School,
  MessageSquare,
  Calendar,
  CreditCard,
  FileText,
  Bell,
  Shield,
  Headphones,
  Zap,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowRight,
  Phone,
  Mail,
  Building2,
  GraduationCap,
  Heart,
  TrendingUp,
  Clock,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLANS = [
  {
    name: 'Básico',
    description: 'Ideal para colegios pequeños',
    price: 2500,
    currency: 'MXN',
    period: 'mes',
    students: 'Hasta 200 estudiantes',
    highlighted: false,
    features: [
      { name: 'Comunicación padres-maestros', included: true },
      { name: 'Anuncios y circulares', included: true },
      { name: 'Calendario escolar', included: true },
      { name: 'Directorio de contactos', included: true },
      { name: 'App móvil (PWA)', included: true },
      { name: 'Control de asistencia', included: false },
      { name: 'Gestión de pagos', included: false },
      { name: 'Boletas de calificaciones', included: false },
      { name: 'Módulo de enfermería', included: false },
      { name: 'Tienda escolar', included: false },
      { name: 'Chatbot IA', included: false },
      { name: 'Soporte prioritario', included: false },
    ],
  },
  {
    name: 'Profesional',
    description: 'La opción más popular',
    price: 4500,
    currency: 'MXN',
    period: 'mes',
    students: 'Hasta 500 estudiantes',
    highlighted: true,
    features: [
      { name: 'Comunicación padres-maestros', included: true },
      { name: 'Anuncios y circulares', included: true },
      { name: 'Calendario escolar', included: true },
      { name: 'Directorio de contactos', included: true },
      { name: 'App móvil (PWA)', included: true },
      { name: 'Control de asistencia', included: true },
      { name: 'Gestión de pagos', included: true },
      { name: 'Boletas de calificaciones', included: true },
      { name: 'Módulo de enfermería', included: true },
      { name: 'Tienda escolar', included: false },
      { name: 'Chatbot IA', included: false },
      { name: 'Soporte prioritario', included: true },
    ],
  },
  {
    name: 'Enterprise',
    description: 'Solución completa para grandes instituciones',
    price: 8500,
    currency: 'MXN',
    period: 'mes',
    students: 'Estudiantes ilimitados',
    highlighted: false,
    features: [
      { name: 'Comunicación padres-maestros', included: true },
      { name: 'Anuncios y circulares', included: true },
      { name: 'Calendario escolar', included: true },
      { name: 'Directorio de contactos', included: true },
      { name: 'App móvil (PWA)', included: true },
      { name: 'Control de asistencia', included: true },
      { name: 'Gestión de pagos', included: true },
      { name: 'Boletas de calificaciones', included: true },
      { name: 'Módulo de enfermería', included: true },
      { name: 'Tienda escolar', included: true },
      { name: 'Chatbot IA', included: true },
      { name: 'Soporte prioritario 24/7', included: true },
    ],
  },
];

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Comunicación Instantánea',
    description: 'Chat en tiempo real entre padres, maestros y administración. Mensajes grupales y privados.',
  },
  {
    icon: Calendar,
    title: 'Gestión de Eventos',
    description: 'Calendario escolar integrado con recordatorios automáticos y sincronización.',
  },
  {
    icon: CreditCard,
    title: 'Control de Pagos',
    description: 'Gestión completa de colegiaturas, pagos extra y recordatorios automáticos.',
  },
  {
    icon: FileText,
    title: 'Boletas Digitales',
    description: 'Generación automática de boletas con firmas digitales y acceso en línea.',
  },
  {
    icon: Heart,
    title: 'Módulo de Enfermería',
    description: 'Registro de visitas médicas, alergias, medicamentos y notificaciones a padres.',
  },
  {
    icon: Shield,
    title: 'Seguridad Total',
    description: 'Encriptación de datos, respaldos automáticos y cumplimiento de normativas.',
  },
];

const TESTIMONIALS = [
  {
    name: 'María González',
    role: 'Directora',
    school: 'Colegio San José',
    image: '/iaschool-logo.png',
    content: 'IA School transformó la comunicación en nuestro colegio. Los padres están más involucrados y los maestros ahorran horas de trabajo administrativo.',
    rating: 5,
  },
  {
    name: 'Roberto Hernández',
    role: 'Coordinador Académico',
    school: 'Instituto Moderno',
    image: '/iaschool-logo.png',
    content: 'La gestión de calificaciones y asistencia nunca había sido tan fácil. El sistema es intuitivo y el soporte es excelente.',
    rating: 5,
  },
  {
    name: 'Ana Martínez',
    role: 'Madre de familia',
    school: 'Colegio del Valle',
    image: '/iaschool-logo.png',
    content: 'Poder ver las calificaciones y comunicarme con los maestros desde mi celular me da mucha tranquilidad. ¡Excelente herramienta!',
    rating: 5,
  },
];

const FAQS = [
  {
    question: '¿Cuánto tiempo toma implementar IA School?',
    answer: 'La implementación típica toma entre 1-2 semanas. Incluimos capacitación completa para administradores, maestros y una sesión de orientación para padres.',
  },
  {
    question: '¿Pueden migrar nuestros datos existentes?',
    answer: 'Sí, ofrecemos migración de datos desde la mayoría de los sistemas escolares. Nuestro equipo se encarga de todo el proceso.',
  },
  {
    question: '¿Qué tipo de soporte incluye?',
    answer: 'Todos los planes incluyen soporte por chat y email. Los planes Profesional y Enterprise incluyen soporte telefónico y un gerente de cuenta dedicado.',
  },
  {
    question: '¿Hay contrato a largo plazo?',
    answer: 'No, todos nuestros planes son mensuales sin penalización por cancelación. También ofrecemos descuentos por pago anual.',
  },
  {
    question: '¿Es seguro para los datos de los estudiantes?',
    answer: 'Absolutamente. Cumplimos con todas las normativas de protección de datos. Usamos encriptación de grado bancario y servidores certificados.',
  },
  {
    question: '¿Funciona sin internet?',
    answer: 'La app PWA permite ver información básica sin conexión. Las funciones de comunicación requieren internet para sincronizar.',
  },
];

const STATS = [
  { value: '150+', label: 'Colegios activos' },
  { value: '50,000+', label: 'Usuarios mensuales' },
  { value: '99.9%', label: 'Uptime garantizado' },
  { value: '4.9/5', label: 'Satisfacción' },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    contactName: '',
    email: '',
    phone: '',
    students: '',
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to an API
    setFormSubmitted(true);
    setTimeout(() => {
      setShowDemoForm(false);
      setFormSubmitted(false);
      setFormData({ schoolName: '', contactName: '', email: '', phone: '', students: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/iaschool-logo.png" alt="IA School" width={40} height={40} />
              <span className="text-xl font-bold text-[#1B4079]">IA School</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Button
                onClick={() => setShowDemoForm(true)}
                className="bg-[#1B4079] hover:bg-[#4D7C8A] text-white"
              >
                Solicitar Demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B4079] via-[#2a5298] to-[#4D7C8A] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Planes diseñados para cada colegio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 max-w-2xl mx-auto mb-8"
          >
            Elige el plan que mejor se adapte a las necesidades de tu institución.
            Sin contratos a largo plazo, cancela cuando quieras.
          </motion.p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={billingPeriod === 'monthly' ? 'text-white font-semibold' : 'text-white/60'}>
              Mensual
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-14 h-7 bg-white/20 rounded-full transition-colors"
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingPeriod === 'annual' ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={billingPeriod === 'annual' ? 'text-white font-semibold' : 'text-white/60'}>
              Anual <span className="text-green-300 text-sm">(20% desc.)</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan, index) => {
              const price = billingPeriod === 'annual' ? Math.round(plan.price * 0.8) : plan.price;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                    plan.highlighted ? 'ring-2 ring-[#1B4079] scale-105' : ''
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 left-0 right-0 bg-[#1B4079] text-white text-center py-2 text-sm font-semibold">
                      Más Popular
                    </div>
                  )}
                  <div className={`p-8 ${plan.highlighted ? 'pt-12' : ''}`}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-[#1B4079]">${price.toLocaleString()}</span>
                      <span className="text-gray-500"> {plan.currency}/{plan.period}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">{plan.students}</p>
                    <Button
                      onClick={() => setShowDemoForm(true)}
                      className={`w-full ${
                        plan.highlighted
                          ? 'bg-[#1B4079] hover:bg-[#4D7C8A] text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      Comenzar Ahora
                    </Button>
                    <ul className="mt-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-center gap-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          )}
                          <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-[#1B4079] mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Todo lo que necesita tu colegio</h2>
            <p className="text-xl text-gray-600">Funcionalidades diseñadas para simplificar la gestión escolar</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-white p-6 rounded-xl border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#1B4079]/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#1B4079]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#1B4079] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-xl text-white/80">Miles de colegios confían en IA School</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.name} className="bg-white p-6 rounded-xl">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role} - {testimonial.school}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h2>
            <p className="text-xl text-gray-600">Resolvemos tus dudas más comunes</p>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div key={index} className="border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#1B4079] to-[#4D7C8A] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para transformar tu colegio?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Agenda una demostración personalizada sin compromiso
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => setShowDemoForm(true)}
              size="lg"
              className="bg-white text-[#1B4079] hover:bg-gray-100"
            >
              <Play className="w-5 h-5 mr-2" />
              Ver Demo en Vivo
            </Button>
            <a href="tel:+525555555555">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Phone className="w-5 h-5 mr-2" />
                Llamar Ahora
              </Button>
            </a>
          </div>
          <p className="mt-6 text-white/70 text-sm">
            Sin tarjeta de crédito requerida • Prueba gratuita de 14 días
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/iaschool-logo.png" alt="IA School" width={32} height={32} />
              <span className="font-bold">IA School</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} IA School. Todos los derechos reservados.
            </div>
            <div className="flex items-center gap-4">
              <a href="mailto:info@iaschool.com" className="text-gray-400 hover:text-white">
                <Mail className="w-5 h-5" />
              </a>
              <a href="tel:+525555555555" className="text-gray-400 hover:text-white">
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Form Modal */}
      {showDemoForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Solicitar Demo</h3>
                <button
                  onClick={() => setShowDemoForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {formSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">¡Gracias!</h4>
                  <p className="text-gray-600">Nos pondremos en contacto contigo muy pronto.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Colegio *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent"
                      placeholder="Colegio Ejemplo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de Contacto *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent"
                        placeholder="correo@colegio.edu"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent"
                        placeholder="55 1234 5678"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de estudiantes
                    </label>
                    <select
                      value={formData.students}
                      onChange={(e) => setFormData({ ...formData, students: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="1-100">1 - 100</option>
                      <option value="101-200">101 - 200</option>
                      <option value="201-500">201 - 500</option>
                      <option value="501-1000">501 - 1,000</option>
                      <option value="1000+">Más de 1,000</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mensaje (opcional)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B4079] focus:border-transparent"
                      placeholder="Cuéntanos sobre tus necesidades..."
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#1B4079] hover:bg-[#4D7C8A] text-white"
                  >
                    Solicitar Demo Gratuita
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Al enviar este formulario, aceptas ser contactado por nuestro equipo.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
