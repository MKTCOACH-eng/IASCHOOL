import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "IA School - Plataforma de Gestión Escolar Inteligente",
    template: "%s | IA School"
  },
  description: "Sistema integral de gestión escolar con comunicación en tiempo real, control de asistencia, calificaciones, pagos, enfermería y más. La solución completa para colegios modernos.",
  keywords: [
    "gestión escolar",
    "software escolar",
    "comunicación padres maestros",
    "control de asistencia",
    "calificaciones en línea",
    "plataforma educativa",
    "administración escolar",
    "app para colegios",
    "sistema escolar",
    "educación digital"
  ],
  authors: [{ name: "IA School" }],
  creator: "IA School",
  publisher: "IA School",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/iaschool-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    siteName: "IA School",
    title: "IA School - Plataforma de Gestión Escolar Inteligente",
    description: "Sistema integral de gestión escolar con comunicación en tiempo real, control de asistencia, calificaciones, pagos y más.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IA School - Gestión Escolar Inteligente",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IA School - Plataforma de Gestión Escolar Inteligente",
    description: "Sistema integral de gestión escolar con comunicación en tiempo real.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IA School",
  },
  category: "education",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1B4079" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="apple-touch-icon" href="/iaschool-logo.png" />
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className={`${inter.className} bg-white antialiased`} suppressHydrationWarning>
        <Providers>
          <ServiceWorkerRegister />
          {children}
          <PWAInstallPrompt />
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
