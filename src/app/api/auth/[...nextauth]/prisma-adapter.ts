/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Minimal Prisma adapter for NextAuth.js
 * Compatible with our schema.
 */

import type { Adapter } from "next-auth/adapters";
import type { PrismaClient } from "@/generated/prisma/client";

export function PrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    async createUser(data: any) {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          image: data.image,
          emailVerified: data.emailVerified,
        },
      });
      return user as any;
    },

    async getUser(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });
      return user as any;
    },

    async getUserByEmail(email: string) {
      const user = await prisma.user.findUnique({ where: { email } });
      return user as any;
    },

    async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { user: true },
      });
      return (account?.user as any) ?? null;
    },

    async updateUser(data: any) {
      const user = await prisma.user.update({
        where: { id: data.id },
        data: {
          name: data.name,
          email: data.email ?? undefined,
          image: data.image,
          emailVerified: data.emailVerified,
        },
      });
      return user as any;
    },

    async deleteUser(userId: string) {
      await prisma.user.delete({ where: { id: userId } });
    },

    async linkAccount(data: any) {
      await prisma.account.create({ data });
    },

    async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      await prisma.account.delete({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      });
    },

    async createSession(data: any) {
      const session = await prisma.session.create({ data });
      return session as any;
    },

    async getSessionAndUser(sessionToken: string) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!session) return null;
      return {
        session: session as any,
        user: session.user as any,
      };
    },

    async updateSession(data: any) {
      const session = await prisma.session.update({
        where: { sessionToken: data.sessionToken },
        data,
      });
      return session as any;
    },

    async deleteSession(sessionToken: string) {
      await prisma.session.delete({ where: { sessionToken } });
    },

    async createVerificationToken(data: any) {
      return prisma.verificationToken.create({ data });
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      try {
        return await prisma.verificationToken.delete({
          where: { identifier_token: { identifier, token } },
        });
      } catch {
        return null;
      }
    },
  };
}
