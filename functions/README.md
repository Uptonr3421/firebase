# Cloud Functions for Prometheus AI

This directory contains Firebase Cloud Functions (2nd gen) that expose Genkit AI flows as callable endpoints and scheduled jobs.

## Structure

```
functions/
├── src/
│   ├── index.ts         # Callable functions (onCall)
│   └── scheduled.ts     # Scheduled functions (onSchedule)
├── lib/                 # Compiled JavaScript (gitignored)
├── package.json
└── tsconfig.json
```

## Functions

### Callable Functions (API-triggered)

All callable functions are deployed to `us-central1` and require `GEMINI_API_KEY` secret.

1. **marketingBrief** - Generate daily executive summary from GA4 data
2. **competitorWatch** - Monitor competitor websites for changes
3. **selfHealing** - Auto-diagnose and restart failed services
4. **opportunityScanner** - Detect leads from NGLCC, events, news
5. **contentDrafter** - Generate SEO content based on trends

### Scheduled Functions

1. **scheduledMarketingBrief**
   - Schedule: Daily at 8:00 AM EST (13:00 UTC)
   - Purpose: Generate morning executive brief

2. **scheduledCompetitorWatch**
   - Schedule: Every 6 hours
   - Purpose: Monitor competitor changes

3. **scheduledSelfHealing**
   - Schedule: Every 15 minutes
   - Purpose: Health checks and auto-recovery

## Development

```bash
# Install dependencies
npm install

# Build functions
npm run build

# Watch mode (auto-rebuild)
npm run dev

# Test locally with emulators
npm run serve

# View logs
npm run logs
```

## Deployment

```bash
# Deploy all functions
npm run deploy

# Or from project root
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:marketingBrief
```

## Secrets

Before deploying, ensure the `GEMINI_API_KEY` secret is configured:

```bash
# Set secret (requires Firebase CLI)
firebase functions:secrets:set GEMINI_API_KEY

# View secrets
firebase functions:secrets:access GEMINI_API_KEY
```

## Configuration

- **Region**: us-central1
- **Node.js**: 20
- **Memory**: 256MiB - 512MiB (depending on function)
- **Timeout**: 30s - 180s (depending on function)

## Notes

- Functions reference flows from `../src/ai/flows/`
- Build output is in `lib/functions/src/`
- All functions use Firebase Functions v2 (`firebase-functions@5.x`)
- Scheduled functions use cron syntax with America/New_York timezone
