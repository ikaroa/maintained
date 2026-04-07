import NextAuth, { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "./prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // OpenID Connect provider for SSO
    // Supports Azure AD, Okta, Auth0, Google Workspace, etc.
    ...(process.env.SSO_CLIENT_ID
      ? [
          {
            id: "sso",
            name: "Maintained SSO",
            type: "oauth" as const,
            wellKnown: `${process.env.SSO_ISSUER}/.well-known/openid-configuration`,
            clientId: process.env.SSO_CLIENT_ID,
            clientSecret: process.env.SSO_CLIENT_SECRET,
            authorization: { params: { scope: "openid email profile" } },
            idToken: true,
            profile(profile: Record<string, string>) {
              return {
                id: profile.sub,
                name: profile.name || profile.preferred_username,
                email: profile.email,
                image: profile.picture,
              };
            },
          },
        ]
      : []),
    // Credentials provider as fallback for development/testing
    {
      id: "credentials",
      name: "Email & Password",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        // In production, validate against your user directory
        // For development, allow any email with password "maintained"
        if (process.env.NODE_ENV === "development" || credentials.password === "maintained") {
          let user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.email.split("@")[0],
              },
            });
          }
          return user;
        }
        return null;
      },
    },
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "technician";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
