"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap, AlertTriangle } from "lucide-react";
import {
  ETHEREUM_SEPOLIA_CHAIN_ID,
  CHAINLINK_ETH_USD_FEED,
  CHAINLINK_BTC_USD_FEED,
  CHAINLINK_SOL_USD_FEED,
} from "@/lib/constants";
import { OracleFeedState, OracleSnapshotRecord } from "@/types";

export type { OracleFeedState, OracleSnapshotRecord };

const DEFAULT_FEEDS: OracleFeedState[] = [
  {
    symbol: "ETH/USD",
    name: "Ethereum / US Dollar",
    price: 0,
    decimals: 8,
    roundId: "0",
    updatedAt: new Date(0).toISOString(),
    heartbeatSec: 3600,
    contractAddress: CHAINLINK_ETH_USD_FEED,
    chainId: ETHEREUM_SEPOLIA_CHAIN_ID,
    status: "HEALTHY",
  },
  {
    symbol: "BTC/USD",
    name: "Bitcoin / US Dollar",
    price: 0,
    decimals: 8,
    roundId: "0",
    updatedAt: new Date(0).toISOString(),
    heartbeatSec: 3600,
    contractAddress: CHAINLINK_BTC_USD_FEED,
    chainId: ETHEREUM_SEPOLIA_CHAIN_ID,
    status: "HEALTHY",
  },
  {
    symbol: "SOL/USD",
    name: "Solana / US Dollar",
    price: 0,
    decimals: 8,
    roundId: "0",
    updatedAt: new Date(0).toISOString(),
    heartbeatSec: 3600,
    contractAddress: CHAINLINK_SOL_USD_FEED,
    chainId: ETHEREUM_SEPOLIA_CHAIN_ID,
    status: "HEALTHY",
  },
];

export default function AdminOracleMonitor() {
  const [feeds, setFeeds] = useState<OracleFeedState[]>(DEFAULT_FEEDS);
  const [selectedAsset, setSelectedAsset] = useState<string>("ETH");
  const [snapshotType, setSnapshotType] = useState<string>("RESOLUTION");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [adminKey, setAdminKey] = useState<string>("");
  const [snapshotLogs, setSnapshotLogs] = useState<OracleSnapshotRecord[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchLiveFeeds = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/oracle/feeds");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.feeds) && json.feeds.length > 0) {
          setFeeds(json.feeds);
          setNotification({
            message: "Chainlink live aggregator round state refreshed directly from on-chain RPC.",
            type: "success",
          });
        }
      }
    } catch {
      setNotification({
        message: "Failed to connect to Oracle RPC feed endpoint.",
        type: "error",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const fetchLiveSnapshots = useCallback(async () => {
    try {
      const res = await fetch("/api/oracle/snapshot?limit=10");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.snapshots) && json.snapshots.length > 0) {
          setSnapshotLogs(json.snapshots);
        }
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchLiveFeeds();
    fetchLiveSnapshots();
  }, [fetchLiveFeeds, fetchLiveSnapshots]);

  const handleRecordSnapshot = async () => {
    setIsRecording(true);
    setNotification(null);
    try {
      const res = await fetch("/api/oracle/snapshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          asset: selectedAsset,
          snapshot_type: snapshotType,
          source: "chainlink",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setNotification({
          message: `Snapshot successfully recorded for ${selectedAsset} at $${json.data?.price || "N/A"}`,
          type: "success",
        });
        if (json.data) {
          setSnapshotLogs((prev) => [json.data, ...prev]);
        }
        fetchLiveFeeds();
      } else {
        setNotification({
          message: json.error || "Failed to record oracle snapshot.",
          type: "error",
        });
      }
    } catch {
      setNotification({
        message: "Network error occurred while attempting to record oracle snapshot.",
        type: "error",
      });
    } finally {
      setIsRecording(false);
    }
  };

  const handleRefreshFeeds = () => {
    fetchLiveFeeds();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Chainlink Data Feeds
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-accent-navy dark:text-white">
            Oracle Pipeline & Live Feeds Monitor
          </h2>
          <p className="text-xs sm:text-sm text-text-muted dark:text-[#A9B3AD]">
            Real-time AggregatorV3Interface feeds, heartbeat health, and on-chain snapshot triggers for market resolution.
          </p>
        </div>

        <button
          type="button"
          aria-label="Refresh Round Data"
          onClick={handleRefreshFeeds}
          disabled={isRefreshing}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-2 border bg-white hover:bg-emerald-50/50 border-emerald-500/20 text-accent-navy shadow-xs dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white dark:shadow-none ${
            isRefreshing ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <svg className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Round Data</span>
        </button>
      </div>

      {notification && (
        <div
          role="status"
          className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm animate-slide-down ${
            notification.type === "success"
              ? "bg-yes-green-soft dark:bg-yes-green/10 border-yes-green/30 text-yes-green"
              : "bg-no-red/10 border-no-red/30 text-no-red"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{notification.type === "success" ? <Zap className="w-4 h-4 text-yes-green" /> : <AlertTriangle className="w-4 h-4 text-no-red" />}</span>
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-bold font-mono opacity-80 hover:opacity-100"
          >
            DISMISS
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {feeds.map((feed) => (
          <div
            key={feed.symbol}
            className="p-6 rounded-2xl border transition-all hover-lift bg-white border-emerald-500/15 shadow-xs dark:bg-[#0A0F0C] dark:border-white/10 dark:shadow-none"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted dark:text-[#A9B3AD]">
                {feed.name}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                {feed.status}
              </span>
            </div>

            <div className="text-3xl font-black font-mono text-accent-navy dark:text-white">
              ${feed.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <div className="mt-4 pt-4 border-t border-border-subtle dark:border-white/5 space-y-2 text-[11px] font-mono">
              <div className="flex justify-between text-text-muted dark:text-[#A9B3AD]">
                <span>Feed Symbol:</span>
                <span className="font-semibold text-accent-navy dark:text-white">{feed.symbol}</span>
              </div>
              <div className="flex justify-between text-text-muted dark:text-[#A9B3AD]">
                <span>Contract Address:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[130px]">
                  {feed.contractAddress}
                </span>
              </div>
              <div className="flex justify-between text-text-muted dark:text-[#A9B3AD]">
                <span>Heartbeat:</span>
                <span>{feed.heartbeatSec}s</span>
              </div>
              <div className="flex justify-between text-text-muted dark:text-[#A9B3AD]">
                <span>Latest Update:</span>
                <span>{new Date(feed.updatedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border lg:col-span-1 space-y-4 bg-white border-emerald-500/15 shadow-xs dark:bg-[#0A0F0C] dark:border-white/10 dark:shadow-none">
          <div>
            <h3 className="text-base font-extrabold text-accent-navy dark:text-white">
              Trigger Oracle Snapshot
            </h3>
            <p className="text-xs text-text-muted dark:text-[#A9B3AD] mt-0.5">
              Record immutable price point on Supabase & smart contract for resolution settlement.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-text-muted dark:text-[#A9B3AD] mb-1">
                Select Asset
              </label>
              <select
                aria-label="Oracle Snapshot Asset"
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-gray-50 border-emerald-500/20 text-accent-navy dark:bg-black/40 dark:border-white/10 dark:text-white"
              >
                <option value="ETH">ETH (Ethereum)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="SOL">SOL (Solana)</option>
                <option value="LINK">LINK (Chainlink)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-text-muted dark:text-[#A9B3AD] mb-1">
                Snapshot Type
              </label>
              <select
                aria-label="Oracle Snapshot Type"
                value={snapshotType}
                onChange={(e) => setSnapshotType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-gray-50 border-emerald-500/20 text-accent-navy dark:bg-black/40 dark:border-white/10 dark:text-white"
              >
                <option value="RESOLUTION">RESOLUTION (End Time Settlement)</option>
                <option value="DISPLAY">DISPLAY (Live Price Tick)</option>
                <option value="BASELINE">BASELINE (Market Creation Open)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-text-muted dark:text-[#A9B3AD] mb-1">
                Admin Secret Key
              </label>
              <input
                aria-label="Admin Secret Key"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter ADMIN_SECRET_KEY"
                className="w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-gray-50 border-emerald-500/20 text-accent-navy dark:bg-black/40 dark:border-white/10 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={handleRecordSnapshot}
              disabled={isRecording}
              className={`w-full mt-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isRecording
                  ? "opacity-50 cursor-not-allowed bg-emerald-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              }`}
            >
              {isRecording ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Recording Snapshot...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Execute Snapshot</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl border lg:col-span-2 space-y-4 bg-white border-emerald-500/15 shadow-xs dark:bg-[#0A0F0C] dark:border-white/10 dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-accent-navy dark:text-white">
                Recent Oracle Snapshots
              </h3>
              <p className="text-xs text-text-muted dark:text-[#A9B3AD]">
                Historical timestamped logs stored on protocol database.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-text-muted">
              {snapshotLogs.length} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-border-subtle dark:border-white/10 text-text-muted dark:text-[#A9B3AD]">
                  <th className="pb-2">Asset</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Source</th>
                  <th className="pb-2 text-right">Recorded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle dark:divide-white/5">
                {snapshotLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-text-muted dark:text-[#A9B3AD]">
                      No recent oracle snapshots found.
                    </td>
                  </tr>
                ) : (
                  snapshotLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-emerald-500/5 transition-colors">
                      <td className="py-2.5 font-bold text-accent-navy dark:text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {log.asset}
                      </td>
                      <td className="py-2.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        ${log.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10">
                          {log.snapshot_type}
                        </span>
                      </td>
                      <td className="py-2.5 text-text-muted dark:text-[#A9B3AD]">
                        {log.source}
                      </td>
                      <td className="py-2.5 text-right text-text-muted dark:text-[#A9B3AD]">
                        {new Date(log.recorded_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
