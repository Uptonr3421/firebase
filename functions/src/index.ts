/**
 * Cloud Functions for Prometheus AI
 * Exposes Genkit flows as callable endpoints
 */

import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin
initializeApp();

// Define secrets
const geminiKey = defineSecret("GEMINI_API_KEY");

// Import Genkit flows
// Note: These imports reference the parent project's src directory
import {
  marketingBriefFlow,
  competitorWatchFlow,
  selfHealingFlow,
  opportunityScannerFlow,
  contentDrafterFlow,
} from "../../src/ai/flows";

/**
 * Marketing Brief - Generate daily executive summary from GA4 data
 * Callable function that triggers the marketing brief flow
 */
export const marketingBrief = onCall(
  {
    secrets: [geminiKey],
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      const input = request.data || {};
      const result = await marketingBriefFlow(input);
      return { success: true, data: result };
    } catch (error) {
      console.error("FUNCTION_ERROR", {
        function: "marketingBrief",
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Competitor Watch - Monitor competitor websites for changes
 * Callable function that triggers the competitor watch flow
 */
export const competitorWatch = onCall(
  {
    secrets: [geminiKey],
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 120,
  },
  async (request) => {
    try {
      const input = request.data || {};
      const result = await competitorWatchFlow(input);
      return { success: true, data: result };
    } catch (error) {
      console.error("FUNCTION_ERROR", {
        function: "competitorWatch",
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Self Healing - Auto-diagnose and restart failed services
 * Callable function that triggers the self-healing flow
 */
export const selfHealing = onCall(
  {
    secrets: [geminiKey],
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 30,
  },
  async (request) => {
    try {
      const input = request.data || {};
      const result = await selfHealingFlow(input);
      return { success: true, data: result };
    } catch (error) {
      console.error("FUNCTION_ERROR", {
        function: "selfHealing",
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Opportunity Scanner - Detect leads from NGLCC, events, news
 * Callable function that triggers the opportunity scanner flow
 */
export const opportunityScanner = onCall(
  {
    secrets: [geminiKey],
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 120,
  },
  async (request) => {
    try {
      const input = request.data || {};
      const result = await opportunityScannerFlow(input);
      return { success: true, data: result };
    } catch (error) {
      console.error("FUNCTION_ERROR", {
        function: "opportunityScanner",
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Content Drafter - Generate SEO content based on trends
 * Callable function that triggers the content drafter flow
 */
export const contentDrafter = onCall(
  {
    secrets: [geminiKey],
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 90,
  },
  async (request) => {
    try {
      const input = request.data || {};
      const result = await contentDrafterFlow(input);
      return { success: true, data: result };
    } catch (error) {
      console.error("FUNCTION_ERROR", {
        function: "contentDrafter",
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

// Export scheduled functions
export * from "./scheduled";
