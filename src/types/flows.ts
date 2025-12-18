/**
 * Shared types for flow results and activities
 */

export interface FlowResult {
  flowName: string;
  data: any;
  timestamp: string;
}

export interface Activity {
  id: string;
  flowName: string;
  title: string;
  timestamp: string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'red';
}

export interface MarketingBriefData {
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

export interface CompetitorChange {
  competitor: string;
  changeType: 'pricing' | 'messaging' | 'features' | 'design' | 'content';
  description: string;
  severity: 'low' | 'medium' | 'high';
  detectedAt: string;
}

export interface CompetitorWatchData {
  changes: CompetitorChange[];
  summary: string;
  actionRequired: boolean;
  confidence: number;
}

export interface ContentDrafterData {
  title: string;
  content: string;
  metaDescription: string;
  suggestedKeywords: string[];
  readabilityScore: number;
  confidence: number;
}

export interface Opportunity {
  title: string;
  source: string;
  description: string;
  relevanceScore: number;
  estimatedValue: string;
  deadline: string | null;
  url: string | null;
  detectedAt: string;
}

export interface OpportunityScannerData {
  opportunities: Opportunity[];
  summary: string;
  totalFound: number;
  highPriority: number;
}
