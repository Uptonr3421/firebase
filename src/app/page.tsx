"use client";

import { useState } from "react";
import { functions_api } from "@/lib/firebase";
import type {
  MarketingBriefResponse,
  CompetitorWatchResponse,
  ContentDrafterResponse,
  OpportunityScannerResponse,
  SelfHealingResponse,
} from "@/lib/types";

export default function Home() {
  const [loading, setLoading] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<"online" | "checking">(
    "online"
  );

  const handleMarketingBrief = async () => {
    try {
      setLoading("brief");
      const result = await functions_api.marketingBrief({
        dateRange: "last7days",
        properties: ["bespoke-ethos", "gmfg"],
      });
      const data = result.data as MarketingBriefResponse;
      console.log("Marketing Brief:", data);
      alert(`Brief generated! Summary: ${data.summary}`);
    } catch (error) {
      console.error("Error generating brief:", error);
      alert("Error generating brief. Check console for details.");
    } finally {
      setLoading(null);
    }
  };

  const handleCompetitorCheck = async () => {
    try {
      setLoading("competitors");
      const result = await functions_api.competitorWatch({
        checkType: "quick",
      });
      const data = result.data as CompetitorWatchResponse;
      console.log("Competitor Watch:", data);
      alert(`Competitor check complete! ${data.summary}`);
    } catch (error) {
      console.error("Error checking competitors:", error);
      alert("Error checking competitors. Check console for details.");
    } finally {
      setLoading(null);
    }
  };

  const handleContentDraft = async () => {
    try {
      setLoading("content");
      const result = await functions_api.contentDrafter({
        topic: "AI-Powered Business Intelligence",
        contentType: "blog",
        tone: "professional",
      });
      const data = result.data as ContentDrafterResponse;
      console.log("Content Draft:", data);
      alert(`Content drafted! Title: ${data.title}`);
    } catch (error) {
      console.error("Error drafting content:", error);
      alert("Error drafting content. Check console for details.");
    } finally {
      setLoading(null);
    }
  };

  const handleOpportunitySearch = async () => {
    try {
      setLoading("opportunities");
      const result = await functions_api.opportunityScanner({
        sources: ["nglcc", "news"],
        industry: "consulting",
      });
      const data = result.data as OpportunityScannerResponse;
      console.log("Opportunities:", data);
      alert(`Found ${data.totalFound} opportunities! ${data.summary}`);
    } catch (error) {
      console.error("Error scanning opportunities:", error);
      alert("Error scanning opportunities. Check console for details.");
    } finally {
      setLoading(null);
    }
  };

  const handleSystemCheck = async () => {
    try {
      setSystemStatus("checking");
      const result = await functions_api.selfHealing({ checkAll: true });
      const data = result.data as SelfHealingResponse;
      console.log("System Health:", data);
      setSystemStatus("online");
    } catch (error) {
      console.error("Error checking system:", error);
      setSystemStatus("online");
    }
  };
  return (
    <main className="min-h-screen safe-top safe-bottom p-4">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Prometheus AI</h1>
        <p className="text-gray-400 text-sm">Executive Prosthetic</p>
      </header>

      <section className="space-y-4">
        {/* Status Card */}
        <button
          onClick={handleSystemCheck}
          className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:bg-zinc-800 transition-colors w-full text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">System Status</span>
            <span
              className={`w-2 h-2 rounded-full ${
                systemStatus === "online"
                  ? "bg-green-500 animate-pulse"
                  : "bg-yellow-500"
              }`}
            />
          </div>
          <p className="text-lg font-medium">
            {systemStatus === "online" ? "Online" : "Checking..."}
          </p>
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleMarketingBrief}
            disabled={loading !== null}
            className="bg-zinc-900 hover:bg-zinc-800 rounded-xl p-4 border border-zinc-800 text-left transition-colors disabled:opacity-50"
          >
            <span className="text-2xl mb-2 block">📊</span>
            <span className="font-medium">
              {loading === "brief" ? "Loading..." : "Daily Brief"}
            </span>
          </button>
          <button
            onClick={handleCompetitorCheck}
            disabled={loading !== null}
            className="bg-zinc-900 hover:bg-zinc-800 rounded-xl p-4 border border-zinc-800 text-left transition-colors disabled:opacity-50"
          >
            <span className="text-2xl mb-2 block">🔍</span>
            <span className="font-medium">
              {loading === "competitors" ? "Loading..." : "Competitors"}
            </span>
          </button>
          <button
            onClick={handleContentDraft}
            disabled={loading !== null}
            className="bg-zinc-900 hover:bg-zinc-800 rounded-xl p-4 border border-zinc-800 text-left transition-colors disabled:opacity-50"
          >
            <span className="text-2xl mb-2 block">✍️</span>
            <span className="font-medium">
              {loading === "content" ? "Loading..." : "Content"}
            </span>
          </button>
          <button
            onClick={handleOpportunitySearch}
            disabled={loading !== null}
            className="bg-zinc-900 hover:bg-zinc-800 rounded-xl p-4 border border-zinc-800 text-left transition-colors disabled:opacity-50"
          >
            <span className="text-2xl mb-2 block">🎯</span>
            <span className="font-medium">
              {loading === "opportunities" ? "Loading..." : "Opportunities"}
            </span>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <h2 className="text-sm text-gray-400 mb-3">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-sm">
                ✓
              </span>
              <div>
                <p className="text-sm font-medium">Morning brief generated</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center text-sm">
                ⚡
              </span>
              <div>
                <p className="text-sm font-medium">Competitor scan complete</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
