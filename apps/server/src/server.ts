import "dotenv/config";
import Fastify from "fastify";
import { routes } from "./routes";

const fastify = Fastify({ logger: process.env.NODE_ENV === "development" });

// const listeners = ["SIGINT", "SIGTERM"];
// listeners.forEach((signal) => {
//   process.on(signal, async () => {
//     await fastify.close();
//     process.exit(0);
//   });
// });

// fastify.register(fastifyCors, {
//   origin: (origin, cb) => {
//     const allowedOrigins = [
//       ...(process.env.NODE_ENV === "development"
//         ? ["http://localhost:3000"]
//         : []),
//       "https://sonkhipto.com",
//       "https://www.sonkhipto.com",
//     ];
//     if (origin && !allowedOrigins.includes(origin)) {
//       cb(new Error("Not Allowed"), false);
//       return;
//     }
//     cb(null, true);
//   },
// });
// fastify.register(fastifyEnv, {
//   confKey: "config",
//   schema: {
//     type: "object",
//     required: ["PORT", "DATABASE_URL"],
//     properties: {
//       PORT: {
//         type: "string",
//         default: 8080,
//       },
//       DATABASE_URL: {
//         type: "string",
//       },
//     },
//   },
//   dotenv: true,
//   data: process.env,
// });
// fastify.register(fastifyCookie);
// fastify.register(fastifyJwt, {
//     secret: process.env.JWT_SECRET!,
//     cookie: {
//         cookieName: "access_token",
//         signed: false,
//     },
// });
// fastify.register(fastifyCron, {
//     jobs: [scrapeNewsFeedsJob],
// });

// fastify.get("/scrape-news-feeds", async (res, reply) => {
//     //
// });

fastify.register(routes);

const start = async () => {
  try {
    const port = process.env.PORT ? Number(process.env.PORT) : 8080;
    const host =
      process.env.NODE_ENV === "production" ? "127.0.0.1" : "localhost";
    await fastify.listen({ port, host });
    console.log(`URL: http://${host}:${port}`);
    // fastify.cron.startAllJobs();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
start();
