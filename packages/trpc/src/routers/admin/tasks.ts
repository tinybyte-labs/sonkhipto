import { adminProcedure, router } from "../../trpc";
import { qstashClient } from "../../upstash";
import { BASE_URL } from "@acme/core/constants";

export const tasksRouter = router({
  scrapeAllPublisher: adminProcedure.mutation(async () => {
    const result = await qstashClient.publishJSON({
      url: `${BASE_URL}/api/tasks/scrape-all-publishers`,
    });
    return result;
  }),
});
