import fastify from "fastify";

declare module "fastify" {
  interface FastifyInstance
    extends FastifyJwtNamespace<{ namespace: "security" }> {
    config: {
      DATABASE_URL: string;
      JWT_SECRET: string;
      PORT: string;
    };
    authenticate: any;
  }
  interface FastifyRequest {
    jwt: JWT;
  }
}
