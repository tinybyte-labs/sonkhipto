import { z } from "zod";
import type { FastifyReply, FastifyRequest } from "fastify";
import { publishers } from "../publishers/publishers";
import { getBrowser } from "../lib/browser";

export const scrapeArtickle = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const body = await req.body;
  const { link, publisherId } = await z
    .object({
      link: z.string().url(),
      publisherId: z.string(),
    })
    .parseAsync(body);

  const publisher = publishers.find(
    (publisher) => publisher.id === publisherId,
  );

  if (!publisher) {
    return reply.code(404).send("Publisher not found!");
  }

  try {
    const browser = await getBrowser();

    const metadata = await publisher.getArticleMetadata(link, browser);

    await browser.close();

    return reply.code(200).send(metadata);
  } catch (error) {
    console.error(`Failed to scrape posts`, error);
    return reply.code(400).send({
      message: `Failed to scrape posts`,
      error,
    });
  }
};
