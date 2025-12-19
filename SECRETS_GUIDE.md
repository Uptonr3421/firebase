# 🔐 Multi-Brand Secret Management Playbook

## Purpose

This playbook documents how to safely manage secrets and environment variables for a multi-brand, multi-root Firebase/Next.js/Genkit project. It is designed to help future agents (including less advanced models) avoid confusion and prevent cross-contamination of credentials.

---

## 1. Project Structure

- **c:\firebase**: Main orchestrator (Prometheus AI, BespokeEthos.com)
- **c:\vercel**: BespokeEthos.com legacy root (original .env.local)
- **c:\GMFG-vercel**: GayMensFieldGuide.com root (separate .env.local)

Each property/site has its own .env.local and unique identifiers.

---

## 2. Naming Conventions

- **Prefix all secrets and env vars** with the property/site name:
  - `BESPOKE_GA4_PROPERTY_ID`, `GMFG_GA4_PROPERTY_ID`, etc.
- In Secret Manager, use the same prefixing for clarity.

---

## 3. Secret Manager Setup

- Only copy what’s needed for cross-app flows.
- Add secrets to Firebase Secret Manager with explicit names:
  - `BESPOKE_GA4_PROPERTY_ID`
  - `GMFG_GA4_PROPERTY_ID`
  - `PROMETHEUS_GEMINI_API_KEY`
- Document all secrets in this playbook.

---

## 4. .env File Management

- Keep `.env.local` in each project root.
- Never mix credentials between brands in a single file.
- If a secret is needed by multiple apps, copy it with the correct prefix.

---

## 5. Codebase Usage

- Always reference secrets by their full, explicit name.
- Add comments in code when using cross-brand secrets.

---

## 6. Adding a New Secret (Step-by-Step)

1. **Determine which property needs the secret.**
2. **Name the secret with the property prefix.**
3. **Add to Secret Manager:**
   ```bash
   gcloud secrets create BESPOKE_GA4_PROPERTY_ID --replication-policy=automatic --project=bespokeethos-analytics-475007
   echo -n "12285928589" | gcloud secrets versions add BESPOKE_GA4_PROPERTY_ID --data-file=-
   ```
4. **Document the secret here.**
5. **Update .env.local in the relevant root if needed.**

---

## 7. Example: GA4 Property IDs

| Brand         | Secret Name             | Value       | Location       |
| ------------- | ----------------------- | ----------- | -------------- |
| Bespoke Ethos | BESPOKE_GA4_PROPERTY_ID | 12285928589 | Secret Manager |
| GMFG          | GMFG_GA4_PROPERTY_ID    | 13147404561 | Secret Manager |

---

## 8. Gotchas & Warnings

- Never overwrite a secret for one brand with a value from another.
- Always double-check the prefix before adding or updating a secret.
- Document every new secret and its intended use here.

---

## 9. For Future Agents

If you’re a less advanced model or new to this project:

- Read this playbook before touching secrets.
- When in doubt, ask for clarification or escalate to a human.
- Keep secrets safe, separated, and well-documented!

---

## 10. Revision History

- 2025-12-19: Initial version by Opus A (alpha agent)
