import { db } from "../_lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const dbUser = await db.user.findUnique({
        where: { email: user.email as string },
        select: { isAdmin: true },
      });

      if (dbUser) {
        session.user = { 
          ...session.user, 
          id: user.id, 
          isAdmin: dbUser.isAdmin,
        };
      }

      return session;
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
};
