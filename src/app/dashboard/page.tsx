/**
 * Dashboard Overview Page
 * Shows key metrics and recent activity
 */

import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Leads" value="--" change="+12%" icon="👥" />
        <StatCard title="Sessions Today" value="--" change="+8%" icon="📊" />
        <StatCard title="Conversion Rate" value="--%" change="+2.1%" icon="📈" />
        <StatCard title="AI Flows Run" value="--" change="+15" icon="🤖" />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Recent Leads</h3>
          <Suspense fallback={<LoadingSkeleton />}>
            <RecentLeadsTable />
          </Suspense>
        </div>

        {/* AI Activity */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">AI Activity</h3>
          <Suspense fallback={<LoadingSkeleton />}>
            <AIActivityFeed />
          </Suspense>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionButton
            label="Generate Marketing Brief"
            description="Daily executive summary from GA4"
            icon="�"
          />
          <ActionButton
            label="Run Competitor Watch"
            description="Check for competitor changes"
            icon="🔎"
          />
          <ActionButton
            label="Draft Content"
            description="AI-powered content generation"
            icon="📄"
          />
          <ActionButton
            label="Scan Opportunities"
            description="Find new leads from NGLCC"
            icon="🎯"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: string;
}) {
  const isPositive = change.startsWith('+');

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  description,
  icon,
}: {
  label: string;
  description: string;
  icon: string;
}) {
  return (
    <button className="flex flex-col items-start rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-blue-500 hover:bg-blue-50">
      <span className="text-2xl">{icon}</span>
      <span className="mt-2 font-medium text-gray-900">{label}</span>
      <span className="text-sm text-gray-500">{description}</span>
    </button>
  );
}

function RecentLeadsTable() {
  // This would fetch from API in production
  const leads = [{ name: 'Loading...', email: '---', score: 0, status: 'new' }];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">Score</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-3">
                <p className="font-medium text-gray-900">{lead.name}</p>
                <p className="text-gray-500">{lead.email}</p>
              </td>
              <td className="py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    lead.score >= 75
                      ? 'bg-green-100 text-green-700'
                      : lead.score >= 50
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {lead.score}
                </span>
              </td>
              <td className="py-3">
                <span className="capitalize text-gray-600">{lead.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AIActivityFeed() {
  const activities = [{ type: 'Loading...', time: '---', status: 'pending' }];

  return (
    <div className="space-y-4">
      {activities.map((activity, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <span className="text-sm">🤖</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{activity.type}</p>
            <p className="text-xs text-gray-500">{activity.time}</p>
          </div>
          <span
            className={`text-xs ${
              activity.status === 'success'
                ? 'text-green-600'
                : activity.status === 'error'
                  ? 'text-red-600'
                  : 'text-gray-400'
            }`}
          >
            {activity.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-3/4 rounded bg-gray-200" />
      <div className="h-4 w-1/2 rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
    </div>
  );
}
