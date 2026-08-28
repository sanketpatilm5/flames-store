import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { mergeGuestCartIntoUser } from "@/lib/cart";
import { loginSchema } from "@/lib/validations";

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

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
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
  events: {
    async signIn({ user }) {
      if (user.id) await mergeGuestCartIntoUser(user.id);
    },
  },
});
