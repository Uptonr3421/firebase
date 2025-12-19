/**
 * Cloud Functions for Prometheus AI
 * Exposes Genkit flows as callable endpoints
 */

import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

// Initialize Firebase Admin
initializeApp();

// Define secrets
const geminiKey = defineSecret('GEMINI_API_KEY');

// Import Genkit flows
// Note: These imports reference the parent project's src directory
import {
  chatbotFlow,
  competitorWatchFlow,
  contentDrafterFlow,
  marketingBriefFlow,
  opportunityScannerFlow,
  selfHealingFlow,
} from '../../src/ai/flows';

import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from './lib/rate-limit';
import { alertHighValueLead } from './lib/slack';

// Note: Sentry init moved to runtime (inside functions) to avoid deployment errors
// initSentry() is called lazily when first function executes

// High-value lead threshold
const HIGH_VALUE_LEAD_SCORE = 75;

/**
 * Chatbot - Conversational AI assistant
 * Callable function for real-time chat interactions
 */
export const chatbot = onCall(
  {
    secrets: [geminiKey],
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (request) => {
    try {
      const input = request.data || {};
      if (!input.messages || !Array.isArray(input.messages)) {
        throw new HttpsError('invalid-argument', 'messages array is required');
      }
      const result = await chatbotFlow(input);
      return { success: true, data: result };
    } catch (error) {
      console.error('FUNCTION_ERROR', {
        function: 'chatbot',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Marketing Brief - Generate daily executive summary from GA4 data
 * Callable function that triggers the marketing brief flow
 */
export const marketingBrief = onCall(
  {
    secrets: [geminiKey],
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      const input = request.data || {};
      const result = await marketingBriefFlow(input);
      return { success: true, data: result };
    } catch (error) {
      console.error('FUNCTION_ERROR', {
        function: 'marketingBrief',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Competitor Watch - Monitor competitor websites for changes
 * Callable function that triggers the competitor watch flow
 */
export const competitorWatch = onCall(
  {
    secrets: [geminiKey],
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 120,
  },
  async (request) => {
    try {
      const input = request.data || {};
      const result = await competitorWatchFlow(input);
      return { success: true, data: result };
    } catch (error) {
      console.error('FUNCTION_ERROR', {
        function: 'competitorWatch',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Self Healing - Auto-diagnose and restart failed services
 * Callable function that triggers the self-healing flow
 */
export const selfHealing = onCall(
  {
    secrets: [geminiKey],
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (request) => {
    try {
      const input = request.data || {};
      const result = await selfHealingFlow(input);
      return { success: true, data: result };
    } catch (error) {
      console.error('FUNCTION_ERROR', {
        function: 'selfHealing',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Opportunity Scanner - Detect leads from NGLCC, events, news
 * Callable function that triggers the opportunity scanner flow
 */
export const opportunityScanner = onCall(
  {
    secrets: [geminiKey],
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 120,
  },
  async (request) => {
    try {
      const input = request.data || {};
      const result = await opportunityScannerFlow(input);
      return { success: true, data: result };
    } catch (error) {
      console.error('FUNCTION_ERROR', {
        function: 'opportunityScanner',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Content Drafter - Generate SEO content based on trends
 * Callable function that triggers the content drafter flow
 */
export const contentDrafter = onCall(
  {
    secrets: [geminiKey],
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 90,
  },
  async (request) => {
    try {
      const input = request.data || {};
      const result = await contentDrafterFlow(input);
      return { success: true, data: result };
    } catch (error) {
      console.error('FUNCTION_ERROR', {
        function: 'contentDrafter',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Lead Capture - Submit and score leads
 * Callable function for contact form submissions
 */
export const submitLead = onCall(
  {
    region: 'us-central1',
    cors: true,
  },
  async (request) => {
    const db = getFirestore();

    // Rate limiting
    const clientId = getClientIdentifier(request as never);
    const rateLimit = await checkRateLimit(clientId, RATE_LIMITS.submitLead);

    if (!rateLimit.allowed) {
      throw new HttpsError(
        'resource-exhausted',
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.retryAfterMs || 60000) / 1000)} seconds.`
      );
    }

    try {
      // Validate input
      const {
        email,
        name,
        company,
        phone,
        message,
        source = 'contact_form',
        referrer,
      } = request.data;

      if (!email || !name || !message) {
        throw new HttpsError('invalid-argument', 'Missing required fields');
      }

      // Check for duplicate (same email in last 24 hours)
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const duplicates = await db
        .collection('leads')
        .where('email', '==', email.toLowerCase())
        .where('createdAt', '>', dayAgo)
        .limit(1)
        .get();

      if (!duplicates.empty) {
        return { success: true, message: 'Lead already exists', duplicate: true };
      }

      // Calculate lead score
      let score = 50; // Base score
      if (company) score += 15;
      if (phone) score += 10;
      if (message.length > 100) score += 5;
      if (message.length > 200) score += 5;
      if (message.length > 300) score += 5;
      const emailDomain = email.split('@')[1];
      if (!['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(emailDomain)) {
        score += 20; // Business email
      }
      if (source === 'demo_request') score += 25;

      // Create lead document
      const leadRef = await db.collection('leads').add({
        email: email.toLowerCase(),
        name,
        company: company || null,
        phone: phone || null,
        message,
        source,
        referrer: referrer || null,
        score,
        status: 'new',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log('LEAD_CAPTURED', {
        leadId: leadRef.id,
        email,
        score,
        source,
      });

      // Alert on high-value leads
      if (score >= HIGH_VALUE_LEAD_SCORE) {
        await alertHighValueLead({
          name,
          email,
          company,
          score,
          source,
          message,
        }).catch((err) => {
          console.error('SLACK_ALERT_FAILED', { error: String(err) });
        });
      }

      // Schedule welcome email sequence
      try {
        const { scheduleEmailsForLead } = await import('./lib/email');
        const scheduledCount = await scheduleEmailsForLead(
          leadRef.id,
          email.toLowerCase(),
          name,
          company || null,
          'new'
        );
        console.log('EMAILS_SCHEDULED', { leadId: leadRef.id, count: scheduledCount });
      } catch (emailError) {
        console.error('EMAIL_SCHEDULE_FAILED', { error: String(emailError) });
        // Don't fail the lead capture if email scheduling fails
      }

      return {
        success: true,
        message: 'Lead captured successfully',
        leadId: leadRef.id,
        score,
      };
    } catch (error) {
      console.error('FUNCTION_ERROR', {
        function: 'submitLead',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Update Lead Status - Update lead and trigger appropriate email sequences
 * Callable function for status transitions
 */
export const updateLeadStatus = onCall(
  {
    region: 'us-central1',
  },
  async (request) => {
    const db = getFirestore();

    try {
      const { leadId, newStatus } = request.data;

      if (!leadId || !newStatus) {
        throw new HttpsError('invalid-argument', 'leadId and newStatus are required');
      }

      const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
      if (!validStatuses.includes(newStatus)) {
        throw new HttpsError(
          'invalid-argument',
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        );
      }

      // Get current lead
      const leadRef = db.collection('leads').doc(leadId);
      const leadDoc = await leadRef.get();

      if (!leadDoc.exists) {
        throw new HttpsError('not-found', 'Lead not found');
      }

      const leadData = leadDoc.data()!;
      const previousStatus = leadData.status;

      // Update lead status
      await leadRef.update({
        status: newStatus,
        previousStatus,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Handle email sequences based on status change
      const { scheduleEmailsForLead, cancelPendingEmails } = await import('./lib/email');

      // Cancel pending nurture emails if converting or lost
      if (newStatus === 'converted' || newStatus === 'lost') {
        await cancelPendingEmails(leadId);
      }

      // Schedule new emails for status-triggered sequences
      if (newStatus === 'qualified' || newStatus === 'converted') {
        await scheduleEmailsForLead(
          leadId,
          leadData.email,
          leadData.name,
          leadData.company,
          newStatus
        );
      }

      console.log('LEAD_STATUS_UPDATED', {
        leadId,
        previousStatus,
        newStatus,
      });

      return {
        success: true,
        message: 'Lead status updated',
        leadId,
        previousStatus,
        newStatus,
      };
    } catch (error) {
      console.error('FUNCTION_ERROR', {
        function: 'updateLeadStatus',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Brand Positioning - Generate brand strategy
 * Callable function that triggers the brand positioning flow
 */
export const brandPositioning = onCall(
  {
    secrets: [geminiKey],
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 90,
  },
  async (request) => {
    try {
      const input = request.data || {};
      const { brandPositioningFlow } = await import('../../src/ai/flows/brand-positioning');
      const result = await brandPositioningFlow(input);
      return { success: true, data: result };
    } catch (error) {
      console.error('FUNCTION_ERROR', {
        function: 'brandPositioning',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Semantic Search - Vector similarity search across embeddings
 * Callable function for searching stored documents
 */
export const semanticSearch = onCall(
  {
    secrets: [geminiKey],
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    // Rate limiting for AI flows
    const clientId = getClientIdentifier(request as never);
    const rateLimit = await checkRateLimit(clientId, RATE_LIMITS.aiFlow);

    if (!rateLimit.allowed) {
      throw new HttpsError(
        'resource-exhausted',
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.retryAfterMs || 60000) / 1000)} seconds.`
      );
    }

    try {
      const { query, limit = 5, minScore = 0.7 } = request.data || {};

      if (!query || typeof query !== 'string') {
        throw new HttpsError('invalid-argument', 'query string is required');
      }

      const { searchSimilar } = await import('../../src/lib/embeddings');
      const results = await searchSimilar(query, limit, minScore);

      return { success: true, data: results };
    } catch (error) {
      console.error('FUNCTION_ERROR', {
        function: 'semanticSearch',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Store Embedding - Store a document with its vector embedding
 * Callable function for indexing documents
 */
export const storeEmbeddingDoc = onCall(
  {
    secrets: [geminiKey],
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    // Rate limiting for AI flows
    const clientId = getClientIdentifier(request as never);
    const rateLimit = await checkRateLimit(clientId, RATE_LIMITS.aiFlow);

    if (!rateLimit.allowed) {
      throw new HttpsError(
        'resource-exhausted',
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.retryAfterMs || 60000) / 1000)} seconds.`
      );
    }

    try {
      const { id, content, metadata = {} } = request.data || {};

      if (!id || typeof id !== 'string') {
        throw new HttpsError('invalid-argument', 'id string is required');
      }
      if (!content || typeof content !== 'string') {
        throw new HttpsError('invalid-argument', 'content string is required');
      }

      const { storeEmbedding } = await import('../../src/lib/embeddings');
      await storeEmbedding(id, content, metadata);

      return { success: true, message: 'Embedding stored successfully', id };
    } catch (error) {
      console.error('FUNCTION_ERROR', {
        function: 'storeEmbeddingDoc',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

// Export scheduled functions
export * from './scheduled';
