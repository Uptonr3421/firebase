/**
 * Opportunity Scanner Flow
 * Detect leads from NGLCC, events, news
 */

import { z } from "zod";
import { ai } from "../genkit";

const OpportunityScannerInput = z.object({
  sources: z
    .array(z.enum(["nglcc", "events", "news", "linkedin"]))
    .default(["nglcc", "news"]),
  industry: z.string().default("consulting"),
  minRelevanceScore: z.number().default(0.7),
});

const OpportunityScannerOutput = z.object({
  opportunities: z.array(
    z.object({
      title: z.string(),
      source: z.string(),
      description: z.string(),
      relevanceScore: z.number(),
      estimatedValue: z.string(),
      deadline: z.string().nullable(),
      url: z.string().nullable(),
      detectedAt: z.string(),
    })
  ),
  summary: z.string(),
  totalFound: z.number(),
  highPriority: z.number(),
});

export const opportunityScannerFlow = ai.defineFlow(
  {
    name: "opportunityScannerFlow",
    inputSchema: OpportunityScannerInput,
    outputSchema: OpportunityScannerOutput,
  },
  async (input) => {
    try {
      // TODO: Implement actual opportunity scanning APIs
      const mockOpportunities = [
        {
          title: "NGLCC Corporate Partner RFP",
          source: "nglcc",
          description:
            "Fortune 500 seeking certified LGBT business for marketing strategy",
          relevanceScore: 0.92,
          estimatedValue: "$50,000 - $100,000",
          deadline: "2025-01-15",
          url: "https://nglcc.org/opportunities",
          detectedAt: new Date().toISOString(),
        },
      ];

      const filtered = mockOpportunities.filter(
        (o) => o.relevanceScore >= input.minRelevanceScore
      );

      const highPriority = filtered.filter(
        (o) => o.relevanceScore >= 0.85
      ).length;

      return {
        opportunities: filtered,
        summary:
          filtered.length > 0
            ? `Found ${filtered.length} opportunities, ${highPriority} high priority`
            : "No new opportunities matching criteria",
        totalFound: filtered.length,
        highPriority,
      };
    } catch (error) {
      console.error("FLOW_ERROR", {
        flow: "opportunityScannerFlow",
        step: "scan",
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);
