# COPILOT & AI CODING INSTRUCTIONS

## Context: Prometheus AI (Firebase Genkit + Vertex AI + Next.js 14)

> **Antigravity Protocol Active** - Agent-first architecture using Vertex AI

### 1. ARCHITECTURE & BOUNDARIES

- **Current Repo:** `Bespokeethos/firebase` (Writable, Deployment Target).
- **External Repos:** `bespoke-ethos`, `GMFG` (READ-ONLY data sources. NEVER suggest writing to them).
- **Hosting:** Firebase App Hosting (Next.js 14 App Router).
- **Backend:** Firebase Cloud Functions (2nd Gen) + Genkit + Vertex AI.
- **Project ID:** `bespokeethos-analytics-475007`
- **Region:** `us-central1`

### 2. STRICT TECH STACK (Do Not Deviate)

- **Framework:** Next.js 14 (App Router, strict TypeScript).
- **AI Framework:** Firebase Genkit (`@genkit-ai/*`).
- **Database:** Cloud Firestore (use `firebase-admin/firestore`, NOT `firebase/firestore` in functions).
- **Validation:** Zod schemas (Required for all Genkit flows).
- **Styling:** Tailwind CSS + Shadcn/UI.

### 3. DEBUGGING & COMMON ERRORS

- **Genkit Flows:** Must use `defineFlow` with strict `inputSchema` and `outputSchema`.
- **Secrets:** NEVER use `process.env` for keys. Use `defineSecret` from `firebase-functions/params`.
- **Imports:**
  - Use `@genkit-ai/googleai` for Gemini models.
  - Use `firebase-functions/v2` (NOT v1).
- **Vector Search:** If `findNearest` fails, check if the Firestore Vector Index is created in `firestore.indexes.json`.
- **Build Requirements:** 
  - NO external network dependencies during build (no Google Fonts, no external CDNs).
  - Use standard Tailwind directives: `@tailwind base/components/utilities`.
  - Use system fonts only (configured in globals.css).

### 4. CODE STYLE FOR DEBUGGING

If code fails, wrap the failing block in a `try/catch` and log the structured error:

```typescript
try {
  // operation
} catch (error) {
  console.error("FLOW_ERROR", {
    flow: "flowName",
    step: "stepName",
    details: error instanceof Error ? error.message : String(error),
  });
  throw error; // Re-throw to trigger Genkit failure handling
}
```

### 5. COMMANDS

- **Local Genkit UI:** `npx genkit start`
- **Deploy:** `firebase deploy --only functions`

---

## 6. RECOMMENDED EXTENSIONS & TOOLS

### A. Essential IDE Extensions

1. **Firebase Genkit (VS Code / IDX Extension)** - Run flows locally, test prompts, view traces.
2. **Pretty TypeScript Errors** - Makes Genkit's complex type errors readable.
3. **Google Cloud Code** - Direct access to Cloud Logging and Secret Manager.

### B. Infrastructure Add-ons (Firebase Console)

1. **Firebase App Hosting** - Use this (NOT standard Firebase Hosting) for Next.js 14 SSR.
2. **Google Cloud Error Reporting** - Get alerts when flows fail in production.
3. **Firestore Vector Search Extension** - Optional; manual Genkit embeddings offer better control.

---

## 7. IMPORT CHEAT SHEET

```typescript
// ✅ CORRECT IMPORTS
import { defineFlow, runFlow } from "@genkit-ai/flow";
import { gemini15Flash } from "@genkit-ai/googleai";
import { defineSecret } from "firebase-functions/params";
import { onCallFlow } from "@genkit-ai/firebase/functions";
import { getFirestore } from "firebase-admin/firestore";

// ❌ WRONG IMPORTS (Never use these in Cloud Functions)
// import { getFirestore } from 'firebase/firestore';  // Client SDK
// import * as functions from 'firebase-functions';     // v1 syntax
// import { Inter } from 'next/font/google';            // External network at build
```

---

## 8. FLOW TEMPLATE

```typescript
import { defineFlow } from "@genkit-ai/flow";
import { z } from "zod";

const InputSchema = z.object({
  query: z.string().min(1),
});

const OutputSchema = z.object({
  result: z.string(),
  confidence: z.number(),
});

export const exampleFlow = defineFlow(
  {
    name: "exampleFlow",
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => {
    try {
      // Your logic here
      return {
        result: `Processed: ${input.query}`,
        confidence: 0.95,
      };
    } catch (error) {
      console.error("FLOW_ERROR", {
        flow: "exampleFlow",
        step: "processing",
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);
```
