import { adminRouter } from "./routers/admin";
import { apiRouter } from "./routers/api";
import { authRouter } from "./routers/auth";
import { categoriesRouter } from "./routers/categories";
import { feedRouter } from "./routers/feed";
import { postRouter } from "./routers/post";
import { router } from "./trpc";

export { createTRPCContext } from "./context";

export const appRouter = router({
  api: apiRouter,
  auth: authRouter,
  post: postRouter,
  feed: feedRouter,
  categories: categoriesRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
