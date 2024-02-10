import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { Prisma } from "@acme/db";

export const feedRouter = router({
  myFeed: protectedProcedure
    .input(
      z.object({
        language: z.enum(["bn", "en"]).optional(),
        countryCode: z.enum(["BN"]).optional(),
        limit: z.number().min(0).max(50).default(10),
        cursor: z.string().uuid().optional(),
        feedType: z.enum(["all-posts", "my-feed", "trending"]),
      }),
    )
    .query(async (opts) => {
      const last3Day = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      let where: Prisma.PostWhereInput = {};
      let orderBy: Prisma.PostOrderByWithRelationInput[] = [
        { createdAt: "desc" },
        { id: "asc" },
      ];
      switch (opts.input.feedType) {
        case "all-posts":
          where = {
            language: opts.input.language,
          };
          break;
        case "my-feed":
          where = {
            language: opts.input.language,
            createdAt: {
              gte: last3Day,
            },
            PostView: {
              none: {
                userId: opts.ctx.user.id,
              },
            },
          };
          break;
        case "trending":
          where = {
            language: opts.input.language,
            createdAt: {
              gte: last3Day,
            },
          };
          orderBy = [
            { PostReaction: { _count: "desc" } },
            { PostView: { _count: "desc" } },
            { PostBookmark: { _count: "desc" } },
            { createdAt: "desc" },
            { id: "asc" },
          ];

        default:
          break;
      }

      const posts = await opts.ctx.db.post.findMany({
        take: opts.input.limit,
        skip: opts.input.cursor ? 1 : 0,
        orderBy,
        cursor: opts.input.cursor ? { id: opts.input.cursor } : undefined,
        include: {
          author: { select: { name: true } },
          PostReaction: {
            where: { userId: opts.ctx.user.id },
          },
          PostBookmark: {
            where: { userId: opts.ctx.user.id },
          },
        },
        where: {
          ...where,
        },
      });

      let nextCursor = posts[opts.input.limit - 1]?.id;

      return {
        nextCursor,
        posts,
      };
    }),
});
