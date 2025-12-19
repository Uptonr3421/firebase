/**
 * Marketing Brief Flow
 * Daily 8am executive summary from GA4 data
 */

import { z } from "zod";
import { ai, models } from "../genkit";

const MarketingBriefInput = z.object({
  dateRange: z
    .enum(["today", "yesterday", "last7days", "last30days"])
    .default("last7days"),
  properties: z.array(z.string()).default(["bespoke-ethos", "gmfg"]),
});

const MarketingBriefOutput = z.object({
  summary: z.string(),
  highlights: z.array(z.string()),
  recommendations: z.array(z.string()),
  metrics: z.object({
    totalSessions: z.number(),
    totalUsers: z.number(),
    bounceRate: z.number(),
    avgSessionDuration: z.number(),
  }),
  confidence: z.number(),
  generatedAt: z.string(),
});

export const marketingBriefFlow = ai.defineFlow(
  {
    name: "marketingBriefFlow",
    inputSchema: MarketingBriefInput,
    outputSchema: MarketingBriefOutput,
  },
  async (input) => {
    try {
      // TODO: Replace with actual GA4 API call
      const mockAnalyticsData = {
        sessions: 1250,
        users: 890,
        bounceRate: 42.5,
        avgDuration: 185,
        topPages: ["/services", "/about", "/contact"],
        topSources: ["google", "direct", "linkedin"],
      };

      const prompt = `You are an executive briefing AI. Analyze this GA4 data and create a concise morning brief.

Data for ${input.properties.join(" and ")} (${input.dateRange}):
${JSON.stringify(mockAnalyticsData, null, 2)}

Provide:
1. A 2-3 sentence executive summary
2. 3 key highlights (bullet points)
3. 2-3 actionable recommendations

Be concise, data-driven, and focus on business impact.`;

      const result = await ai.generate({
        model: models.flash,
        prompt,
      });

      const text = result.text;

      return {
        summary: text.split("\n")[0] || "Daily metrics within normal range.",
        highlights: [
          `${mockAnalyticsData.sessions} sessions this period`,
          `${mockAnalyticsData.users} unique users`,
          `Top traffic source: ${mockAnalyticsData.topSources[0]}`,
        ],
        recommendations: [
          "Continue monitoring bounce rate trends",
          "Optimize top landing pages for conversion",
        ],
        metrics: {
          totalSessions: mockAnalyticsData.sessions,
          totalUsers: mockAnalyticsData.users,
          bounceRate: mockAnalyticsData.bounceRate,
          avgSessionDuration: mockAnalyticsData.avgDuration,
        },
        confidence: 0.92,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("FLOW_ERROR", {
        flow: "marketingBriefFlow",
        step: "generate",
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);
