import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Routes that require specific roles
const ADMIN_ROUTES = [
  "/announcements/new",
  "/invitations",
  "/super-admin",
  "/import",
  "/crm",
];

const ADMIN_PROFESOR_ROUTES = [
  "/discipline",
  "/nurse",
  "/academic/report-cards",
];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const response = NextResponse.next();

    // Security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    );

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
  ],
};
