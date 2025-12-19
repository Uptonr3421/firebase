/**
 * Competitor Watch Flow
 * Monitor competitor websites for changes with actual scraping
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';
import { ai, models } from '../genkit';

const CompetitorWatchInput = z.object({
  competitors: z.array(z.string()).default([]),
  checkType: z.enum(['full', 'quick']).default('quick'),
});

const CompetitorWatchOutput = z.object({
  changes: z.array(
    z.object({
      competitor: z.string(),
      changeType: z.enum(['pricing', 'messaging', 'features', 'design', 'content']),
      description: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
      detectedAt: z.string(),
    })
  ),
  summary: z.string(),
  actionRequired: z.boolean(),
  confidence: z.number(),
});

// Default competitors to monitor
const DEFAULT_COMPETITORS = [
  'https://www.certifiedbmarketing.com',
  'https://www.lgbtbe.com',
  'https://nglcc.org',
];

// Lazy Firestore init
let db: FirebaseFirestore.Firestore | null = null;
function getDb() {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

interface CompetitorSnapshot {
  url: string;
  title: string;
  contentHash: string;
  keyPhrases: string[];
  pricingMentions: string[];
  lastChecked: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
}

/**
 * Fetch and extract key content from a competitor page
 */
async function fetchCompetitorContent(
  url: string
): Promise<{ title: string; text: string; status: number }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BespokeEthosBot/1.0; +https://bespokeethos.com)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { title: '', text: '', status: response.status };
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Strip HTML tags and extract text content
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 10000); // Limit to 10k chars

    return { title, text, status: response.status };
  } catch (error) {
    console.error('FETCH_COMPETITOR_ERROR', {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return { title: '', text: '', status: 0 };
  }
}

/**
 * Generate a simple hash for content comparison
 */
function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

/**
 * Extract key phrases and pricing mentions using AI
 */
async function analyzeContent(
  text: string
): Promise<{ keyPhrases: string[]; pricingMentions: string[] }> {
  try {
    const result = await ai.generate({
      model: models.flash,
      prompt: `Analyze this competitor website content and extract:
1. Key marketing phrases/value propositions (up to 5)
2. Any pricing mentions or tiers

Content:
${text.slice(0, 5000)}

Respond in JSON format:
{"keyPhrases": ["phrase1", "phrase2"], "pricingMentions": ["$X/mo for Y", "Free tier available"]}`,
      config: {
        temperature: 0.1,
      },
    });

    try {
      const parsed = JSON.parse(result.text || '{}');
      return {
        keyPhrases: parsed.keyPhrases || [],
        pricingMentions: parsed.pricingMentions || [],
      };
    } catch {
      return { keyPhrases: [], pricingMentions: [] };
    }
  } catch (error) {
    console.error('ANALYZE_CONTENT_ERROR', { error: String(error) });
    return { keyPhrases: [], pricingMentions: [] };
  }
}

/**
 * Compare current snapshot with previous and detect changes
 */
function detectChanges(
  current: CompetitorSnapshot,
  previous: CompetitorSnapshot | null
): Array<{
  changeType: 'pricing' | 'messaging' | 'features' | 'design' | 'content';
  description: string;
  severity: 'low' | 'medium' | 'high';
}> {
  const changes: Array<{
    changeType: 'pricing' | 'messaging' | 'features' | 'design' | 'content';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }> = [];

  if (!previous) {
    return []; // First time seeing this competitor
  }

  // Check content hash change
  if (current.contentHash !== previous.contentHash) {
    changes.push({
      changeType: 'content',
      description: 'Website content has been updated',
      severity: 'low',
    });
  }

  // Check title change
  if (current.title !== previous.title) {
    changes.push({
      changeType: 'messaging',
      description: `Title changed from "${previous.title}" to "${current.title}"`,
      severity: 'medium',
    });
  }

  // Check for new key phrases
  const newPhrases = current.keyPhrases.filter((p) => !previous.keyPhrases.includes(p));
  if (newPhrases.length > 0) {
    changes.push({
      changeType: 'messaging',
      description: `New marketing phrases detected: ${newPhrases.join(', ')}`,
      severity: 'medium',
    });
  }

  // Check for pricing changes
  const newPricing = current.pricingMentions.filter((p) => !previous.pricingMentions.includes(p));
  if (newPricing.length > 0) {
    changes.push({
      changeType: 'pricing',
      description: `Pricing changes detected: ${newPricing.join(', ')}`,
      severity: 'high',
    });
  }

  return changes;
}

export const competitorWatchFlow = ai.defineFlow(
  {
    name: 'competitorWatchFlow',
    inputSchema: CompetitorWatchInput,
    outputSchema: CompetitorWatchOutput,
  },
  async (input) => {
    const firestore = getDb();
    const competitors = input.competitors.length > 0 ? input.competitors : DEFAULT_COMPETITORS;
    const allChanges: Array<{
      competitor: string;
      changeType: 'pricing' | 'messaging' | 'features' | 'design' | 'content';
      description: string;
      severity: 'low' | 'medium' | 'high';
      detectedAt: string;
    }> = [];

    console.log('COMPETITOR_WATCH_START', {
      competitorCount: competitors.length,
      checkType: input.checkType,
    });

    try {
      for (const url of competitors) {
        // Fetch current content
        const { title, text, status } = await fetchCompetitorContent(url);

        if (status === 0 || !text) {
          console.warn('COMPETITOR_FETCH_FAILED', { url, status });
          continue;
        }

        // Generate content hash and analyze
        const contentHash = hashContent(text);
        const { keyPhrases, pricingMentions } =
          input.checkType === 'full'
            ? await analyzeContent(text)
            : { keyPhrases: [], pricingMentions: [] };

        const currentSnapshot: CompetitorSnapshot = {
          url,
          title,
          contentHash,
          keyPhrases,
          pricingMentions,
          lastChecked: FieldValue.serverTimestamp(),
        };

        // Get previous snapshot
        const docId = url.replace(/[^a-zA-Z0-9]/g, '_');
        const prevDoc = await firestore.collection('competitors').doc(docId).get();
        const previous = prevDoc.exists ? (prevDoc.data() as CompetitorSnapshot) : null;

        // Detect changes
        const changes = detectChanges(currentSnapshot, previous);
        changes.forEach((change) => {
          allChanges.push({
            competitor: url,
            ...change,
            detectedAt: new Date().toISOString(),
          });
        });

        // Save current snapshot
        await firestore.collection('competitors').doc(docId).set(currentSnapshot);

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Generate summary with AI
      const hasHighSeverity = allChanges.some((c) => c.severity === 'high');
      let summary = 'No significant competitor changes detected.';

      if (allChanges.length > 0) {
        const summaryResult = await ai.generate({
          model: models.flash,
          prompt: `Summarize these competitor changes for a business owner in 2-3 sentences:
${JSON.stringify(allChanges, null, 2)}

Focus on actionable insights and competitive implications.`,
        });
        summary = summaryResult.text || summary;
      }

      console.log('COMPETITOR_WATCH_COMPLETE', {
        changesFound: allChanges.length,
        highSeverity: hasHighSeverity,
      });

      return {
        changes: allChanges,
        summary,
        actionRequired: hasHighSeverity,
        confidence: allChanges.length > 0 ? 0.85 : 0.95,
      };
    } catch (error) {
      console.error('FLOW_ERROR', {
        flow: 'competitorWatchFlow',
        step: 'analyze',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);
