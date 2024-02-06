import "dotenv/config";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { appRouter } from "./trpc";
import { createContext } from "./trpc/context";
import cors from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import { envOptions } from "./constants/env-options";

const server = fastify({ logger: true });

(async () => {
  server.register(fastifyEnv, envOptions);
  await server.after();

  server.register(cors, {
    origin: (origin, cb) => {
      const allowedOrigins = ["http://localhost:3000"];
      if (origin && !allowedOrigins.includes(origin)) {
        cb(new Error("Not Allowed"), false);
        return;
      }
      cb(null, true);
    },
  });

  server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: { router: appRouter, createContext },
  });

  server.get("/", async () => {
    return { hello: "Hello, World!" };
  });

  try {
    const port = Number(server.config.PORT);
    await server.listen({ port: port });
    console.log("listening on port", port);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
