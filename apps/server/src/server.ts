import "dotenv/config";
import Fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter, createContext } from "@acme/trpc";
import fastifyCors from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifyCron from "fastify-cron";
import {
  SCRAPE_NEWS_FEEDS_JOB_NAME,
  scrapeNewsFeedsJob,
} from "./jobs/scrape-news-feeds";

const fastify = Fastify({ logger: true });

const listeners = ["SIGINT", "SIGTERM"];
listeners.forEach((signal) => {
  process.on(signal, async () => {
    await fastify.close();
    process.exit(0);
  });
});

fastify.register(fastifyCors, {
  origin: (origin, cb) => {
    const allowedOrigins = ["http://localhost:3000"];
    if (origin && !allowedOrigins.includes(origin)) {
      cb(new Error("Not Allowed"), false);
      return;
    }
    cb(null, true);
  },
});
fastify.register(fastifyEnv, {
  confKey: "config",
  schema: {
    type: "object",
    required: ["PORT", "JWT_SECRET", "DATABASE_URL", "AUTHOR_ID"],
    properties: {
      PORT: {
        type: "string",
        default: 8080,
      },
      DATABASE_URL: {
        type: "string",
      },
      JWT_SECRET: {
        type: "string",
      },
    },
  },
  dotenv: true,
  data: process.env,
});
fastify.register(fastifyCookie);
fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET!,
  cookie: {
    cookieName: "access_token",
    signed: false,
  },
});
fastify.register(fastifyCron, {
  jobs: [scrapeNewsFeedsJob],
});

fastify.get("/scrape-news-feeds", async (res, reply) => {
  const job = fastify.cron.getJobByName(SCRAPE_NEWS_FEEDS_JOB_NAME);
  if (job) {
    job.fireOnTick();
    reply.send("Scraping started");
  } else {
    reply.code(404).send("Job not found!");
  }
});

fastify.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
});

const start = async () => {
  try {
    const port = process.env.PORT ? Number(process.env.PORT) : 8080;
    const host = "RENDER" in process.env ? `0.0.0.0` : `localhost`;

    await fastify.listen({ port, host });
    console.log("listening on port", port);
    fastify.cron.startAllJobs();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
