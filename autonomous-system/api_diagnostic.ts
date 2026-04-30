import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBHIwAYcYXKsoMjiL5gARmfL6cLO7o_040";
const genAI = new GoogleGenerativeAI(API_KEY);

async function diagnostic() {
  console.log("🔍 DIAGNOSTIC: Testing Gemini API Key...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Test");
    console.log("✅ API KEY IS VALID AND WORKING!");
    console.log("Response:", result.response.text());
  } catch (e: any) {
    console.error("❌ DIAGNOSTIC FAILED");
    console.error("Error Code:", e.status);
    console.error("Reason:", e.message);
    if (e.message.includes("blocked") || e.message.includes("403")) {
      console.log("\n💡 SOLUTION:");
      console.log("1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?project=smart-web-builder-ai");
      console.log("2. Click 'ENABLE'.");
      console.log("3. If already enabled, go to 'Credentials' and ensure your API key doesn't have 'API restrictions' preventing it from using Gemini.");
    }
  }
}

diagnostic();
