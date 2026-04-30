import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const API_KEY = "AIzaSyBHIwAYcYXKsoMjiL5gARmfL6cLO7o_040"; // Using project's verified key
const genAI = new GoogleGenerativeAI(API_KEY);

const schema = {
  description: "Niche Research Report",
  type: SchemaType.OBJECT,
  properties: {
    niche: { type: SchemaType.STRING },
    justification: { type: SchemaType.STRING },
    keywords: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    suggested_articles: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          target_keyword: { type: SchemaType.STRING },
          brief: { type: SchemaType.STRING }
        }
      }
    }
  },
  required: ["niche", "justification", "keywords", "suggested_articles"],
};

export async function runTrendDiscovery() {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const prompt = "Research the current top 3 trending but underserved micro-niches in healthcare and AI. Pick the best one and generate a full content strategy.";
  
  console.log("Agent 1: Discovering Trends...");
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
