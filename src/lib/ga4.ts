/**
 * Google Analytics 4 Data API Client
 * Fetches real analytics data with Firestore caching
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

// GA4 Property IDs - will be loaded from Secret Manager at runtime
let PROPERTY_IDS: Record<string, string> | null = null;

// Cache duration: 6 hours
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;

/**
 * GA4 Analytics Data Interface
 */
export interface GA4AnalyticsData {
  sessions: number;
  users: number;
  bounceRate: number;
  avgDuration: number;
  topPages: string[];
  topSources: string[];
  dateRange: string;
  property: string;
  cachedAt?: string;
}

/**
 * Date range options for GA4 queries
 */
export type DateRangeOption = 'today' | 'yesterday' | 'last7days' | 'last30days';

/**
 * Initialize property IDs from Secret Manager
 * This should be called when secrets are available in the function context
 */
export function setPropertyIds(bespoke: string, gmfg: string) {
  PROPERTY_IDS = {
    'bespoke-ethos': bespoke,
    'gmfg': gmfg,
  };
}

/**
 * Get property ID for a given property name
 */
function getPropertyId(property: string): string {
  if (!PROPERTY_IDS) {
    throw new Error('Property IDs not initialized. Call setPropertyIds() first.');
  }
  
  const propertyId = PROPERTY_IDS[property];
  if (!propertyId) {
    throw new Error(`Unknown property: ${property}`);
  }
  
  return propertyId;
}

/**
 * Convert date range option to GA4 date range format
 */
function getDateRange(dateRange: DateRangeOption): { startDate: string; endDate: string } {
  switch (dateRange) {
    case 'today':
      return { startDate: 'today', endDate: 'today' };
    case 'yesterday':
      return { startDate: 'yesterday', endDate: 'yesterday' };
    case 'last7days':
      return { startDate: '7daysAgo', endDate: 'today' };
    case 'last30days':
      return { startDate: '30daysAgo', endDate: 'today' };
    default:
      return { startDate: '7daysAgo', endDate: 'today' };
  }
}

/**
 * Get cache key for Firestore
 */
function getCacheKey(property: string, dateRange: string): string {
  return `${property}_${dateRange}`;
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(cachedAt: string): boolean {
  const cacheTime = new Date(cachedAt).getTime();
  const now = Date.now();
  return (now - cacheTime) < CACHE_DURATION_MS;
}

/**
 * Get cached analytics data from Firestore
 */
async function getCachedData(
  property: string,
  dateRange: string
): Promise<GA4AnalyticsData | null> {
  try {
    const cacheKey = getCacheKey(property, dateRange);
    const docRef = db.collection('analytics').doc(cacheKey);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as GA4AnalyticsData;
    if (!data.cachedAt || !isCacheValid(data.cachedAt)) {
      // Cache expired
      return null;
    }

    console.log('GA4_CACHE_HIT', { property, dateRange });
    return data;
  } catch (error) {
    console.error('GA4_CACHE_READ_ERROR', {
      property,
      dateRange,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Save analytics data to Firestore cache
 */
async function cacheData(
  property: string,
  dateRange: string,
  data: GA4AnalyticsData
): Promise<void> {
  try {
    const cacheKey = getCacheKey(property, dateRange);
    const docRef = db.collection('analytics').doc(cacheKey);
    
    await docRef.set({
      ...data,
      cachedAt: new Date().toISOString(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log('GA4_CACHE_WRITE', { property, dateRange });
  } catch (error) {
    console.error('GA4_CACHE_WRITE_ERROR', {
      property,
      dateRange,
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't throw - caching failure shouldn't break the flow
  }
}

/**
 * Fetch analytics data from GA4 API
 */
async function fetchFromGA4(
  propertyId: string,
  property: string,
  dateRange: DateRangeOption
): Promise<GA4AnalyticsData> {
  const analyticsDataClient = new BetaAnalyticsDataClient();
  const { startDate, endDate } = getDateRange(dateRange);

  try {
    // Request 1: Core metrics (sessions, users, bounce rate, avg duration)
    const [metricsResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
    });

    // Request 2: Top pages
    const [pagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      limit: 5,
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    });

    // Request 3: Top sources
    const [sourcesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [{ name: 'sessions' }],
      limit: 5,
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    });

    // Parse core metrics
    const metricsRow = metricsResponse.rows?.[0];
    const sessions = parseInt(metricsRow?.metricValues?.[0]?.value || '0', 10);
    const users = parseInt(metricsRow?.metricValues?.[1]?.value || '0', 10);
    const bounceRate = parseFloat(metricsRow?.metricValues?.[2]?.value || '0');
    const avgDuration = parseFloat(metricsRow?.metricValues?.[3]?.value || '0');

    // Parse top pages
    const topPages = (pagesResponse.rows || [])
      .map(row => row.dimensionValues?.[0]?.value || '')
      .filter(page => page !== '');

    // Parse top sources
    const topSources = (sourcesResponse.rows || [])
      .map(row => row.dimensionValues?.[0]?.value || '')
      .filter(source => source !== '');

    const analyticsData: GA4AnalyticsData = {
      sessions,
      users,
      bounceRate,
      avgDuration,
      topPages,
      topSources,
      dateRange,
      property,
    };

    console.log('GA4_API_SUCCESS', { property, dateRange, sessions, users });

    return analyticsData;
  } catch (error) {
    console.error('GA4_API_ERROR', {
      property,
      dateRange,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get analytics data for a property with caching
 * 
 * @param property - Property name ('bespoke-ethos' or 'gmfg')
 * @param dateRange - Date range option
 * @returns Analytics data (from cache or fresh from GA4 API)
 */
export async function getAnalyticsData(
  property: string,
  dateRange: DateRangeOption = 'last7days'
): Promise<GA4AnalyticsData> {
  try {
    // Check cache first
    const cachedData = await getCachedData(property, dateRange);
    if (cachedData) {
      return cachedData;
    }

    // Fetch from GA4 API
    const propertyId = getPropertyId(property);
    const data = await fetchFromGA4(propertyId, property, dateRange);

    // Cache the result
    await cacheData(property, dateRange, data);

    return data;
  } catch (error) {
    console.error('GA4_GET_DATA_ERROR', {
      property,
      dateRange,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error(`Failed to get analytics data for ${property}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get aggregated analytics data for multiple properties
 * 
 * @param properties - Array of property names
 * @param dateRange - Date range option
 * @returns Aggregated analytics data
 */
export async function getAggregatedAnalyticsData(
  properties: string[],
  dateRange: DateRangeOption = 'last7days'
): Promise<GA4AnalyticsData> {
  try {
    // Fetch data for all properties in parallel
    const dataPromises = properties.map(property => 
      getAnalyticsData(property, dateRange)
    );
    const allData = await Promise.all(dataPromises);

    // Guard against empty data
    if (allData.length === 0) {
      throw new Error('No analytics data returned for any property');
    }

    // Aggregate the data
    const aggregated: GA4AnalyticsData = {
      sessions: allData.reduce((sum, data) => sum + data.sessions, 0),
      users: allData.reduce((sum, data) => sum + data.users, 0),
      bounceRate: allData.reduce((sum, data) => sum + data.bounceRate, 0) / allData.length,
      avgDuration: allData.reduce((sum, data) => sum + data.avgDuration, 0) / allData.length,
      topPages: [...new Set(allData.flatMap(data => data.topPages))].slice(0, 5),
      topSources: [...new Set(allData.flatMap(data => data.topSources))].slice(0, 5),
      dateRange,
      property: properties.join(', '),
    };

    console.log('GA4_AGGREGATED_SUCCESS', {
      properties,
      dateRange,
      totalSessions: aggregated.sessions,
      totalUsers: aggregated.users,
    });

    return aggregated;
  } catch (error) {
    console.error('GA4_AGGREGATED_ERROR', {
      properties,
      dateRange,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
