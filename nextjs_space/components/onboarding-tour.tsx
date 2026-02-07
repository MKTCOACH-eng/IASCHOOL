"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, CheckCircle, GraduationCap, MessageSquare, Calendar, Bell, FileText, Users, Store, Camera, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface TourStep {
  target: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  position: "top" | "bottom" | "left" | "right" | "center";
}

const TOUR_STEPS: Record<string, TourStep[]> = {
  ADMIN: [
    {
      target: "welcome",
      title: "¡Bienvenido a IA School!",
      content: "Te daremos un recorrido rápido por las funciones principales de tu plataforma escolar.",
      icon: <GraduationCap className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "dashboard",
      title: "Panel de Control",
      content: "Aquí verás un resumen de toda la actividad escolar: asistencia, pagos pendientes, anuncios recientes y más.",
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "directory",
      title: "Directorio",
      content: "Gestiona alumnos, padres de familia y personal. Puedes importar datos masivamente o agregar uno por uno.",
      icon: <Users className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "announcements",
      title: "Anuncios",
      content: "Publica comunicados para toda la comunidad escolar. Los anuncios urgentes envían notificación por email automáticamente.",
      icon: <Bell className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "messages",
      title: "Mensajería",
      content: "Comunícate directamente con padres y maestros. Crea chats grupales por salón.",
      icon: <MessageSquare className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "payments",
      title: "Pagos y Cobranza",
      content: "Registra cargos, controla pagos y envía recordatorios automáticos a padres con adeudos.",
      icon: <FileText className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "invitations",
      title: "Invitaciones",
      content: "Invita a padres y maestros a unirse a la plataforma enviando un enlace de registro.",
      icon: <Users className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "done",
      title: "¡Listo para empezar!",
      content: "Explora el menú lateral para descubrir todas las funciones. Si necesitas ayuda, el chatbot de IA está disponible 24/7.",
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      position: "center"
    }
  ],
  PADRE: [
    {
      target: "welcome",
      title: "¡Bienvenido a IA School!",
      content: "Esta plataforma te permitirá estar al día con la educación de tu hijo(a).",
      icon: <GraduationCap className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "dashboard",
      title: "Tu Panel",
      content: "Aquí verás un resumen rápido: tareas pendientes, próximos eventos, pagos y anuncios importantes.",
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "academic",
      title: "Calificaciones",
      content: "Consulta las calificaciones de tu hijo(a) y descarga boletas cuando estén disponibles.",
      icon: <FileText className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "tasks",
      title: "Tareas",
      content: "Revisa las tareas asignadas, fechas de entrega y el estatus de cada una.",
      icon: <CheckCircle className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "messages",
      title: "Mensajes",
      content: "Comunícate directamente con maestros y administración. También puedes participar en el chat de padres del grupo.",
      icon: <MessageSquare className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "calendar",
      title: "Calendario",
      content: "Consulta eventos escolares, días festivos, juntas y actividades programadas.",
      icon: <Calendar className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "payments",
      title: "Pagos",
      content: "Revisa tu estado de cuenta, cargos pendientes y confirma tus pagos.",
      icon: <FileText className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "done",
      title: "¡Estás listo!",
      content: "Si tienes dudas, usa el chatbot de IA disponible 24/7 o envía un mensaje a la administración.",
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      position: "center"
    }
  ],
  PROFESOR: [
    {
      target: "welcome",
      title: "¡Bienvenido, Profesor!",
      content: "IA School te ayudará a gestionar tus grupos, calificaciones y comunicación con padres.",
      icon: <GraduationCap className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "academic",
      title: "Gestión Académica",
      content: "Registra calificaciones, genera boletas y sube documentos académicos para tus grupos.",
      icon: <FileText className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "tasks",
      title: "Tareas",
      content: "Crea tareas, revisa entregas y califica el trabajo de tus alumnos.",
      icon: <CheckCircle className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "attendance",
      title: "Asistencia",
      content: "Registra la asistencia diaria de tus grupos de forma rápida y sencilla.",
      icon: <Users className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "messages",
      title: "Mensajería",
      content: "Comunícate con padres individualmente o en grupo. Comparte archivos y resuelve dudas.",
      icon: <MessageSquare className="w-8 h-8 text-primary" />,
      position: "center"
    },
    {
      target: "done",
      title: "¡A trabajar!",
      content: "El chatbot de IA puede ayudarte a generar contenido educativo y responder preguntas.",
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      position: "center"
    }
  ]
};

export function OnboardingTour() {
  const { data: session } = useSession() || {};
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const userRole = (session?.user as any)?.role || "PADRE";
  const steps = TOUR_STEPS[userRole] || TOUR_STEPS.PADRE;
  
  useEffect(() => {
    // Check if user needs onboarding
    const checkOnboarding = async () => {
      if (!session?.user) return;
      
      try {
        const res = await fetch("/api/user/onboarding");
        const data = await res.json();
        if (!data.onboardingCompleted) {
          setShowTour(true);
        }
      } catch (error) {
        console.error("Error checking onboarding:", error);
      }
    };
    
    checkOnboarding();
  }, [session]);
  
  const completeTour = async () => {
    setLoading(true);
    try {
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true })
      });
      setShowTour(false);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
    setLoading(false);
  };
  
  const skipTour = async () => {
    await completeTour();
  };
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  if (!showTour) return null;
  
  const step = steps[currentStep];
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Progress bar */}
          <div className="h-1 bg-gray-200">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm text-gray-500">
                Paso {currentStep + 1} de {steps.length}
              </span>
              <button
                onClick={skipTour}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center py-6">
              <motion.div
                key={currentStep}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center"
              >
                {step.icon}
              </motion.div>
              
              <motion.h3
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold text-gray-900 mb-2"
              >
                {step.title}
              </motion.h3>
              
              <motion.p
                key={`content-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600"
              >
                {step.content}
              </motion.p>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="px-6 pb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            
            <Button
              onClick={nextStep}
              disabled={loading}
              className="gap-1 text-white"
            >
              {currentStep === steps.length - 1 ? (
                loading ? "Guardando..." : "Comenzar"
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
