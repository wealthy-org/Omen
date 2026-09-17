"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";
import { mockPredictionMarket } from "../lib/mockPredictionMarket";

export interface ConnectWalletButtonProps {
  initialStatus?: "disconnected" | "connecting" | "connected";
  initialAddress?: string;
  initialBalance?: string;
  className?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export default function ConnectWalletButton({
  initialStatus = "disconnected",
  initialAddress,
  initialBalance,
  className = "",
  onConnect,
  onDisconnect,
}: ConnectWalletButtonProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const defaultDemo = mockPredictionMarket.getDemoWallet();
  const activeAddress = initialAddress !== undefined ? initialAddress : defaultDemo.address;
  const activeBalance = initialBalance !== undefined ? initialBalance : defaultDemo.formattedBalance;

  const [statusOverride, setStatusOverride] = useState<"disconnected" | "connecting" | "connected" | null>(null);
  const [addressOverride, setAddressOverride] = useState<string | null>(null);
  const [balanceOverride, setBalanceOverride] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const status = statusOverride ?? initialStatus;
  const address = addressOverride ?? activeAddress;
  const balance = balanceOverride ?? activeBalance;

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const syncWalletToDatabase = async (walletAddr: string) => {
    try {
      await fetch("/api/wallet/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet_address: walletAddr }),
      });
    } catch {
    }
  };

  const handleConnect = () => {
    setStatusOverride("connecting");
    if (onConnect) {
      onConnect();
    }

    const timer = setTimeout(() => {
      const demo = mockPredictionMarket.getDemoWallet();
      const finalAddr = initialAddress !== undefined ? initialAddress : demo.address;
      const finalBal = initialBalance !== undefined ? initialBalance : demo.formattedBalance;
      setAddressOverride(finalAddr);
      setBalanceOverride(finalBal);
      setStatusOverride("connected");
      syncWalletToDatabase(finalAddr);
    }, 600);

    return () => clearTimeout(timer);
  };

  const handleDisconnect = () => {
    setIsDropdownOpen(false);
    setStatusOverride("disconnected");
    if (onDisconnect) {
      onDisconnect();
    }
  };

  const handleCopyAddress = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(address);
      } catch {
      }
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const formatAddress = (addr: string) => {
    if (!addr || addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (status === "connecting") {
    return (
      <button
        type="button"
        disabled
        aria-busy="true"
        aria-label="Connecting wallet"
        className={`px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 cursor-not-allowed bg-primary-blue/80 text-white ${className}`}
      >
        <svg
          className="w-4 h-4 animate-spin text-white"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Connecting...</span>
      </button>
    );
  }

  if (status === "connected") {
    return (
      <div
        ref={dropdownRef}
        className={`relative inline-flex items-center rounded-xl p-1 border transition-all ${
          isDark
            ? "bg-white/5 border-white/10 hover:border-white/20"
            : "bg-white/90 border-emerald-500/10 hover:border-emerald-500/20 shadow-xs"
        } ${className}`}
      >
        <span
          className={`px-3 text-xs font-mono font-medium hidden sm:inline-block ${
            isDark ? "text-[#DCE5DF]" : "text-[#4B5D55]"
          }`}
        >
          {balance}
        </span>

        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-haspopup="menu"
          aria-expanded={isDropdownOpen}
          aria-label="Wallet menu"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-xs text-xs font-mono font-semibold transition-all cursor-pointer ${
            isDark
              ? "bg-[#0A0F0C] border-white/10 text-white hover:bg-white/10"
              : "bg-white border-border-subtle text-accent-navy hover:bg-slate-50"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-yes-green animate-pulse" />
          <span className="font-mono">{formatAddress(address)}</span>
          <svg
            className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div
            role="menu"
            aria-label="Wallet options"
            className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-xl py-1.5 z-50 border backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150 ${
              isDark
                ? "bg-[#0A0F0C]/95 border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
                : "bg-white/95 border-emerald-500/10 text-[#0B1F16] shadow-[0_8px_30px_rgba(14,122,78,0.1)]"
            }`}
          >
            <div className="px-3.5 py-1.5 mb-1 border-b border-white/5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Demo Wallet (Mock Mode)
              </span>
            </div>

            <button
              type="button"
              role="menuitem"
              onClick={handleCopyAddress}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? "hover:bg-white/10 text-[#DCE5DF] hover:text-white"
                  : "hover:bg-emerald-50/70 text-[#17241D] hover:text-[#0B1F16]"
              }`}
            >
              <span className="flex items-center gap-2">
                {copied ? (
                  <svg className="w-3.5 h-3.5 text-yes-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                <span>{copied ? "Copied!" : "Copy Address"}</span>
              </span>
              <span className="text-[10px] font-mono text-text-muted uppercase">EVM</span>
            </button>

            <a
              role="menuitem"
              href={`https://sepolia.arbiscan.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                isDark
                  ? "hover:bg-white/10 text-[#DCE5DF] hover:text-white"
                  : "hover:bg-emerald-50/70 text-[#17241D] hover:text-[#0B1F16]"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>View on Explorer</span>
              </span>
              <svg className="w-3 h-3 text-text-muted opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>

            <div className={`h-[1px] my-1 mx-2 ${isDark ? "bg-white/10" : "bg-emerald-500/10"}`} />

            <button
              type="button"
              role="menuitem"
              onClick={handleDisconnect}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium rounded-lg text-no-red transition-colors cursor-pointer ${
                isDark ? "hover:bg-no-red/10" : "hover:bg-no-red-soft"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Disconnect</span>
              </span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      className={`bg-primary-blue text-white hover:bg-primary-blue-hover active:scale-[0.98] px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer ${className}`}
    >
      <svg
        className="w-4 h-4 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
      <span>Connect Wallet</span>
    </button>
  );
}
