
// Firestore Schema
// /trends/{trendId} - { niche, justification, volume, competition, timestamp }
// /niches/{nicheId} - { niche, status: 'validated', keywords: [], cpc, intent }
// /sites/{siteId} - { niche, githubRepo, liveUrl, status: 'live', monetization: 'adsense_ready' }
// /articles/{articleId} - { siteId, title, content, slug, status: 'published', seo: {} }
// /analytics/{siteId} - { traffic, rankings, engagement, lastUpdated }

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const API_KEY = "AIzaSyDrKDIc6vBsxAJxH-YSMXTdilBeQxSX3rw";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function runTrendDiscovery() {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          niche: { type: SchemaType.STRING },
          justification: { type: SchemaType.STRING },
          keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        }
      }
    }
  });

  const prompt = "Act as Trend Research Agent. Find top 3 low-competition, high-value trending niches for automated content sites. Choose the best one.";
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
