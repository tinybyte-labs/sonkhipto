import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const apiRouter = router({
  version: publicProcedure.query(() => {
    return { version: "0.42.0" };
  }),
  hello: publicProcedure
    .input(z.object({ username: z.string().nullish() }).nullish())
    .query(async ({ input }) => {
      return `Hello, ${input?.username ?? "world"}!`;
    }),
});
