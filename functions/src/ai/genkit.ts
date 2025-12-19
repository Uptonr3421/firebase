/**
 * Genkit AI Configuration
 *
 * Initializes Firebase Genkit with Vertex AI for the Prometheus AI system.
 * Uses gemini-2.5-flash by default (90% of operations).
 */

import { vertexAI } from "@genkit-ai/vertexai";
import { genkit } from "genkit";

// Initialize tracing
import "./tracing";

// Genkit instance configured for Vertex AI
export const ai = genkit({
  plugins: [
    vertexAI({
      projectId: "bespokeethos-analytics-475007",
      location: "us-central1",
    }),
  ],
  // Default model: Flash for speed and cost efficiency
  model: "vertexai/gemini-2.0-flash",
});

// Model references for explicit use
export const models = {
  // Default: 90% of operations - cheap & fast
  flash: "vertexai/gemini-2.0-flash",

  // Escalation: 10% - complex decisions > $1000 value
  pro: "vertexai/gemini-2.0-pro",

  // Embeddings for vector search
  embeddings: "vertexai/text-embedding-004",
} as const;

// Re-export for convenience
export { ai as default };
