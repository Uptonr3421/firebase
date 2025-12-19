/**
 * Type definitions for Prometheus AI function responses
 */

export interface MarketingBriefResponse {
  summary: string;
  highlights: string[];
  recommendations: string[];
  metrics: {
    totalSessions: number;
    totalUsers: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  confidence: number;
  generatedAt: string;
}

export interface CompetitorWatchResponse {
  changes: Array<{
    competitor: string;
    changeType: "pricing" | "messaging" | "features" | "design" | "content";
    description: string;
    severity: "low" | "medium" | "high";
    detectedAt: string;
  }>;
  summary: string;
  actionRequired: boolean;
  confidence: number;
}

export interface ContentDrafterResponse {
  title: string;
  content: string;
  metaDescription: string;
  suggestedKeywords: string[];
  readabilityScore: number;
  confidence: number;
}

export interface OpportunityScannerResponse {
  opportunities: Array<{
    title: string;
    source: string;
    description: string;
    relevanceScore: number;
    estimatedValue: string;
    deadline: string | null;
    url: string | null;
    detectedAt: string;
  }>;
  summary: string;
  totalFound: number;
  highPriority: number;
}

export interface SelfHealingResponse {
  status: "healthy" | "degraded" | "critical";
  services: Array<{
    name: string;
    status: "ok" | "warning" | "error";
    lastCheck: string;
    message: string;
  }>;
  actionsTaken: string[];
  recommendations: string[];
}
