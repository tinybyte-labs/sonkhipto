import { apiRouter } from "./routers/api";
import { authRouter } from "./routers/auth";
import { feedRouter } from "./routers/feed";
import { postRouter } from "./routers/post";
import { router } from "./trpc";

export { createTRPCContext } from "./context";

export const appRouter = router({
  api: apiRouter,
  auth: authRouter,
  post: postRouter,
  feed: feedRouter,
});

export type AppRouter = typeof appRouter;
