'use server'
import { openai } from "@ai-sdk/openai";
import { generateText } from 'ai'

export const summerizeDescription: (text?: string | null) => Promise<string> = async (text) => {
    if (text) {
        try {
            // Generate a summary
            const summeryGen = await generateText({
                model: openai("gpt-4o-mini"),
                messages: [
                    { role: "system", content: "You are a helpful AI assistant that summarizes text." },
                    { role: "user", content: `Summarize this: ${text}` },
                ],
            });

            const result = await summeryGen.text;
            return result


        } catch (error: any) {
            console.log(error.message)
            return error.message
        }
    }
}