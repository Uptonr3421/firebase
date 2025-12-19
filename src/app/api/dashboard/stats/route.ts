/**
 * Dashboard Stats API Route
 * Fetches key metrics for dashboard overview
 */

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

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

export async function GET() {
  try {
    const db = getDb();
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Get leads stats
    const leadsSnapshot = await db.collection('leads').get();
    const leads = leadsSnapshot.docs.map((doc) => doc.data());

    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === 'new').length;
    const highValueLeads = leads.filter((l) => l.score >= 75).length;

    // Get today's analytics (if available)
    const analyticsDoc = await db.collection('analytics').doc(`bespoke-ethos_${today}`).get();
    const analytics = analyticsDoc.exists ? analyticsDoc.data() : null;

    // Get AI flow execution count (from system state)
    const systemDoc = await db.collection('system').doc('state').get();
    const systemState = systemDoc.exists ? systemDoc.data() : null;

    // Calculate conversion rate
    const convertedLeads = leads.filter((l) => l.status === 'converted').length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        highValueLeads,
        conversionRate: `${conversionRate}%`,
        sessionsToday: analytics?.metrics?.sessions || 0,
        pageviewsToday: analytics?.metrics?.pageviews || 0,
        lastGA4Sync: systemState?.lastGA4Sync || null,
        ga4SyncStatus: systemState?.ga4SyncStatus || 'unknown',
      },
    });
  } catch (error) {
    console.error('DASHBOARD_STATS_ERROR', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
