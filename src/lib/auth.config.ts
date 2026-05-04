import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.firstname = user.firstname;
        token.lastname = user.lastname;
        token.role = user.role;
        token.onboardingCompleted = user.onboardingCompleted;
      }
      
      if (trigger === "update" && session) {
        if (session.onboardingCompleted !== undefined) {
          token.onboardingCompleted = session.onboardingCompleted;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.firstname = token.firstname;
        session.user.lastname = token.lastname;
        session.user.role = token.role;
        session.user.onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },
  },
  providers: [], // Les providers seront ajoutés dans auth.ts
} satisfies NextAuthConfig;
