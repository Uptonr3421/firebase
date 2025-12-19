/**
 * Scheduled Cloud Functions
 * Automated execution of Genkit flows on schedules
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';

// Define secrets
const geminiKey = defineSecret('GEMINI_API_KEY');
const bespokePropertyId = defineSecret('GA4_BESPOKE_PROPERTY_ID');
const gmfgPropertyId = defineSecret('GA4_GMFG_PROPERTY_ID');

// Import flows
import { competitorWatchFlow, marketingBriefFlow, selfHealingFlow } from '../../src/ai/flows';

/**
 * Marketing Brief Scheduled Job
 * Runs daily at 8:00 AM EST (13:00 UTC)
 * Generates executive summary from GA4 data
 */
export const scheduledMarketingBrief = onSchedule(
  {
    schedule: '0 13 * * *', // 8am EST = 13:00 UTC
    timeZone: 'America/New_York',
    secrets: [geminiKey],
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 120,
  },
  async (event) => {
    try {
      console.log('SCHEDULED_RUN', {
        function: 'scheduledMarketingBrief',
        timestamp: event.scheduleTime,
      });

      const result = await marketingBriefFlow({
        dateRange: 'yesterday',
        properties: ['bespoke-ethos', 'gmfg'],
      });

      console.log('SCHEDULED_SUCCESS', {
        function: 'scheduledMarketingBrief',
        result: {
          confidence: result.confidence,
          metricsCount: Object.keys(result.metrics).length,
        },
      });

      // TODO: Store result in Firestore or send notification
    } catch (error) {
      console.error('SCHEDULED_ERROR', {
        function: 'scheduledMarketingBrief',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Competitor Watch Scheduled Job
 * Runs every 6 hours
 * Monitors competitor websites for changes
 */
export const scheduledCompetitorWatch = onSchedule(
  {
    schedule: '0 */6 * * *', // Every 6 hours
    timeZone: 'America/New_York',
    secrets: [geminiKey],
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 180,
  },
  async (event) => {
    try {
      console.log('SCHEDULED_RUN', {
        function: 'scheduledCompetitorWatch',
        timestamp: event.scheduleTime,
      });

      // TODO: Configure default competitors list in Firestore or environment
      // For now, the flow uses its own default list
      const result = await competitorWatchFlow({
        competitors: [],
        checkType: 'quick',
      });

      console.log('SCHEDULED_SUCCESS', {
        function: 'scheduledCompetitorWatch',
        result: {
          changesFound: result.changes.length,
          actionRequired: result.actionRequired,
        },
      });

      // TODO: If actionRequired, send alert to Firestore or notification service
    } catch (error) {
      console.error('SCHEDULED_ERROR', {
        function: 'scheduledCompetitorWatch',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Self-Healing Scheduled Job
 * Runs every 15 minutes
 * Auto-diagnose and restart failed services
 */
export const scheduledSelfHealing = onSchedule(
  {
    schedule: '*/15 * * * *', // Every 15 minutes
    timeZone: 'America/New_York',
    secrets: [geminiKey],
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    try {
      console.log('SCHEDULED_RUN', {
        function: 'scheduledSelfHealing',
        timestamp: event.scheduleTime,
      });

      const result = await selfHealingFlow({
        checkAll: true,
      });

      console.log('SCHEDULED_SUCCESS', {
        function: 'scheduledSelfHealing',
        result: {
          status: result.status,
          servicesChecked: result.services.length,
          actionsTaken: result.actionsTaken.length,
        },
      });

      // TODO: If status is critical, send alert
      if (result.status === 'critical') {
        console.error('CRITICAL_STATUS', {
          function: 'scheduledSelfHealing',
          services: result.services.filter((s) => s.status === 'error'),
          actionsTaken: result.actionsTaken,
        });
      }
    } catch (error) {
      console.error('SCHEDULED_ERROR', {
        function: 'scheduledSelfHealing',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * GA4 Data Sync - Scheduled every 6 hours
 * Caches analytics data from both properties in Firestore
 */
export const syncGA4Data = onSchedule(
  {
    schedule: 'every 6 hours',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '512MiB',
    secrets: [bespokePropertyId, gmfgPropertyId],
  },
  async () => {
    const db = getFirestore();
    const startTime = Date.now();

    console.log('GA4_SYNC_START', { timestamp: new Date().toISOString() });

    try {
      const client = new BetaAnalyticsDataClient();

      // Get yesterday's date for completed day data
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = formatDate(yesterday);

      // Sync both properties
      const properties = [
        { name: 'bespoke-ethos', id: bespokePropertyId.value() },
        { name: 'gmfg', id: gmfgPropertyId.value() },
      ];

      const results = await Promise.all(
        properties.map((prop) => syncPropertyData(client, prop.name, prop.id, dateStr, db))
      );

      // Update system state
      await db
        .collection('system')
        .doc('state')
        .set(
          {
            lastGA4Sync: FieldValue.serverTimestamp(),
            ga4SyncStatus: 'success',
            ga4SyncCount: results.reduce((sum, r) => sum + r.count, 0),
          },
          { merge: true }
        );

      const durationMs = Date.now() - startTime;

      console.log('GA4_SYNC_SUCCESS', {
        date: dateStr,
        durationMs,
        properties: results,
      });
    } catch (error) {
      console.error('FLOW_ERROR', {
        flow: 'syncGA4Data',
        step: 'fetch',
        details: error instanceof Error ? error.message : String(error),
      });

      await db
        .collection('system')
        .doc('state')
        .set(
          {
            lastGA4Sync: FieldValue.serverTimestamp(),
            ga4SyncStatus: 'error',
            ga4SyncError: error instanceof Error ? error.message : String(error),
          },
          { merge: true }
        );

      throw error;
    }
  }
);

// Helper functions for GA4 sync
interface GA4Metrics {
  activeUsers: number;
  sessions: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  newUsers: number;
  engagementRate: number;
}

interface PageData {
  path: string;
  views: number;
  avgTime: number;
}

interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
}

interface DailyAnalytics {
  date: string;
  property: string;
  metrics: GA4Metrics;
  topPages: PageData[];
  trafficSources: TrafficSource[];
  fetchedAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  syncType: 'scheduled' | 'manual';
}

async function syncPropertyData(
  client: BetaAnalyticsDataClient,
  propertyName: string,
  propertyId: string,
  date: string,
  db: FirebaseFirestore.Firestore
): Promise<{ property: string; count: number }> {
  try {
    const metrics = await fetchCoreMetrics(client, propertyId, date);
    const topPages = await fetchTopPages(client, propertyId, date);
    const trafficSources = await fetchTrafficSources(client, propertyId, date);

    const analyticsDoc: DailyAnalytics = {
      date,
      property: propertyName,
      metrics,
      topPages,
      trafficSources,
      fetchedAt: FieldValue.serverTimestamp(),
      syncType: 'scheduled',
    };

    const docId = `${propertyName}_${date}`;
    await db.collection('analytics').doc(docId).set(analyticsDoc, { merge: true });

    console.log('PROPERTY_SYNC_SUCCESS', {
      property: propertyName,
      date,
      sessions: metrics.sessions,
    });

    return { property: propertyName, count: 1 };
  } catch (error) {
    console.error('PROPERTY_SYNC_ERROR', {
      property: propertyName,
      date,
      error: error instanceof Error ? error.message : String(error),
    });
    return { property: propertyName, count: 0 };
  }
}

async function fetchCoreMetrics(
  client: BetaAnalyticsDataClient,
  propertyId: string,
  date: string
): Promise<GA4Metrics> {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: date, endDate: date }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
      { name: 'newUsers' },
      { name: 'engagementRate' },
    ],
  });

  const row = response.rows?.[0];
  const values = row?.metricValues || [];

  return {
    activeUsers: parseInt(values[0]?.value || '0', 10),
    sessions: parseInt(values[1]?.value || '0', 10),
    pageviews: parseInt(values[2]?.value || '0', 10),
    bounceRate: parseFloat(values[3]?.value || '0'),
    avgSessionDuration: parseFloat(values[4]?.value || '0'),
    newUsers: parseInt(values[5]?.value || '0', 10),
    engagementRate: parseFloat(values[6]?.value || '0'),
  };
}

async function fetchTopPages(
  client: BetaAnalyticsDataClient,
  propertyId: string,
  date: string
): Promise<PageData[]> {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: date, endDate: date }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'averageSessionDuration' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10,
  });

  return (response.rows || []).map((row) => ({
    path: row.dimensionValues?.[0]?.value || '/',
    views: parseInt(row.metricValues?.[0]?.value || '0', 10),
    avgTime: parseFloat(row.metricValues?.[1]?.value || '0'),
  }));
}

async function fetchTrafficSources(
  client: BetaAnalyticsDataClient,
  propertyId: string,
  date: string
): Promise<TrafficSource[]> {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: date, endDate: date }],
    dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
    metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10,
  });

  return (response.rows || []).map((row) => ({
    source: row.dimensionValues?.[0]?.value || '(direct)',
    medium: row.dimensionValues?.[1]?.value || '(none)',
    sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
    users: parseInt(row.metricValues?.[1]?.value || '0', 10),
  }));
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Firestore Backup - Scheduled daily at 2 AM UTC
 * Exports Firestore collections to Cloud Storage
 */
export const scheduledFirestoreBackup = onSchedule(
  {
    schedule: '0 2 * * *', // 2 AM UTC daily
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '256MiB',
  },
  async () => {
    const startTime = Date.now();
    const db = getFirestore();

    console.log('FIRESTORE_BACKUP_START', { timestamp: new Date().toISOString() });

    try {
      // Use the Firestore Admin API to export
      // Note: This requires google-cloud/firestore-admin-client or REST API
      // For now, we'll use the REST API approach
      const projectId = process.env.GCLOUD_PROJECT || 'bespokeethos-analytics-475007';
      const bucketName = `${projectId}-firestore-backups`;
      const timestamp = new Date().toISOString().split('T')[0];
      const outputUriPrefix = `gs://${bucketName}/${timestamp}`;

      // Collections to backup
      const collections = ['leads', 'analytics', 'system', 'cache', 'embeddings', 'competitors'];

      // Import google-auth-library for authentication
      const { GoogleAuth } = await import('google-auth-library');
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/datastore'],
      });
      const client = await auth.getClient();

      // Call Firestore export API
      const exportUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):exportDocuments`;

      const response = await client.request({
        url: exportUrl,
        method: 'POST',
        data: {
          outputUriPrefix,
          collectionIds: collections,
        },
      });

      // Log the operation name for tracking
      const operationName = (response.data as { name?: string })?.name || 'unknown';

      // Store backup metadata
      await db.collection('system').doc('backups').set(
        {
          lastBackup: FieldValue.serverTimestamp(),
          lastBackupStatus: 'success',
          lastBackupOperation: operationName,
          lastBackupUri: outputUriPrefix,
          collections,
        },
        { merge: true }
      );

      const durationMs = Date.now() - startTime;

      console.log('FIRESTORE_BACKUP_SUCCESS', {
        operationName,
        outputUriPrefix,
        collections,
        durationMs,
      });
    } catch (error) {
      console.error('FIRESTORE_BACKUP_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      });

      // Store error state
      await db
        .collection('system')
        .doc('backups')
        .set(
          {
            lastBackup: FieldValue.serverTimestamp(),
            lastBackupStatus: 'error',
            lastBackupError: error instanceof Error ? error.message : String(error),
          },
          { merge: true }
        );

      throw error;
    }
  }
);

/**
 * Rate Limit Cleanup - Scheduled every hour
 * Cleans up expired rate limit entries from Firestore
 */
export const scheduledRateLimitCleanup = onSchedule(
  {
    schedule: '0 * * * *', // Every hour
    region: 'us-central1',
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async () => {
    const { cleanupRateLimits } = await import('./lib/rate-limit');

    console.log('RATE_LIMIT_CLEANUP_START', { timestamp: new Date().toISOString() });

    try {
      const deletedCount = await cleanupRateLimits();

      console.log('RATE_LIMIT_CLEANUP_SUCCESS', {
        deletedCount,
      });
    } catch (error) {
      console.error('RATE_LIMIT_CLEANUP_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

// Define SendGrid secret
const sendgridApiKey = defineSecret('SENDGRID_API_KEY');

/**
 * Email Processor - Scheduled every 15 minutes
 * Processes pending scheduled emails and sends them
 */
export const scheduledEmailProcessor = onSchedule(
  {
    schedule: '*/15 * * * *', // Every 15 minutes
    region: 'us-central1',
    timeoutSeconds: 120,
    memory: '256MiB',
    secrets: [sendgridApiKey],
  },
  async () => {
    const { getPendingEmailsToSend, sendEmail, markEmailSent, markEmailFailed } =
      await import('./lib/email');

    console.log('EMAIL_PROCESSOR_START', { timestamp: new Date().toISOString() });

    try {
      const pendingEmails = await getPendingEmailsToSend();

      if (pendingEmails.length === 0) {
        console.log('EMAIL_PROCESSOR_COMPLETE', { processed: 0 });
        return;
      }

      let sent = 0;
      let failed = 0;

      for (const email of pendingEmails) {
        if (!email.id) continue;

        const result = await sendEmail(
          {
            to: email.email,
            toName: email.name,
            subject: email.subject,
            template: email.template,
            variables: email.variables,
          },
          sendgridApiKey.value()
        );

        if (result.success) {
          await markEmailSent(email.id);
          sent++;
        } else {
          await markEmailFailed(email.id, result.error || 'Unknown error');
          failed++;
        }

        // Small delay between sends to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log('EMAIL_PROCESSOR_COMPLETE', {
        processed: pendingEmails.length,
        sent,
        failed,
      });
    } catch (error) {
      console.error('EMAIL_PROCESSOR_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);
