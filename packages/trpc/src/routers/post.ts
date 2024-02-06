import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const postRouter = router({
  findMany: publicProcedure
    .input(
      z.object({
        language: z.enum(["bn", "en"]).optional(),
        countryCode: z.enum(["BN"]).optional(),
        limit: z.number().min(0).default(10),
        cursor: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input: { cursor, limit, countryCode, language } }) => {
      const posts = await ctx.db.post.findMany({
        where: {
          language,
          countryCode,
        },
        take: limit + 1,
        orderBy: { createdAt: "desc" },
        cursor: cursor ? { id: cursor } : undefined,
        include: { author: { select: { name: true } } },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      return {
        nextCursor,
        posts,
      };
    }),
});
