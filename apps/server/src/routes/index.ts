import { type FastifyInstance } from "fastify";
import { scrapeLinks } from "./scrape-link";
import { scrapeArtickle } from "./scrape-article";

export const routes = async (fastify: FastifyInstance) => {
  fastify.get("/", (req, reply) => reply.send("OK"));
  fastify.post("/scrape-links", scrapeLinks);
  fastify.post("/scrape-article", scrapeArtickle);
};
