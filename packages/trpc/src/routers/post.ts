import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const postRouter = router({
  findMany: publicProcedure
    .input(
      z.object({
        language: z.enum(["bn", "en"]).optional(),
        countryCode: z.enum(["BN"]).optional(),
        limit: z.number().min(0).max(50).default(10),
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
  addBookmark: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({ where: { id: input.id } });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found!" });
      }

      const alreadyBookmarked = await ctx.db.postBookmark.findUnique({
        where: { userId_postId: { userId: ctx.user.id, postId: post.id } },
      });
      if (alreadyBookmarked) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "The post is already bookmarked by the user",
        });
      }

      const bookmark = await ctx.db.postBookmark.create({
        data: { userId: ctx.user.id, postId: post.id },
      });
      return bookmark;
    }),
  removeBookmark: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({ where: { id: input.id } });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found!" });
      }

      const alreadyBookmarked = await ctx.db.postBookmark.findUnique({
        where: { userId_postId: { userId: ctx.user.id, postId: post.id } },
      });
      if (!alreadyBookmarked) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No bookmark found for the post by the user",
        });
      }

      const deletedBookmark = await ctx.db.postBookmark.delete({
        where: { userId_postId: { userId: ctx.user.id, postId: post.id } },
      });
      return deletedBookmark;
    }),
  getBookmarks: protectedProcedure.query(async ({ ctx }) => {
    const bookmarks = await ctx.db.postBookmark.findMany({
      where: { userId: ctx.user.id },
    });
    return bookmarks;
  }),
  getBookmarksWithPost: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(0).max(50).default(10),
        cursor: z
          .object({ userId: z.string().uuid(), postId: z.string().uuid() })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const bookmarks = await ctx.db.postBookmark.findMany({
        where: { userId: ctx.user.id },
        include: { post: { include: { author: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
        cursor: input.cursor ? { userId_postId: input.cursor } : undefined,
        take: input.limit + 1,
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (bookmarks.length > input.limit) {
        const nextItem = bookmarks.pop();
        if (nextItem) {
          nextCursor = {
            postId: nextItem.postId,
            userId: nextItem.userId,
          };
        }
      }

      return {
        nextCursor,
        bookmarks,
      };
    }),
});
