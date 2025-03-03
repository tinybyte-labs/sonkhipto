
import { z } from "zod";
import type { FastifyReply, FastifyRequest } from "fastify";
import { publishers } from "../../publishers/publishers";
import { getBrowser } from "../../lib/browser";

export const maxDuration = 300;

export const scrapeLinks = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = await req.body;
    const { publisherId } = await z
        .object({
            publisherId: z.string(),
        })
        .parseAsync(body);


    const publisher = publishers.find(
        (publisher) => publisher.id === publisherId,
    );


    if (!publisher) {
        return reply.code(400).send("Publisher not found!");
    }

    try {
        const browser = await getBrowser();
        console.log("Browser launched");

        const links = await publisher.getLatestArticleLinks(browser);

        console.log({ linkCount: links.length });

        await browser.close();
        console.log("Browser closed");

        return reply.send({
            links,
            total: links.length,
        });
    } catch (error) {
        console.error(`Failed to scrape posts`, error);
        return reply.code(400).send(
            {
                message: `Failed to scrape posts`,
                error,
            }
        );
    }
};
