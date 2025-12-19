# 🚀 PROMETHEUS AI - SETUP PLAYBOOK

## Quick Reference for Future Sessions

**Project:** bespokeethos-analytics-475007
**Owner:** contact@bespokeethos.com
**Region:** us-central1
**Auth Method:** Browser (interactive)

---

## 1. AUTHENTICATE (Browser-Based)

```bash
# Firebase CLI (opens browser)
firebase login

# Google Cloud CLI (opens browser)
gcloud auth login
gcloud auth application-default login

# Set project
gcloud config set project bespokeethos-analytics-475007
firebase use bespokeethos-analytics-475007
```

> **Note:** Always prefer browser authentication over service account keys when possible.

---

## 2. ENABLE APIS (Run Once)

```bash
gcloud services enable \
  aiplatform.googleapis.com \
  secretmanager.googleapis.com \
  cloudfunctions.googleapis.com \
  run.googleapis.com \
  pubsub.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

---

## 3. ADD SECRETS (Google Cloud Console)

Go to: https://console.cloud.google.com/security/secret-manager?project=bespokeethos-analytics-475007

Add these secrets:

- `GEMINI_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `GA4_PROPERTY_ID_BESPOKE`
- `GA4_PROPERTY_ID_GMFG`

---

## 4. INSTALL DEPENDENCIES

```bash
cd c:\firebase
npm install
```

---

## 5. LOCAL DEVELOPMENT

```bash
# Start Genkit UI (test flows locally)
npx genkit start

# Start Next.js dev server
npm run dev

# Start Firebase emulators
firebase emulators:start
```

---

## 6. DEPLOY

```bash
# Full deploy
firebase deploy

# Functions only
firebase deploy --only functions

# Hosting only
firebase deploy --only hosting

# Firestore rules + indexes
firebase deploy --only firestore
```

---

## 7. TRACING

### Local (AI Toolkit)

1. VS Code Command: `AI Toolkit: Open Trace Viewer`
2. Traces sent to `localhost:4318`

### Production (Cloud Trace)

- Auto-configured via Application Default Credentials
- View at: https://console.cloud.google.com/traces?project=bespokeethos-analytics-475007

---

## 8. BROWSER SHORTCUTS

| Service          | URL                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Firebase Console | https://console.firebase.google.com/project/bespokeethos-analytics-475007                      |
| Cloud Functions  | https://console.cloud.google.com/functions?project=bespokeethos-analytics-475007               |
| Vertex AI        | https://console.cloud.google.com/vertex-ai?project=bespokeethos-analytics-475007               |
| Secret Manager   | https://console.cloud.google.com/security/secret-manager?project=bespokeethos-analytics-475007 |
| Cloud Trace      | https://console.cloud.google.com/traces?project=bespokeethos-analytics-475007                  |
| Firestore        | https://console.cloud.google.com/firestore?project=bespokeethos-analytics-475007               |

---

## 9. FILE STRUCTURE

```
c:\firebase\
├── .firebaserc              # Project alias
├── firebase.json            # Firebase config
├── firestore.rules          # Security rules
├── firestore.indexes.json   # Indexes + vector search
├── package.json             # Dependencies
├── src/
│   └── ai/
│       ├── genkit.ts        # Genkit + Vertex AI init
│       ├── tracing.ts       # OpenTelemetry setup
│       └── flows/           # Genkit flows (to create)
└── functions/               # Cloud Functions (to create)
```

---

## 10. AI MODELS

```typescript
// Default (90% - cheap & fast)
'vertexai/gemini-2.0-flash';

// Escalation (10% - complex decisions)
'vertexai/gemini-2.0-pro';

// Embeddings
'vertexai/text-embedding-004';
```

---

**COPY THIS PLAYBOOK TO ALL 3 REPOS AS INSTRUCTED.**
