"use server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const summerizeDescription = async (text: string): Promise<string> => {
  try {
    const summeryGen = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant that summarizes articles under 400 characters. The end summarized article should be in the same language as the main article.",
        },
        { role: "user", content: `Article:\n\n ${text}` },
      ],
    });

    const result = await summeryGen.text;
    return result;
  } catch (error: any) {
    console.log(error.message);
    return error.message;
  }
};
