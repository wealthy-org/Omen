"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";

export interface AdminLoginFormProps {
  onLoginSuccess: (adminAddress: string) => void;
  authorizedAddresses?: string[];
  className?: string;
}

const DEFAULT_AUTHORIZED_ADMINS = [
  "0x1234567890abcdef1234567890abcdef12345678".toLowerCase(),
  "0xAdmin99999999999999999999999999999999999".toLowerCase(),
  (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || "").toLowerCase(),
].filter(Boolean);

const VALID_MASTER_KEYS = [
  "omen-admin-2026",
  "omen-master-key-arbitrum",
  (process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || "").trim(),
].filter(Boolean);

export default function AdminLoginForm({
  onLoginSuccess,
  authorizedAddresses = DEFAULT_AUTHORIZED_ADMINS,
  className = "",
}: AdminLoginFormProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [authMethod, setAuthMethod] = useState<"wallet" | "key">("wallet");
  const [walletInput, setWalletInput] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const isEVMAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const now = Date.now();
    if (lockoutUntil && now < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
      setErrorMessage(
        `Security Cooldown: Too many failed login attempts. Please wait ${remainingSeconds}s before retrying.`
      );
      return;
    }

    const trimmed = walletInput.trim();
    if (!trimmed) {
      setErrorMessage("Please enter an administrative Web3 wallet address.");
      return;
    }

    if (!isEVMAddress(trimmed)) {
      setErrorMessage(
        "Invalid EVM address format. Address must start with '0x' followed by 40 hexadecimal characters."
      );
      return;
    }

    setIsAuthenticating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const isAuthorized = authorizedAddresses.includes(trimmed.toLowerCase());

      if (!isAuthorized) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 4) {
          setLockoutUntil(Date.now() + 15000);
          setErrorMessage(
            "Security Lockout: 4 failed attempts recorded. System temporarily locked for 15 seconds."
          );
        } else {
          setErrorMessage(
            `Access Denied: Wallet address ${trimmed} is not recognized in the protocol governance whitelist. (Attempt ${nextAttempts}/4)`
          );
        }
        return;
      }

      setFailedAttempts(0);
      setLockoutUntil(null);
      onLoginSuccess(trimmed);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const now = Date.now();
    if (lockoutUntil && now < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
      setErrorMessage(
        `Security Cooldown: Too many failed login attempts. Please wait ${remainingSeconds}s before retrying.`
      );
      return;
    }

    const trimmedKey = accessKey.trim();
    if (!trimmedKey) {
      setErrorMessage("Administrator master access key is required.");
      return;
    }

    if (trimmedKey.length < 6) {
      setErrorMessage("Master access key must be at least 6 characters in length.");
      return;
    }

    setIsAuthenticating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const isValid = VALID_MASTER_KEYS.includes(trimmedKey);

      if (!isValid) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 4) {
          setLockoutUntil(Date.now() + 15000);
          setErrorMessage(
            "Security Lockout: 4 failed attempts recorded. System temporarily locked for 15 seconds."
          );
        } else {
          setErrorMessage(
            `Invalid Administrative Access Key. Authentication signature rejected. (Attempt ${nextAttempts}/4)`
          );
        }
        return;
      }

      setFailedAttempts(0);
      setLockoutUntil(null);
      onLoginSuccess("0x1234567890abcdef1234567890abcdef12345678");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setErrorMessage(null);
    if (authMethod === "wallet") {
      setWalletInput("0x1234567890abcdef1234567890abcdef12345678");
    } else {
      setAccessKey("omen-admin-2026");
    }
  };

  return (
    <div className={`w-full max-w-[440px] mx-auto ${className}`}>
      <div
        className={`relative overflow-hidden rounded-[22px] p-6 sm:p-7 transition-all duration-300 border ${
          isDark
            ? "bg-[#030906] border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            : "bg-gradient-to-b from-white via-[#FAFCFA] to-[#E2F7ED] border-emerald-500/15 shadow-[0_16px_40px_rgba(14,122,78,0.06),_inset_0_1px_0_rgba(255,255,255,1)]"
        }`}
      >
        <div
          className={`absolute top-0 inset-x-0 h-[1.5px] pointer-events-none ${
            isDark ? "dark-emerald-seam" : "light-emerald-seam"
          }`}
        />

        <div className="text-center mb-5">
          <h1
            className={`text-xl sm:text-2xl font-black tracking-tight leading-tight ${
              isDark ? "text-white" : "text-[#0B1F16]"
            }`}
          >
            Admin Authentication
          </h1>

          <p
            className={`text-xs mt-1 leading-relaxed ${
              isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
            }`}
          >
            Authenticate with your whitelisted governance address or protocol master key.
          </p>
        </div>

        <div
          className={`flex rounded-xl p-1 mb-5 border ${
            isDark
              ? "bg-white/[0.03] border-white/10"
              : "bg-black/[0.03] border-emerald-500/10"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMethod("wallet");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === "wallet"
                ? isDark
                  ? "bg-white/10 text-white shadow-xs border border-white/10"
                  : "bg-white text-[#0B1F16] shadow-xs border border-emerald-500/15"
                : "text-text-muted hover:text-accent-navy dark:hover:text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Admin Wallet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod("key");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === "key"
                ? isDark
                  ? "bg-white/10 text-white shadow-xs border border-white/10"
                  : "bg-white text-[#0B1F16] shadow-xs border border-emerald-500/15"
                : "text-text-muted hover:text-accent-navy dark:hover:text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span>Master Key</span>
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl border border-no-red/30 bg-no-red-soft dark:bg-no-red/10 text-no-red text-xs flex items-start gap-2 animate-in fade-in"
          >
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {authMethod === "wallet" ? (
          <form noValidate onSubmit={handleWalletSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-wallet-input"
                className="block text-[11px] font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-1.5"
              >
                Admin Whitelist Wallet Address <span className="text-no-red">*</span>
              </label>
              <input
                id="admin-wallet-input"
                type="text"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                placeholder="0x1234...5678"
                aria-label="Admin Whitelist Wallet Address"
                className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs sm:text-sm font-medium transition-all outline-none ${
                  isDark
                    ? "bg-[#0A0F0C] border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/60"
                    : "bg-white border-emerald-500/20 text-[#0B1F16] placeholder:text-[#0B1F16]/40 focus:border-emerald-500"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className={`w-full py-3 rounded-[12px] text-sm font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                isAuthenticating
                  ? "opacity-60 cursor-not-allowed bg-emerald-600 text-white"
                  : isDark
                  ? "text-[#030906]"
                  : "text-white bg-[#10221A] hover:bg-[#183428] shadow-[0_4px_16px_rgba(16,34,26,0.2)]"
              }`}
              style={
                isDark && !isAuthenticating
                  ? {
                      background:
                        "linear-gradient(180deg, #34D399 0%, #047857 100%)",
                      boxShadow:
                        "0 0 25px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
                    }
                  : undefined
              }
            >
              {isAuthenticating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Verifying Whitelist...</span>
                </>
              ) : (
                <span>Authenticate Admin Wallet</span>
              )}
            </button>
          </form>
        ) : (
          <form noValidate onSubmit={handleKeySubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-access-key-input"
                className="block text-[11px] font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-1.5"
              >
                Master Secret Passphrase <span className="text-no-red">*</span>
              </label>
              <div className="relative">
                <input
                  id="admin-access-key-input"
                  type={showPassword ? "text" : "password"}
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Enter administrator key..."
                  aria-label="Master Secret Passphrase"
                  className={`w-full px-3.5 pr-10 py-2.5 rounded-xl border font-mono text-xs sm:text-sm font-medium transition-all outline-none ${
                    isDark
                      ? "bg-[#0A0F0C] border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/60"
                      : "bg-white border-emerald-500/20 text-[#0B1F16] placeholder:text-[#0B1F16]/40 focus:border-emerald-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-accent-navy dark:hover:text-white cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className={`w-full py-3 rounded-[12px] text-sm font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                isAuthenticating
                  ? "opacity-60 cursor-not-allowed bg-emerald-600 text-white"
                  : isDark
                  ? "text-[#030906]"
                  : "text-white bg-[#10221A] hover:bg-[#183428] shadow-[0_4px_16px_rgba(16,34,26,0.2)]"
              }`}
              style={
                isDark && !isAuthenticating
                  ? {
                      background:
                        "linear-gradient(180deg, #34D399 0%, #047857 100%)",
                      boxShadow:
                        "0 0 25px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
                    }
                  : undefined
              }
            >
              {isAuthenticating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Verifying Master Key...</span>
                </>
              ) : (
                <span>Unlock Admin Portal</span>
              )}
            </button>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-border-subtle dark:border-white/10 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleFillDemoAdmin}
            className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold hover:underline cursor-pointer"
          >
            ⚡ Use Demo Admin
          </button>

          <Link
            href="/"
            className="text-[11px] font-medium text-text-muted hover:text-accent-navy dark:hover:text-white transition-colors"
          >
            ← Return to Markets
          </Link>
        </div>
      </div>
    </div>
  );
}
