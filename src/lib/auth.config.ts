import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.firstname = (user as any).firstname;
        token.lastname = (user as any).lastname;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.firstname = token.firstname as string;
        session.user.lastname = token.lastname as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Les providers seront ajoutés dans auth.ts
} satisfies NextAuthConfig;
