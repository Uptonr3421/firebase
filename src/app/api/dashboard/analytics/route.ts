/**
 * Dashboard Analytics API Route
 * Fetches GA4 analytics data from Firestore cache
 */

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Firebase Admin
function getDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'bespokeethos-analytics-475007',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;

    // Parse query params
    const property = searchParams.get('property') || 'bespoke-ethos';
    const days = parseInt(searchParams.get('days') || '7', 10);

    // Calculate date range
    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i - 1); // Start from yesterday
      dates.push(date.toISOString().split('T')[0]);
    }

    // Fetch analytics documents
    const analyticsData = await Promise.all(
      dates.map(async (date) => {
        const docId = `${property}_${date}`;
        const doc = await db.collection('analytics').doc(docId).get();
        return doc.exists ? { date, ...doc.data() } : null;
      })
    );

    // Filter out null values and sort by date
    type DayData = {
      date: string;
      metrics?: {
        sessions?: number;
        pageviews?: number;
        activeUsers?: number;
        newUsers?: number;
      };
      topPages?: Array<{ path: string; views: number; avgTime: number }>;
      trafficSources?: Array<{ source: string; medium: string; sessions: number; users: number }>;
    };
    const validData = (analyticsData.filter((d) => d !== null) as DayData[]).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Calculate totals
    const totals = validData.reduce(
      (acc, day) => {
        const metrics = day.metrics || {};
        return {
          sessions: acc.sessions + (metrics.sessions || 0),
          pageviews: acc.pageviews + (metrics.pageviews || 0),
          activeUsers: acc.activeUsers + (metrics.activeUsers || 0),
          newUsers: acc.newUsers + (metrics.newUsers || 0),
        };
      },
      { sessions: 0, pageviews: 0, activeUsers: 0, newUsers: 0 }
    );

    // Aggregate top pages
    const allPages = validData.flatMap((d) => d.topPages || []);
    const pageMap = new Map<string, { views: number; avgTime: number; count: number }>();
    allPages.forEach((page) => {
      const existing = pageMap.get(page.path);
      if (existing) {
        existing.views += page.views;
        existing.avgTime += page.avgTime;
        existing.count += 1;
      } else {
        pageMap.set(page.path, { views: page.views, avgTime: page.avgTime, count: 1 });
      }
    });
    const topPages = Array.from(pageMap.entries())
      .map(([path, data]) => ({
        path,
        views: data.views,
        avgTime: data.avgTime / data.count,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Aggregate traffic sources
    const allSources = validData.flatMap((d) => d.trafficSources || []);
    const sourceMap = new Map<string, { sessions: number; users: number }>();
    allSources.forEach((source) => {
      const key = `${source.source}/${source.medium}`;
      const existing = sourceMap.get(key);
      if (existing) {
        existing.sessions += source.sessions;
        existing.users += source.users;
      } else {
        sourceMap.set(key, { sessions: source.sessions, users: source.users });
      }
    });
    const trafficSources = Array.from(sourceMap.entries())
      .map(([key, data]) => {
        const [source, medium] = key.split('/');
        return { source, medium, ...data };
      })
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        property,
        dateRange: { start: dates[dates.length - 1], end: dates[0] },
        daysWithData: validData.length,
        totals,
        daily: validData,
        topPages,
        trafficSources,
      },
    });
  } catch (error) {
    console.error('DASHBOARD_ANALYTICS_ERROR', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
