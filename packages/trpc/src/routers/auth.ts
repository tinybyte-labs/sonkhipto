import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { signJwt } from "@acme/auth";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { User } from "@acme/db";

export const authRouter = router({
  signInAnonymously: publicProcedure.mutation(async ({ ctx }) => {
    if (ctx.session) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are already signned in!",
      });
    }
    const user = await ctx.db.user.create({ data: { isAnonymous: true } });
    const accessToken = await signJwt(user);
    return { user, accessToken };
  }),
  signInWithGoogle: publicProcedure
    .input(z.object({ idToken: z.string() }))
    .mutation(async (opts) => {
      const client = new OAuth2Client();
      const loginTicket = await client.verifyIdToken({
        idToken: opts.input.idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = loginTicket.getPayload();
      if (!payload) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid idToken",
        });
      }

      const accountExists = await opts.ctx.db.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "google",
            providerAccountId: payload.sub,
          },
        },
      });

      let isNewUser = false;
      let user: User | null = null;

      if (accountExists) {
        user = await opts.ctx.db.user.findUnique({
          where: { id: accountExists.userId },
        });
      } else {
        if (payload.email) {
          user = await opts.ctx.db.user.findUnique({
            where: { email: payload.email },
          });
        }

        if (!user) {
          isNewUser = true;
          user = await opts.ctx.db.user.create({
            data: {
              email: payload.email ?? null,
              emailVerified: payload.email_verified ? new Date() : null,
              name: payload.given_name
                ? `${payload.given_name} ${payload.family_name}`
                : null,
              image: payload.picture ?? null,
            },
          });
        }

        await opts.ctx.db.account.create({
          data: {
            provider: "google",
            providerAccountId: payload.sub,
            userId: user.id,
            type: "oauth",
            expires_at: payload.exp,
            id_token: opts.input.idToken,
            scope: payload.profile,
            token_type: "Bearer",
          },
        });
      }

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No User" });
      }

      const accessToken = await signJwt(user);

      return { isNewUser, user, accessToken };
    }),
  currentUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session?.id },
    });
    return user;
  }),
  getCurrentUser: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session?.id },
    });
    return user;
  }),
});
