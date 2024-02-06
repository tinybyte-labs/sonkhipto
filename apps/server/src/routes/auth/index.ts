import { db } from "@acme/db";
import { FastifyPluginCallback } from "fastify";

export const authRoutes: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.post("/signup", async (req, reply) => {});
  fastify.post("/anonymous-signin", async (req, reply) => {
    const user = await db.user.create({ data: { isAnonymous: true } });
    const accessToken = fastify.jwt.sign({
      id: user.id,
      name: user.name,
      role: user.role,
    });
    reply.send({ accessToken, user });
  });
  fastify.post("/signin", async (req, reply) => {});
  fastify.get(
    "/current-user",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      const user = await db.user.findUnique({ where: { id: req.user.id } });
      reply.send(user);
    }
  );
  done();
};
