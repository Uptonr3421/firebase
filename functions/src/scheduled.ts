/**
 * Scheduled Cloud Functions
 * Automated execution of Genkit flows on schedules
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";

// Define secrets
const geminiKey = defineSecret("GEMINI_API_KEY");

// Import flows
import {
  marketingBriefFlow,
  competitorWatchFlow,
  selfHealingFlow,
} from "../../src/ai/flows";

/**
 * Marketing Brief Scheduled Job
 * Runs daily at 8:00 AM EST (13:00 UTC)
 * Generates executive summary from GA4 data
 */
export const scheduledMarketingBrief = onSchedule(
  {
    schedule: "0 13 * * *", // 8am EST = 13:00 UTC
    timeZone: "America/New_York",
    secrets: [geminiKey],
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 120,
  },
  async (event) => {
    try {
      console.log("SCHEDULED_RUN", {
        function: "scheduledMarketingBrief",
        timestamp: event.scheduleTime,
      });

      const result = await marketingBriefFlow({
        dateRange: "yesterday",
        properties: ["bespoke-ethos", "gmfg"],
      });

      console.log("SCHEDULED_SUCCESS", {
        function: "scheduledMarketingBrief",
        result: {
          confidence: result.confidence,
          metricsCount: Object.keys(result.metrics).length,
        },
      });

      // TODO: Store result in Firestore or send notification
    } catch (error) {
      console.error("SCHEDULED_ERROR", {
        function: "scheduledMarketingBrief",
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Competitor Watch Scheduled Job
 * Runs every 6 hours
 * Monitors competitor websites for changes
 */
export const scheduledCompetitorWatch = onSchedule(
  {
    schedule: "0 */6 * * *", // Every 6 hours
    timeZone: "America/New_York",
    secrets: [geminiKey],
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 180,
  },
  async (event) => {
    try {
      console.log("SCHEDULED_RUN", {
        function: "scheduledCompetitorWatch",
        timestamp: event.scheduleTime,
      });

      const result = await competitorWatchFlow({
        competitors: [],
        checkType: "quick",
      });

      console.log("SCHEDULED_SUCCESS", {
        function: "scheduledCompetitorWatch",
        result: {
          changesFound: result.changes.length,
          actionRequired: result.actionRequired,
        },
      });

      // TODO: If actionRequired, send alert to Firestore or notification service
    } catch (error) {
      console.error("SCHEDULED_ERROR", {
        function: "scheduledCompetitorWatch",
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Self-Healing Scheduled Job
 * Runs every 15 minutes
 * Auto-diagnose and restart failed services
 */
export const scheduledSelfHealing = onSchedule(
  {
    schedule: "*/15 * * * *", // Every 15 minutes
    timeZone: "America/New_York",
    secrets: [geminiKey],
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (event) => {
    try {
      console.log("SCHEDULED_RUN", {
        function: "scheduledSelfHealing",
        timestamp: event.scheduleTime,
      });

      const result = await selfHealingFlow({
        checkAll: true,
      });

      console.log("SCHEDULED_SUCCESS", {
        function: "scheduledSelfHealing",
        result: {
          status: result.status,
          servicesChecked: result.services.length,
          actionsTaken: result.actionsTaken.length,
        },
      });

      // TODO: If status is critical, send alert
      if (result.status === "critical") {
        console.error("CRITICAL_STATUS", {
          function: "scheduledSelfHealing",
          services: result.services.filter((s) => s.status === "error"),
          actionsTaken: result.actionsTaken,
        });
      }
    } catch (error) {
      console.error("SCHEDULED_ERROR", {
        function: "scheduledSelfHealing",
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);
