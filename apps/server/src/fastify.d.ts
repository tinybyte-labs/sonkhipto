import fastify from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      MONGODB_URI: string;
      PORT: string;
    };
  }
}
