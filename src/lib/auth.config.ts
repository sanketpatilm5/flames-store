import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "CUSTOMER" | "ADMIN";
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: "CUSTOMER" | "ADMIN";
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "CUSTOMER" | "ADMIN";
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "ADMIN";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
