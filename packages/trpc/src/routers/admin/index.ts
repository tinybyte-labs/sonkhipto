import { router } from "../../trpc";
import { tasksRouter } from "./tasks";

export const adminRouter = router({
  tasks: tasksRouter,
});
