import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import z from "zod";
import { PolymarketEntityType } from "../types/polymarketEvent";
import { getComments } from "./polymarket-gamma";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});
const model = openai("gpt-4.1");

function escapePunctuation(text: string) {
  // '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'
  return text.replace(/([_*[\]()~`>#+\-={}|.!\[\]\/\\])/g, "\\$1");
}
export async function generateCommentAnalysis(
  entityId: number,
  entityType: PolymarketEntityType = "Market"
) {
  let result = "Unable to generate analysis.";
  try {
    const comments = await getComments(entityId, entityType);
    const prompt = `Analyze the following comments and provide a summary, overall sentiment, and key points mentioned:\n\n${JSON.stringify(
      comments
    )}\n\n`;
    const response = await generateObject({
      model,
      prompt,
      schema: z.object({
        summary: z.string().describe("A brief summary of the comments."),
        sentiment: z
          .enum(["positive", "neutral", "negative"])
          .describe("Overall sentiment of the comments."),
        keyPoints: z
          .array(z.string())
          .describe("Key points mentioned in the comments."),
        opinion: z.string().describe("Your personal opinion on this market."),
      }),
    });
    result = `*Sentiment:* ${escapePunctuation(
      response.object.sentiment
    )}\n\n*Summary:*\n${escapePunctuation(
      response.object.summary
    )}\n\n*Key Points:*\n${response.object.keyPoints
      .map((point) => escapePunctuation(`- ${point}`))
      .join("\n")}\n\n*Opinion:*\n${escapePunctuation(
      response.object.opinion
    )}\n\n`;
  } catch (error) {
    console.error("Error generating comment analysis:", error);
  }
  return result;
}
