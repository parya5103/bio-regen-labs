import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';

const API_KEY = "AIzaSyBHIwAYcYXKsoMjiL5gARmfL6cLO7o_040";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateHighQualityArticle(topic: string, brief: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Act as an expert medical and tech journalist. 
    Write a 1500-word, high-value, SEO-optimized article about "${topic}".
    Context: ${brief}
    
    Requirements:
    - Use H1, H2, and H3 tags.
    - Write in a professional yet accessible human-like tone.
    - Include a table of key data points.
    - Add a detailed FAQ section at the end.
    - Include meta description and title tags at the beginning.
    - Ensure zero AI-like fluff. Use specific examples and data.
  `;

  console.log(`Agent 4: Writing Article for "${topic}"...`);
  const result = await model.generateContent(prompt);
  return result.response.text();
}
