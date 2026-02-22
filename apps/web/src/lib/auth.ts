import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/db';
import type { NextAuthConfig } from 'next-auth';

// ---------------------------------------------------------------------------
// NextAuth v5 configuration
// ---------------------------------------------------------------------------

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'database',
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    // Expose user id in session so API routes can read it without a DB round-trip
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },

  events: {
    // Auto-provision a Free subscription the first time any user signs in
    async signIn({ user, isNewUser }) {
      if (!isNewUser) return;
      if (!user.id) return;

      const existing = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });
      if (existing) return;

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setDate(periodEnd.getDate() + 30);

      await prisma.subscription.create({
        data: {
          userId:            user.id,
          planId:            'free',
          status:            'active',
          currentPeriodStart: now,
          currentPeriodEnd:  periodEnd,
        },
      });
    },
  },
};

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth(authConfig);
