import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import prisma from "./prisma"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        
        // Fetch fresh credits and unlocked profiles from database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { credits: true, unlockedProfiles: true }
        });
        
        if (dbUser) {
          session.user.credits = dbUser.credits;
          session.user.unlockedProfileIds = dbUser.unlockedProfiles.map(p => p.candidateId);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login', // We'll build a custom login page
  }
}
