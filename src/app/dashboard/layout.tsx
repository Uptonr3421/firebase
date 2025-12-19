/**
 * Dashboard Layout
 * Main layout for admin/analytics dashboard
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Prometheus AI',
  description: 'Analytics and AI insights dashboard',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white">
        <div className="flex h-16 items-center justify-center border-b border-gray-800">
          <h1 className="text-xl font-bold">Prometheus AI</h1>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          <NavItem href="/dashboard" icon="📊" label="Overview" />
          <NavItem href="/dashboard/leads" icon="👥" label="Leads" />
          <NavItem href="/dashboard/analytics" icon="📈" label="Analytics" />
          <NavItem href="/dashboard/competitors" icon="🔍" label="Competitors" />
          <NavItem href="/dashboard/content" icon="✍️" label="Content" />
          <NavItem href="/dashboard/settings" icon="⚙️" label="Settings" />
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Run AI Flow
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
}
