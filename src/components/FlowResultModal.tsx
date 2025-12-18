'use client';

import type {
  FlowResult,
  MarketingBriefData,
  CompetitorWatchData,
  ContentDrafterData,
  OpportunityScannerData,
  CompetitorChange,
  Opportunity,
} from '@/types/flows';

interface FlowResultModalProps {
  result: FlowResult | null;
  onClose: () => void;
}

export default function FlowResultModal({ result, onClose }: FlowResultModalProps) {
  if (!result) return null;

  const renderContent = () => {
    const { flowName, data } = result;

    switch (flowName) {
      case 'marketing-brief': {
        const briefData = data as MarketingBriefData;
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Summary</h3>
              <p className="text-white">{briefData.summary}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Highlights</h3>
              <ul className="space-y-2">
                {briefData.highlights?.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span className="text-white">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Recommendations</h3>
              <ul className="space-y-2">
                {briefData.recommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">→</span>
                    <span className="text-white">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
              <div>
                <p className="text-xs text-gray-500">Sessions</p>
                <p className="text-lg font-medium">{briefData.metrics?.totalSessions?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Users</p>
                <p className="text-lg font-medium">{briefData.metrics?.totalUsers?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Bounce Rate</p>
                <p className="text-lg font-medium">{briefData.metrics?.bounceRate}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg Duration</p>
                <p className="text-lg font-medium">{briefData.metrics?.avgSessionDuration}s</p>
              </div>
            </div>
          </div>
        );
      }

      case 'competitor-watch': {
        const compData = data as CompetitorWatchData;
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Summary</h3>
              <p className="text-white">{compData.summary}</p>
            </div>

            {compData.changes && compData.changes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Changes Detected</h3>
                <div className="space-y-3">
                  {compData.changes.map((change, idx) => (
                    <div key={idx} className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{change.competitor}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            change.severity === 'high'
                              ? 'bg-red-500/20 text-red-400'
                              : change.severity === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {change.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{change.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{change.changeType}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'content-drafter': {
        const contentData = data as ContentDrafterData;
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Title</h3>
              <p className="text-lg font-medium text-white">{contentData.title}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Meta Description</h3>
              <p className="text-sm text-gray-300">{contentData.metaDescription}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Content</h3>
              <div className="bg-zinc-800/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-white whitespace-pre-wrap font-sans">
                  {contentData.content}
                </pre>
              </div>
            </div>

            {contentData.suggestedKeywords && contentData.suggestedKeywords.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {contentData.suggestedKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'opportunity-scanner': {
        const oppData = data as OpportunityScannerData;
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Summary</h3>
              <p className="text-white">{oppData.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Total Found</p>
                <p className="text-2xl font-bold text-blue-400">{oppData.totalFound}</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-green-400">{oppData.highPriority}</p>
              </div>
            </div>

            {oppData.opportunities && oppData.opportunities.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Opportunities</h3>
                <div className="space-y-3">
                  {oppData.opportunities.map((opp, idx) => (
                    <div key={idx} className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">{opp.title}</h4>
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                          {Math.round(opp.relevanceScore * 100)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{opp.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{opp.source}</span>
                        <span>{opp.estimatedValue}</span>
                      </div>
                      {opp.deadline && (
                        <p className="text-xs text-yellow-400 mt-2">
                          Deadline: {new Date(opp.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      default:
        return (
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <pre className="text-sm text-white whitespace-pre-wrap overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm safe-bottom">
      <div className="bg-zinc-900 rounded-t-3xl sm:rounded-3xl border-t border-x sm:border border-zinc-800 w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-zinc-800">
          <div className="flex-1 pr-4">
            <h2 className="text-xl sm:text-2xl font-bold capitalize leading-tight">
              {result.flowName.replace(/-/g, ' ')}
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mt-1">
              {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-zinc-800 transition-colors flex-shrink-0"
            aria-label="Close modal"
          >
            <span className="text-3xl leading-none">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 overscroll-contain">{renderContent()}</div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full py-4 bg-zinc-800 active:bg-zinc-700 rounded-xl transition-colors text-base font-medium active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
