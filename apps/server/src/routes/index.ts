import { type FastifyInstance } from "fastify"
import { scrapeArtickle, scrapeLinks } from "./api"

export const scrapeRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/scrape-links', scrapeLinks)
    fastify.post('/scrape-article', scrapeArtickle)
}