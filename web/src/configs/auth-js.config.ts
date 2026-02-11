import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user?.email) {
        token.email = user.email;
        token.provider = account.provider;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email!;
        session.user.provider = token.provider;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
