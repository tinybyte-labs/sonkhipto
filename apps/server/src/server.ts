import "dotenv/config";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import { appRouter, createContext } from "@acme/trpc";
import cors, { type FastifyCorsOptions } from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import fastifyJwt, { FastifyJWTOptions } from "@fastify/jwt";
import fastifyCookie, { type FastifyCookieOptions } from "@fastify/cookie";
import { envOptions } from "./constants/env-options";
import { authRoutes } from "./routes/auth";

const fastify = Fastify({ logger: true });

const listeners = ["SIGINT", "SIGTERM"];
listeners.forEach((signal) => {
  process.on(signal, async () => {
    await fastify.close();
    process.exit(0);
  });
});

const corsOptions: FastifyCorsOptions = {
  origin: (origin, cb) => {
    const allowedOrigins = ["http://localhost:3000"];
    if (origin && !allowedOrigins.includes(origin)) {
      cb(new Error("Not Allowed"), false);
      return;
    }
    cb(null, true);
  },
};
const cookieOptions: FastifyCookieOptions = {};
const jwtOptions: FastifyJWTOptions = {
  secret: process.env.JWT_SECRET!,
  cookie: {
    cookieName: "access_token",
    signed: false,
  },
};

fastify.register(fastifyEnv, envOptions);
fastify.register(cors, corsOptions);
fastify.register(fastifyCookie, cookieOptions);
fastify.register(fastifyJwt, jwtOptions);

fastify.decorate(
  "authenticate",
  async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  }
);

fastify.register(authRoutes);

fastify.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
});

const start = async () => {
  try {
    const port = process.env.PORT ? Number(process.env.PORT) : 8080;
    await fastify.listen({ port });
    console.log("listening on port", port);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
