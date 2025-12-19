/**
 * Cloud Functions for Prometheus AI
 * 
 * Exports Genkit flows as callable Cloud Functions
 */

import { onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// Import all flows
import {
  competitorWatchFlow,
  contentDrafterFlow,
  marketingBriefFlow,
  opportunityScannerFlow,
  selfHealingFlow,
} from "./ai/flows";

// Export flows as callable Cloud Functions
export const competitorWatch = onCall(
  { region: "us-central1", memory: "512MiB" },
  async (request) => {
    const result = await competitorWatchFlow(request.data);
    return result;
  }
);

export const contentDrafter = onCall(
  { region: "us-central1", memory: "512MiB" },
  async (request) => {
    const result = await contentDrafterFlow(request.data);
    return result;
  }
);

export const marketingBrief = onCall(
  { region: "us-central1", memory: "512MiB" },
  async (request) => {
    const result = await marketingBriefFlow(request.data);
    return result;
  }
);

export const opportunityScanner = onCall(
  { region: "us-central1", memory: "512MiB" },
  async (request) => {
    const result = await opportunityScannerFlow(request.data);
    return result;
  }
);

export const selfHealing = onCall(
  { region: "us-central1", memory: "256MiB" },
  async (request) => {
    const result = await selfHealingFlow(request.data);
    return result;
  }
);

// Scheduled function - runs self-healing every 15 minutes
export const scheduledSelfHealing = onSchedule(
  {
    schedule: "every 15 minutes",
    region: "us-central1",
    memory: "256MiB",
  },
  async () => {
    try {
      console.log("Running scheduled self-healing check");
      const result = await selfHealingFlow({ checkAll: true });
      console.log("Self-healing result:", result);
      
      // Store result in Firestore for monitoring
      const db = admin.firestore();
      await db.collection("system").doc("health").set({
        lastCheck: admin.firestore.FieldValue.serverTimestamp(),
        status: result.status,
        services: result.services,
        actionsTaken: result.actionsTaken,
      });
    } catch (error) {
      console.error("Scheduled self-healing failed:", error);
    }
  }
);

// Scheduled function - scan for opportunities daily
export const scheduledOpportunityScanner = onSchedule(
  {
    schedule: "every day 09:00",
    timeZone: "America/New_York",
    region: "us-central1",
    memory: "512MiB",
  },
  async () => {
    try {
      console.log("Running scheduled opportunity scan");
      const result = await opportunityScannerFlow({
        sources: ["nglcc", "news"],
        industry: "consulting",
        minRelevanceScore: 0.7,
      });
      console.log("Opportunity scan result:", result);
      
      // Store high-priority opportunities in Firestore
      if (result.highPriority > 0) {
        const db = admin.firestore();
        const batch = db.batch();
        
        result.opportunities
          .filter((o) => o.relevanceScore >= 0.85)
          .forEach((opp) => {
            const docRef = db.collection("opportunities").doc();
            batch.set(docRef, {
              ...opp,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              status: "new",
            });
          });
        
        await batch.commit();
      }
    } catch (error) {
      console.error("Scheduled opportunity scanner failed:", error);
    }
  }
);
