# GITHUB COPILOT INSTRUCTIONS
## Repository: Bespokeethos/firebase

---

## 🚨 CRITICAL BOUNDARIES

### WRITABLE (This Repo)
- **Repo:** `Bespokeethos/firebase`
- **Local:** `C:\firebase`
- **Deploy:** Firebase Hosting + Cloud Functions

### READ-ONLY (Never Modify)
- `bespoke-ethos` → Vercel (B2B consulting site)
- `GMFG` → Vercel (Lifestyle site)

---

## PROJECT CONFIG
```yaml
project_id: bespokeethos-analytics-475007
billing_account: 01D82D-EE885B-C29459
region: us-central1
user: contact@bespokeethos.com
```

---

## TECH STACK (Strict)
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| AI | Firebase Genkit + Vertex AI |
| Database | Firestore + Vector Search |
| Functions | Cloud Functions 2nd Gen |
| Validation | Zod schemas |
| UI | Tailwind CSS (standard directives) |
| Fonts | System fonts (no Google Fonts) |
| Secrets | Google Secret Manager |

---

## AI MODELS
```typescript
// Default (90% of operations) - cheap & fast
const flash = 'gemini-2.5-flash';

// Escalation (10% - complex decisions)
const pro = 'gemini-2.5-pro';

// Embeddings
const embeddings = 'text-embedding-004';
```

---

## ✅ CORRECT IMPORTS
```typescript
// Genkit
import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';

// Firebase Functions (v2 ONLY)
import { onCall, onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';

// Firestore (Admin SDK in functions)
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
```

---

## ❌ NEVER USE
```typescript
// Client SDK in Cloud Functions
import { getFirestore } from 'firebase/firestore';

// v1 Functions syntax
import * as functions from 'firebase-functions';

// Environment variables for secrets
process.env.API_KEY

// Google AI instead of Vertex (for production)
import { googleAI } from '@genkit-ai/googleai';

// Google Fonts or external CDN resources at build time
import { Inter } from 'next/font/google';  // Use system fonts instead
```

---

## SECRETS ACCESS
```typescript
import { defineSecret } from 'firebase-functions/params';

const geminiKey = defineSecret('GEMINI_API_KEY');

export const myFunction = onCall(
  { secrets: [geminiKey], region: 'us-central1' },
  async (req) => {
    const key = geminiKey.value();
    // use key...
  }
);
```

---

## FLOW PATTERN
```typescript
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';

const InputSchema = z.object({
  query: z.string().min(1),
});

const OutputSchema = z.object({
  result: z.string(),
  confidence: z.number(),
});

export const myFlow = defineFlow(
  {
    name: 'myFlow',
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => {
    try {
      // logic here
      return { result: 'done', confidence: 0.95 };
    } catch (error) {
      console.error('FLOW_ERROR', {
        flow: 'myFlow',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);
```

---

## BUILD & DEPLOYMENT CONSTRAINTS
* **No external network access during build** - Build must work offline
* **Use standard Tailwind directives** - `@tailwind base/components/utilities` (NOT `@import "tailwindcss"`)
* **System fonts only** - No Google Fonts or CDN fonts at build time
* **Minimize plugin dependencies** - Only use plugins explicitly in package.json

---

## ERROR HANDLING
Always use structured error logging:
```typescript
console.error('FLOW_ERROR', {
  flow: 'flowName',
  step: 'stepName',
  details: error instanceof Error ? error.message : String(error),
});
```

---

## COMMANDS
| Command | Purpose |
|---------|---------|
| `npx genkit start` | Local Genkit UI |
| `firebase deploy --only functions` | Deploy functions |
| `firebase deploy --only hosting` | Deploy Next.js |
| `firebase emulators:start` | Local emulators |

---

## FIRESTORE COLLECTIONS
```
/system/state          - Current system state
/system/memory         - Conversation history
/flows/{flowId}        - Flow execution logs
/leads/{leadId}        - CRM data
/analytics/{date}      - Cached GA4 data
/competitors/{id}      - Competitor intel
```

---

## COST RULES
- Default to `gemini-2.5-flash`
- Only escalate to `pro` for decisions > $1000
- Batch API calls with `Promise.all()`
- Cache brand positioning: 7 days
- Cache GA4 data: 6 hours
