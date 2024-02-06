import { apiRouter } from "./routers/api";
import { feedRouter } from "./routers/feed";
import { router } from "./trpc";

export const appRouter = router({
  api: apiRouter,
  feed: feedRouter,
});

export type AppRouter = typeof appRouter;
