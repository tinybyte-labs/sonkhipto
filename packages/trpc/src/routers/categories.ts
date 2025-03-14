import type { Prisma } from "@acme/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../trpc";

export const categoriesRouter = router({
  getAllCategories: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const categories = await ctx.db.category.findMany({
        where: input.search
          ? {
              name: {
                search: input.search,
              },
            }
          : undefined,
      });
      return categories;
    }),
  followingCategories: protectedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.categoryFollow.findMany({
      where: {
        userId: ctx.session.id,
      },
    });
    return categories;
  }),
  followCategory: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found!",
        });
      }

      const exists = await ctx.db.categoryFollow.findUnique({
        where: {
          userId_categoryId: {
            categoryId: input,
            userId: ctx.session.id,
          },
        },
      });

      if (exists) {
        return exists;
      }

      try {
        const follow = await ctx.db.categoryFollow.create({
          data: {
            categoryId: input,
            userId: ctx.session.id,
          },
        });

        return follow;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }),
  unfollowCategory: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found!",
        });
      }

      const exists = await ctx.db.categoryFollow.findUnique({
        where: {
          userId_categoryId: {
            categoryId: input,
            userId: ctx.session.id,
          },
        },
      });

      if (!exists) {
        return exists;
      }

      try {
        const follow = await ctx.db.categoryFollow.delete({
          where: {
            userId_categoryId: {
              categoryId: input,
              userId: ctx.session.id,
            },
          },
        });

        return follow;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }),
  followCategories: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      const categories = await ctx.db.category.findMany({
        where: {
          slug: {
            in: input,
          },
        },
        select: {
          id: true,
        },
      });

      try {
        const follow = await ctx.db.categoryFollow.createMany({
          data: categories.map(
            ({ id }) =>
              ({
                categoryId: id,
                userId: ctx.session.id,
              }) satisfies Prisma.CategoryFollowCreateManyInput,
          ),
          skipDuplicates: true,
        });

        return follow;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }),
});
