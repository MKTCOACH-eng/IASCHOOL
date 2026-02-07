import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// Configuración de bloqueo de cuenta
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { school: true },
        });

        if (!user) {
          return null;
        }

        // Verificar si la cuenta está activa
        if (!user.isActive) {
          throw new Error("account_disabled");
        }

        // Verificar si la cuenta está bloqueada
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
          throw new Error(`account_locked:${minutesLeft}`);
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          // Incrementar contador de intentos fallidos
          const newFailedAttempts = user.failedLoginAttempts + 1;
          const updateData: any = { failedLoginAttempts: newFailedAttempts };
          
          // Bloquear cuenta si excede intentos máximos
          if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
            updateData.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60000);
          }
          
          await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });
          
          if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
            throw new Error(`account_locked:${LOCK_DURATION_MINUTES}`);
          }
          
          return null;
        }

        // Login exitoso - resetear contadores y actualizar lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          adminSubRoles: user.adminSubRoles || [],
          schoolId: user.schoolId,
          schoolName: user.school?.name,
          schoolLogo: user.school?.logoUrl,
          schoolColor: user.school?.primaryColor,
          isActive: user.isActive,
          lockedUntil: user.lockedUntil?.toISOString() || null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.adminSubRoles = (user as any).adminSubRoles;
        token.schoolId = (user as any).schoolId;
        token.schoolName = (user as any).schoolName;
        token.schoolLogo = (user as any).schoolLogo;
        token.schoolColor = (user as any).schoolColor;
        token.isActive = (user as any).isActive;
        token.lockedUntil = (user as any).lockedUntil;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).adminSubRoles = token.adminSubRoles;
        (session.user as any).schoolId = token.schoolId;
        (session.user as any).schoolName = token.schoolName;
        (session.user as any).schoolLogo = token.schoolLogo;
        (session.user as any).schoolColor = token.schoolColor;
        (session.user as any).isActive = token.isActive;
        (session.user as any).lockedUntil = token.lockedUntil;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
