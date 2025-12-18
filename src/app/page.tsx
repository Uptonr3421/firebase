'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import FlowResultModal from '@/components/FlowResultModal';
import type { Activity, FlowResult } from '@/types/flows';

// Color mapping for activity icons - ensures Tailwind classes are included in build
const colorClasses = {
  blue: 'bg-blue-500/20 text-blue-400',
  purple: 'bg-purple-500/20 text-purple-400',
  green: 'bg-green-500/20 text-green-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  red: 'bg-red-500/20 text-red-400',
} as const;

export default function Home() {
  const [loadingFlow, setLoadingFlow] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<FlowResult | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  // Load recent activity from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('recentActivity');
    if (stored) {
      try {
        setRecentActivity(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent activity', e);
      }
    }
  }, []);

  // Save recent activity to localStorage whenever it changes
  useEffect(() => {
    if (recentActivity.length > 0) {
      localStorage.setItem('recentActivity', JSON.stringify(recentActivity));
    }
  }, [recentActivity]);

  const addActivity = (
    flowName: string,
    title: string,
    icon: string,
    color: Activity['color']
  ) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      flowName,
      title,
      timestamp: new Date().toISOString(),
      icon,
      color,
    };
    setRecentActivity((prev) => [newActivity, ...prev].slice(0, 10)); // Keep last 10
  };

  const runFlow = async (
    flowName: string,
    title: string,
    icon: string,
    color: Activity['color'],
    input: any = {}
  ) => {
    setLoadingFlow(flowName);
    setError(null);

    try {
      const response = await fetch(`/api/flows/${flowName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to run flow');
      }

      // Show result in modal
      setSelectedResult({
        flowName,
        data: result.data,
        timestamp: new Date().toISOString(),
      });

      // Add to recent activity
      addActivity(flowName, title, icon, color);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      console.error('Flow execution error:', err);
    } finally {
      setLoadingFlow(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  return (
    <main className="min-h-screen safe-top safe-bottom px-4 pb-6">
      <header className="py-6 mb-4">
        <h1 className="text-3xl font-bold">Prometheus AI</h1>
        <p className="text-gray-400 text-base mt-1">Executive Prosthetic</p>
      </header>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 active:scale-[0.98] transition-transform">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-red-400 text-base leading-relaxed">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-3 text-sm text-red-400 hover:text-red-300 underline active:scale-95 transition-transform"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-5">
        {/* Status Card */}
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base text-gray-400">System Status</span>
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          </div>
          <p className="text-xl font-medium">Online</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => runFlow('marketing-brief', 'Daily brief generated', '✓', 'blue')}
            disabled={loadingFlow !== null}
            className="bg-zinc-900 active:bg-zinc-800 rounded-2xl p-6 border border-zinc-800 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed relative min-h-[120px] active:scale-[0.97]"
          >
            {loadingFlow === 'marketing-brief' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <>
                <span className="text-4xl mb-3 block">📊</span>
                <span className="font-medium text-base">Daily Brief</span>
              </>
            )}
          </button>
          <button
            onClick={() => runFlow('competitor-watch', 'Competitor scan complete', '⚡', 'purple')}
            disabled={loadingFlow !== null}
            className="bg-zinc-900 active:bg-zinc-800 rounded-2xl p-6 border border-zinc-800 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed relative min-h-[120px] active:scale-[0.97]"
          >
            {loadingFlow === 'competitor-watch' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <>
                <span className="text-4xl mb-3 block">🔍</span>
                <span className="font-medium text-base">Competitors</span>
              </>
            )}
          </button>
          <button
            onClick={() =>
              runFlow('content-drafter', 'Content draft created', '✍️', 'green', {
                topic: 'AI consulting services',
              })
            }
            disabled={loadingFlow !== null}
            className="bg-zinc-900 active:bg-zinc-800 rounded-2xl p-6 border border-zinc-800 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed relative min-h-[120px] active:scale-[0.97]"
          >
            {loadingFlow === 'content-drafter' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <>
                <span className="text-4xl mb-3 block">✍️</span>
                <span className="font-medium text-base">Content</span>
              </>
            )}
          </button>
          <button
            onClick={() =>
              runFlow('opportunity-scanner', 'Opportunities scanned', '🎯', 'yellow')
            }
            disabled={loadingFlow !== null}
            className="bg-zinc-900 active:bg-zinc-800 rounded-2xl p-6 border border-zinc-800 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed relative min-h-[120px] active:scale-[0.97]"
          >
            {loadingFlow === 'opportunity-scanner' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <>
                <span className="text-4xl mb-3 block">🎯</span>
                <span className="font-medium text-base">Opportunities</span>
              </>
            )}
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <h2 className="text-base font-medium text-gray-400 mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-base text-gray-500 text-center py-6">
              No recent activity. Click a button above to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <span
                    className={`w-10 h-10 ${colorClasses[activity.color]} rounded-xl flex items-center justify-center text-base`}
                  >
                    {activity.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium line-clamp-2" title={activity.title}>
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Result Modal */}
      <FlowResultModal result={selectedResult} onClose={() => setSelectedResult(null)} />
    </main>
  );
}
