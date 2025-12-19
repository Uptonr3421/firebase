/**
 * Content Drafter Flow
 * Generate SEO content based on trends
 */

import { z } from "zod";
import { ai, models } from "../genkit";

const ContentDrafterInput = z.object({
  topic: z.string(),
  contentType: z.enum(["blog", "social", "email", "ad"]).default("blog"),
  targetKeywords: z.array(z.string()).default([]),
  tone: z
    .enum(["professional", "casual", "authoritative"])
    .default("professional"),
  wordCount: z.number().default(500),
});

const ContentDrafterOutput = z.object({
  title: z.string(),
  content: z.string(),
  metaDescription: z.string(),
  suggestedKeywords: z.array(z.string()),
  readabilityScore: z.number(),
  confidence: z.number(),
});

export const contentDrafterFlow = ai.defineFlow(
  {
    name: "contentDrafterFlow",
    inputSchema: ContentDrafterInput,
    outputSchema: ContentDrafterOutput,
  },
  async (input) => {
    try {
      const prompt = `Write a ${input.contentType} about "${input.topic}".

Requirements:
- Tone: ${input.tone}
- Target length: ~${input.wordCount} words
- Include keywords: ${input.targetKeywords.join(", ") || "relevant industry terms"}
- Optimize for SEO

Provide:
1. A compelling title
2. The main content
3. A meta description (155 characters max)`;

      const result = await ai.generate({
        model: models.flash,
        prompt,
      });

      const text = result.text;
      const lines = text.split("\n").filter((l) => l.trim());

      return {
        title:
          lines[0]?.replace(/^#\s*/, "") || `${input.topic} - Expert Guide`,
        content: text,
        metaDescription: text.slice(0, 155),
        suggestedKeywords:
          input.targetKeywords.length > 0
            ? input.targetKeywords
            : [input.topic.toLowerCase()],
        readabilityScore: 75,
        confidence: 0.85,
      };
    } catch (error) {
      console.error("FLOW_ERROR", {
        flow: "contentDrafterFlow",
        step: "generate",
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);
