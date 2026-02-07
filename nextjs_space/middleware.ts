// CSP updated 2026-02-07 - Cloudflare Insights allowed
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limiter";

// Routes that require specific roles
const ADMIN_ROUTES = [
  "/announcements/new",
  "/invitations",
  "/super-admin",
  "/import",
  "/crm",
  "/admin/referrals",
];

const ADMIN_PROFESOR_ROUTES = [
  "/discipline",
  "/nurse",
  "/academic/report-cards",
];

// Rate limit mapping for API routes
const API_RATE_LIMITS: Record<string, string> = {
  '/api/auth/signin': 'auth-login',
  '/api/auth/callback': 'auth-login',
  '/api/signup': 'auth-signup',
  '/api/auth/forgot-password': 'auth-forgot',
  '/api/chatbot': 'chatbot',
  '/api/tips/generate': 'tips-generate',
  '/api/crm/sentiment': 'sentiment',
  '/api/reports/generate': 'pdf-generate',
  '/api/upload': 'upload',
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const response = NextResponse.next();

    // ========================================
    // RATE LIMITING (para rutas API críticas)
    // ========================================
    if (path.startsWith('/api/')) {
      // Determinar tipo de rate limit
      let limitType = 'api-general';
      for (const [route, type] of Object.entries(API_RATE_LIMITS)) {
        if (path.startsWith(route)) {
          limitType = type;
          break;
        }
      }
      
      // Obtener identificador del cliente
      const clientId = getClientIdentifier(req, token?.id as string);
      const rateCheck = checkRateLimit(clientId, limitType);
      
      if (!rateCheck.allowed) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Too many requests',
            retryAfter: rateCheck.retryAfter 
          }),
          { 
            status: 429, 
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(rateCheck.retryAfter || 60),
            }
          }
        );
      }
      
      // Agregar header de rate limit remaining
      if (rateCheck.remaining !== undefined) {
        response.headers.set('X-RateLimit-Remaining', String(rateCheck.remaining));
      }
    }

    // ========================================
    // SECURITY HEADERS
    // ========================================
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(self), microphone=(), geolocation=(), interest-cohort=()"
    );
    
    // Content Security Policy
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apps.abacus.ai https://*.abacus.ai https://static.cloudflareinsights.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https: http:",
        "connect-src 'self' https://*.abacus.ai https://apps.abacus.ai wss://*.abacus.ai https://*.amazonaws.com https://*.cloudflareinsights.com",
        "frame-src 'self' https://*.abacus.ai https://apps.abacus.ai",
        "frame-ancestors 'self' https://*.abacus.ai https://apps.abacus.ai",
        "media-src 'self' https: blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ")
    );
    
    // HSTS - Solo en producción
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
      );
    }

    // ========================================
    // VERIFICAR USUARIO ACTIVO (para rutas protegidas)
    // ========================================
    if (token && token.isActive === false) {
      // Usuario desactivado - cerrar sesión
      return NextResponse.redirect(new URL("/login?error=account_disabled", req.url));
    }

    // ========================================
    // VERIFICAR CUENTA BLOQUEADA (por intentos fallidos)
    // ========================================
    if (token && token.lockedUntil) {
      const lockedUntil = new Date(token.lockedUntil as string);
      if (lockedUntil > new Date()) {
        return NextResponse.redirect(new URL("/login?error=account_locked", req.url));
      }
    }

    // Redirect to dashboard if already logged in and trying to access login
    if (token && (path === "/login" || path === "/")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Admin only routes
    if (ADMIN_ROUTES.some(route => path.startsWith(route))) {
      if (!["ADMIN", "SUPER_ADMIN"].includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Admin or Professor routes
    if (ADMIN_PROFESOR_ROUTES.some(route => path.startsWith(route))) {
      if (!["ADMIN", "SUPER_ADMIN", "PROFESOR"].includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Super Admin only routes
    if (path.startsWith("/super-admin") && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public routes
        const publicRoutes = ["/", "/login", "/enroll", "/pricing"];
        if (publicRoutes.some(route => path === route || path.startsWith("/api/auth"))) {
          return true;
        }

        // Protected routes need token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/announcements/:path*",
    "/messages/:path*",
    "/tasks/:path*",
    "/calendar/:path*",
    "/payments/:path*",
    "/academic/:path*",
    "/attendance/:path*",
    "/directory/:path*",
    "/invitations/:path*",
    "/super-admin/:path*",
    "/import/:path*",
    "/discipline/:path*",
    "/nurse/:path*",
    "/appointments/:path*",
    "/permits/:path*",
    "/polls/:path*",
    "/surveys/:path*",
    "/vocal/:path*",
    "/store/:path*",
    "/gallery/:path*",
    "/crm/:path*",
    "/chatbot/:path*",
    "/schedules/:path*",
    "/documents/:path*",
    "/referrals/:path*",
    "/admin/:path*",
  ],
};
