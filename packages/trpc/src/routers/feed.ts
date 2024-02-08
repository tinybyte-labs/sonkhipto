import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const feedRouter = router({
  myFeed: protectedProcedure
    .input(
      z.object({
        language: z.enum(["bn", "en"]).optional(),
        countryCode: z.enum(["BN"]).optional(),
        limit: z.number().min(0).max(50).default(10),
        cursor: z.string().uuid().optional(),
      })
    )
    .query(async (opts) => {
      const last3Day = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const posts = await opts.ctx.db.post.findMany({
        take: opts.input.limit,
        skip: opts.input.cursor ? 1 : 0,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        cursor: opts.input.cursor ? { id: opts.input.cursor } : undefined,
        include: { author: { select: { name: true } } },
        where: {
          language: opts.input.language,
          countryCode: opts.input.countryCode,
          createdAt: {
            gte: last3Day,
          },
          PostImpression: {
            none: {
              userId: opts.ctx.user.id,
            },
          },
        },
      });

      let nextCursor = posts[opts.input.limit - 1]?.id;

      return {
        nextCursor,
        posts,
      };
    }),
});
