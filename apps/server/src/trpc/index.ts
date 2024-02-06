import { apiRouter } from "./routers/api";
import { postRouter } from "./routers/post";
import { router } from "./trpc";

export const appRouter = router({
  api: apiRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;
