import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect to dashboard if already logged in and trying to access login
    if (token && (path === "/login" || path === "/")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Admin only routes
    if (path === "/announcements/new" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public routes
        if (path === "/" || path === "/login") {
          return true;
        }

        // Protected routes need token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/announcements/:path*"],
};
