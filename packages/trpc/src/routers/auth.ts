import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { signJwt } from "@acme/auth";

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
  currentUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session?.id },
    });
    return user;
  }),
});
