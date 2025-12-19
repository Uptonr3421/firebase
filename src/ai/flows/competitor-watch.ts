/**
 * Competitor Watch Flow
 * Monitor competitor websites for changes
 */

import { z } from "zod";
import { ai, models } from "../genkit";

const CompetitorWatchInput = z.object({
  competitors: z.array(z.string()).default([]),
  checkType: z.enum(["full", "quick"]).default("quick"),
});

const CompetitorWatchOutput = z.object({
  changes: z.array(
    z.object({
      competitor: z.string(),
      changeType: z.enum([
        "pricing",
        "messaging",
        "features",
        "design",
        "content",
      ]),
      description: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      detectedAt: z.string(),
    })
  ),
  summary: z.string(),
  actionRequired: z.boolean(),
  confidence: z.number(),
});

export const competitorWatchFlow = ai.defineFlow(
  {
    name: "competitorWatchFlow",
    inputSchema: CompetitorWatchInput,
    outputSchema: CompetitorWatchOutput,
  },
  async (input) => {
    try {
      // TODO: Implement actual web scraping / change detection
      // Use input.competitors and input.checkType when implementing
      const mockChanges: Array<{
        competitor: string;
        changeType: "pricing" | "messaging" | "features" | "design" | "content";
        description: string;
        severity: "low" | "medium" | "high";
        detectedAt: string;
      }> = [
        {
          competitor: input.competitors.length > 0 ? input.competitors[0] : "competitor-a.com",
          changeType: "pricing",
          description: `Updated pricing page with new tier structure (${input.checkType} check)`,
          severity: "medium",
          detectedAt: new Date().toISOString(),
        },
      ];

      const hasChanges = mockChanges.length > 0;

      const prompt = `Analyze these competitor changes and provide a brief summary:
${JSON.stringify(mockChanges, null, 2)}

Summarize in 1-2 sentences what this means for our business.`;

      const result = await ai.generate({
        model: models.flash,
        prompt,
      });

      return {
        changes: mockChanges,
        summary: result.text || "No significant competitor changes detected.",
        actionRequired:
          hasChanges && mockChanges.some((c) => c.severity === "high"),
        confidence: 0.88,
      };
    } catch (error) {
      console.error("FLOW_ERROR", {
        flow: "competitorWatchFlow",
        step: "analyze",
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);
