
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

admin.initializeApp();

const API_KEY = "AIzaSyBHIwAYcYXKsoMjiL5gARmfL6cLO7o_040";
const genAI = new GoogleGenerativeAI(API_KEY);

// Define the Agent Logic
export const autonomousTrendDiscovery = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = "Identify a top-tier trending niche with high monetization potential. Provide keywords and a justifying report.";
    
    try {
      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text());

      // Store in Firestore for the Website Builder Agent to pick up
      const docRef = await admin.firestore().collection("trends").add({
        ...data,
        status: "validated",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Trend Agent discovered new niche: ${data.niche}. Doc ID: ${docRef.id}`);
      return null;
    } catch (error) {
      console.error("❌ Agent Error:", error);
      return null;
    }
  });

// Agent for Website Builder Trigger
export const onNicheValidated = functions.firestore
  .document("trends/{trendId}")
  .onCreate(async (snapshot, context) => {
    const trendData = snapshot.data();
    console.log(`🏗️ Website Builder Agent triggered for: ${trendData.niche}`);
    
    // Logic to trigger GitHub Workflow via Octokit or Webhook
    // and eventual Firebase Hosting deployment
    return null;
  });
