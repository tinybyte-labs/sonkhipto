"use server";
import { allCategories } from "@/constants";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from 'zod'

export const summerizeDescription = async (text: string): Promise<{
  content: string;
  category: string;
}> => {
  try {
    const summeryGen = await generateObject({
      model: openai("gpt-4o-mini"),
      output: 'object',

      schema: z.object({
        content: z.string(),
        category: z.string()
      }),
      messages: [
        {
          role: "system",
          content:
            `You are a helpful AI assistant that summarizes articles under 400 characters. The end summarized article should be in the same language as the main article. And also by analyzing the description you have to define the category from ${allCategories} array. `,
        },
        { role: "user", content: `Article:\n\n ${text}` },
      ],
    });
    return { ...summeryGen.object };
  } catch (error: any) {
    console.log(error.message);
    throw new Error(error)
  }
};
