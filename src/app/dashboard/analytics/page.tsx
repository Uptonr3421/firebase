/**
 * Analytics Dashboard Page
 * View GA4 metrics and trends
 */

'use client';

import { useState } from 'react';

type DateRange = '7d' | '30d' | '90d';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [selectedProperty, setSelectedProperty] = useState<'bespoke-ethos' | 'gmfg'>(
    'bespoke-ethos'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">GA4 metrics and performance insights</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Property Selector */}
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value as typeof selectedProperty)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="bespoke-ethos">Bespoke Ethos</option>
            <option value="gmfg">GMFG</option>
          </select>

          {/* Date Range */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {(['7d', '30d', '90d'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`rounded-md px-3 py-1 text-sm font-medium ${
                  dateRange === range
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Active Users" value="--" change="--%" />
        <MetricCard title="Sessions" value="--" change="--%" />
        <MetricCard title="Page Views" value="--" change="--%" />
        <MetricCard title="Bounce Rate" value="--%" change="--%" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sessions Over Time */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Sessions Over Time</h3>
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
            Chart placeholder - Connect to GA4 data
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Traffic Sources</h3>
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
            Chart placeholder - Connect to GA4 data
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Top Pages</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Page Path</th>
                <th className="pb-3 font-medium">Views</th>
                <th className="pb-3 font-medium">Avg. Time</th>
                <th className="pb-3 font-medium">Bounce Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No data available. Run GA4 sync to populate analytics.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-sm">
        <h3 className="mb-2 text-lg font-semibold">AI Insights</h3>
        <p className="mb-4 text-blue-100">Generate an AI-powered analysis of your analytics data</p>
        <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
          Generate Marketing Brief
        </button>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change }: { title: string; value: string; change: string }) {
  const isPositive = change.startsWith('+') || change === '--';

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span
          className={`text-sm font-medium ${
            change === '--' ? 'text-gray-400' : isPositive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  );
}
