"use server";
import { allCategories } from "@/constants";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export const summerizeDescription = async (
  text: string,
): Promise<{
  content: string;
  category: string;
}> => {
  const summeryGen = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      content: z
        .string()
        .describe(
          "This is the concise summary of the given article, maintaining key points within 400 characters.",
        ),
      category: z
        .string()
        .describe(
          "This is the category assigned to the article from the provided category list.",
        ),
    }),
    messages: [
      {
        role: "system",
        content: `You are a helpful AI assistant that generates concise summaries for news and articles. Your task is to summarize the given article in 400 characters or less while preserving its key points. The summary must be in the same language as the original article. Additionally, analyze the content and assign a category from the following list:\n\nCategories: ${allCategories.join(", ")}`,
      },
      { role: "user", content: `Article:\n\n ${text}` },
    ],
  });
  return summeryGen.object;
};
