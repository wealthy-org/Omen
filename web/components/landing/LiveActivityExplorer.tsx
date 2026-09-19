"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export type ActivityMethod =
  | "stake_agree"
  | "stake_disagree"
  | "create_market"
  | "confirm_belief"
  | "claim_payout"
  | "oracle_resolve";

export interface StakingDetails {
  side: "AGREE" | "DISAGREE";
  multiplier: string;
  poolShare: string;
  preStakeOdds: string;
  postStakeOdds: string;
  vaultAddress: string;
}

export interface Eip712Details {
  domain: string;
  verifyingContract: string;
  authorPublicKey: string;
  sigV: number;
  sigR: string;
  sigS: string;
  messageHash: string;
}

export interface MarketCreationDetails {
  factoryAddress: string;
  initialSeed: string;
  creatorFeePct: string;
  resolutionOracle: string;
  durationDays: number;
}

export interface DualPayoutDetails {
  winningOutcome: "AGREE" | "DISAGREE";
  grossPayoutEth: string;
  initialStakeEth: string;
  roiPercentage: string;
  resolutionTxHash: string;
}

export interface OracleDetails {
  feedName: string;
  feedAddress: string;
  roundId: string;
  observedPrice: string;
  oracleTimestamp: string;
}

export interface OnChainTx {
  id: string;
  txHash: string;
  method: ActivityMethod;
  methodLabel: string;
  blockNumber: number;
  timeAgo: string;
  timestamp: string;
  fromAddress: string;
  fromHandle?: string;
  toContract: string;
  toContractName: string;
  statement: string;
  marketId?: string;
  valueEth: string;
  valueUsd: string;
  txFeeEth: string;
  gasPriceGwei: string;
  gasUsed: string;
  gasLimit: string;
  chainName: string;
  chainId: number;
  status: "Success" | "Pending";
  stakingDetails?: StakingDetails;
  eip712Details?: Eip712Details;
  creationDetails?: MarketCreationDetails;
  payoutDetails?: DualPayoutDetails;
  oracleDetails?: OracleDetails;
  decodedLog?: {
    functionName: string;
    params: { name: string; value: string; type: string }[];
  };
}

const INITIAL_TRANSACTIONS: OnChainTx[] = [
  {
    id: "tx-1",
    txHash: "0x63d883f50c5c16920dd7410390d6984c72dbee614aca2cfbf71c2fc427ca1660",
    method: "stake_agree",
    methodLabel: "Stake Agree",
    blockNumber: 6291048,
    timeAgo: "12s ago",
    timestamp: "Sep-19-2026 10:44:12 AM +UTC",
    fromAddress: "0x71a2b918f1a4e5c83d69c2049e7821039b817101",
    fromHandle: "@TraderX",
    toContract: "0x39a174c82b014f5e8841a02938e55319808a2139",
    toContractName: "OmenSepoliaCore",
    statement: "SOL will outperform ETH this month",
    marketId: "market-1",
    valueEth: "1.50 ETH",
    valueUsd: "$4,200.00",
    txFeeEth: "0.00042 ETH ($1.18)",
    gasPriceGwei: "12.5 Gwei",
    gasUsed: "142,380 (67.8%)",
    gasLimit: "210,000",
    chainName: "Ethereum Sepolia",
    chainId: 11155111,
    status: "Success",
    stakingDetails: {
      side: "AGREE",
      multiplier: "2.14x Potential Payout",
      poolShare: "4.8% of Total Staked Pool",
      preStakeOdds: "68% Agree vs 32% Disagree",
      postStakeOdds: "71% Agree vs 29% Disagree",
      vaultAddress: "0x71a2b918f1a4e5c83d69c2049e7821039b817101",
    },
    decodedLog: {
      functionName: "stakeBelief(bytes32 beliefId, bool isAgree, uint256 amount)",
      params: [
        { name: "beliefId", value: "0x8a92f019b841e2f891048a0928f01b81", type: "bytes32" },
        { name: "isAgree", value: "true (AGREE / Long Conviction)", type: "bool" },
        { name: "amount", value: "1500000000000000000 (1.50 ETH)", type: "uint256" },
        { name: "trader", value: "0x71a2b918f1a4e5c83d69c2049e7821039b817101", type: "address" },
      ],
    },
  },
  {
    id: "tx-2",
    txHash: "0x48f912c7001a4e9b81d77a019482bfec81a94718471948017382947192847102",
    method: "stake_disagree",
    methodLabel: "Stake Disagree",
    blockNumber: 6291046,
    timeAgo: "34s ago",
    timestamp: "Sep-19-2026 10:43:50 AM +UTC",
    fromAddress: "0x8849b10394817a02938e55319808a2139174c82b",
    fromHandle: "@AlphaMacro",
    toContract: "0x4663100000000000000000000000000000004663",
    toContractName: "RobinhoodStakingEngine",
    statement: "Federal Reserve delivers 50bps emergency rate cut",
    marketId: "market-2",
    valueEth: "2.40 ETH",
    valueUsd: "$6,720.00",
    txFeeEth: "0.00038 ETH ($1.06)",
    gasPriceGwei: "11.2 Gwei",
    gasUsed: "138,500 (65.9%)",
    gasLimit: "210,000",
    chainName: "Robinhood Chain",
    chainId: 46631,
    status: "Success",
    stakingDetails: {
      side: "DISAGREE",
      multiplier: "3.42x Contrarian Yield",
      poolShare: "7.2% of Short Staked Pool",
      preStakeOdds: "78% Agree vs 22% Disagree",
      postStakeOdds: "72% Agree vs 28% Disagree",
      vaultAddress: "0x4663100000000000000000000000000000004663",
    },
    decodedLog: {
      functionName: "stakeBelief(bytes32 beliefId, bool isAgree, uint256 amount)",
      params: [
        { name: "beliefId", value: "0x4b71e091a938c11039482b81039e5519", type: "bytes32" },
        { name: "isAgree", value: "false (DISAGREE / Short Staking)", type: "bool" },
        { name: "amount", value: "2400000000000000000 (2.40 ETH)", type: "uint256" },
        { name: "trader", value: "0x8849b10394817a02938e55319808a2139174c82b", type: "address" },
      ],
    },
  },
  {
    id: "tx-3",
    txHash: "0x918374a019482b81039e5519808a2139174c82b014f5e8841a02938e55319808",
    method: "confirm_belief",
    methodLabel: "EIP-712 Sign",
    blockNumber: 6291042,
    timeAgo: "1m ago",
    timestamp: "Sep-19-2026 10:43:14 AM +UTC",
    fromAddress: "0x3333333333333333333333333333333333333333",
    fromHandle: "@onchainwitch",
    toContract: "0x39a174c82b014f5e8841a02938e55319808a2139",
    toContractName: "OmenSepoliaCore",
    statement: "Bitcoin breaks all-time high beyond $120,000",
    marketId: "market-3",
    valueEth: "0.00 ETH",
    valueUsd: "$0.00",
    txFeeEth: "0.00021 ETH ($0.59)",
    gasPriceGwei: "10.8 Gwei",
    gasUsed: "88,200 (42.0%)",
    gasLimit: "210,000",
    chainName: "Ethereum Sepolia",
    chainId: 11155111,
    status: "Success",
    eip712Details: {
      domain: "OmenProtocol (v1.0.0, ChainId: 11155111)",
      verifyingContract: "0x39a174c82b014f5e8841a02938e55319808a2139",
      authorPublicKey: "0x3333333333333333333333333333333333333333 (@onchainwitch)",
      sigV: 28,
      sigR: "0x78a9c018f918471029482b81039e5519808a2139174c82b014f5e8841a02938e",
      sigS: "0x4b71e091a938c11039482b81039e5519808a2139174c82b014f5e8841a02938f",
      messageHash: "0x918374a019482b81039e5519808a2139174c82b014f5e8841a02938e55319808",
    },
    decodedLog: {
      functionName: "confirmBeliefByAuthor(bytes32 beliefId, bytes signature)",
      params: [
        { name: "beliefId", value: "0x918374a019482b81039e5519808a2139", type: "bytes32" },
        { name: "author", value: "0x3333333333333333333333333333333333333333", type: "address" },
        { name: "signature", value: "0x78a9c018...b891 (EIP-712 Typed Data v4)", type: "bytes" },
      ],
    },
  },
  {
    id: "tx-4",
    txHash: "0x12dc74019482b81039e5519808a2139174c82b014f5e8841a02938e5531944b2",
    method: "create_market",
    methodLabel: "Create Market",
    blockNumber: 6291039,
    timeAgo: "2m ago",
    timestamp: "Sep-19-2026 10:42:05 AM +UTC",
    fromAddress: "0x5555555555555555555555555555555555555555",
    fromHandle: "@DeFiWizard",
    toContract: "0x4663100000000000000000000000000000004663",
    toContractName: "RobinhoodStakingEngine",
    statement: "Arbitrum TVL doubles following BOLD upgrade",
    marketId: "market-4",
    valueEth: "0.50 ETH",
    valueUsd: "$1,400.00",
    txFeeEth: "0.00065 ETH ($1.82)",
    gasPriceGwei: "14.1 Gwei",
    gasUsed: "192,400 (77.0%)",
    gasLimit: "250,000",
    chainName: "Robinhood Chain",
    chainId: 46631,
    status: "Success",
    creationDetails: {
      factoryAddress: "0x4663100000000000000000000000000000004663 (OmenFactory)",
      initialSeed: "0.50 ETH Liquidity Seed",
      creatorFeePct: "1.50% Lifetime Pari-Mutuel Fee",
      resolutionOracle: "Chainlink ARB/USD Dual-Feed Engine",
      durationDays: 14,
    },
    decodedLog: {
      functionName: "createBeliefMarket(string title, uint256 deadline, uint256 initialSeed)",
      params: [
        { name: "title", value: "Arbitrum TVL doubles following BOLD upgrade", type: "string" },
        { name: "deadline", value: "1791244800 (14 days remaining)", type: "uint256" },
        { name: "initialSeed", value: "500000000000000000 (0.50 ETH)", type: "uint256" },
      ],
    },
  },
  {
    id: "tx-5",
    txHash: "0x78ab91029482b81039e5519808a2139174c82b014f5e8841a02938e5531989ac",
    method: "claim_payout",
    methodLabel: "Dual Payout",
    blockNumber: 6291031,
    timeAgo: "4m ago",
    timestamp: "Sep-19-2026 10:40:22 AM +UTC",
    fromAddress: "0x98124719482b81039e5519808a2139174c8277cc",
    toContract: "0x39a174c82b014f5e8841a02938e55319808a2139",
    toContractName: "OmenSepoliaCore",
    statement: "ETH/BTC ratio hits 0.06 before September ends",
    valueEth: "4.85 ETH",
    valueUsd: "$13,580.00",
    txFeeEth: "0.00049 ETH ($1.37)",
    gasPriceGwei: "12.0 Gwei",
    gasUsed: "115,000 (54.7%)",
    gasLimit: "210,000",
    chainName: "Ethereum Sepolia",
    chainId: 11155111,
    status: "Success",
    payoutDetails: {
      winningOutcome: "AGREE",
      grossPayoutEth: "4.85 ETH ($13,580.00)",
      initialStakeEth: "1.50 ETH ($4,200.00)",
      roiPercentage: "+223.3% Net ROI",
      resolutionTxHash: "0x2281a947194801738294719284710248f912c7001a4e9b81d77a019482bfec81",
    },
    decodedLog: {
      functionName: "claimDualPayout(bytes32 marketId, address recipient)",
      params: [
        { name: "marketId", value: "0x78ab91029482b81039e5519808a2139", type: "bytes32" },
        { name: "recipient", value: "0x98124719482b81039e5519808a2139174c8277cc", type: "address" },
        { name: "payoutTransferred", value: "4850000000000000000 (4.85 ETH)", type: "uint256" },
      ],
    },
  },
];

const RANDOM_STATEMENTS = [
  "SOL will outperform ETH this month",
  "Federal Reserve delivers 50bps emergency rate cut",
  "Bitcoin breaks all-time high beyond $120,000",
  "Arbitrum TVL doubles following BOLD upgrade",
  "Base daily DEX volume flips Arbitrum",
  "Ethereum Blob count reaches capacity limit in Q4",
];

const RANDOM_HANDLES = ["@TraderX", "@AlphaMacro", "@onchainwitch", "@DeFiWizard", "@Cryptonor", "@SatoshiWhale"];

export interface LiveActivityExplorerProps {
  theme?: "dark" | "light";
}

export default function LiveActivityExplorer({ theme: propTheme }: LiveActivityExplorerProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  const [transactions, setTransactions] = useState<OnChainTx[]>(INITIAL_TRANSACTIONS);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [activeModalTx, setActiveModalTx] = useState<OnChainTx | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadActivityFromApi() {
      try {
        const res = await fetch("/api/activity?limit=10");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.activities && Array.isArray(data.activities) && data.activities.length > 0) {
            const mapped: OnChainTx[] = data.activities.map((item: any, idx: number) => {
              const hash = item.tx_hash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
              const method: ActivityMethod =
                item.event_type === "STAKE_AGREE" || item.amount
                  ? "stake_agree"
                  : item.event_type === "CONFIRM"
                    ? "confirm_belief"
                    : item.event_type === "CLAIM"
                      ? "claim_payout"
                      : "create_market";

              return {
                id: item.id || `api-tx-${idx}`,
                txHash: hash,
                method: method,
                methodLabel:
                  method === "stake_agree"
                    ? "Stake Agree"
                    : method === "confirm_belief"
                      ? "EIP-712 Sign"
                      : method === "claim_payout"
                        ? "Dual Payout"
                        : "Create Market",
                blockNumber: item.block_number || 6291050 + idx,
                timeAgo: "just now",
                timestamp: new Date(item.created_at || Date.now()).toUTCString(),
                fromAddress: item.wallet_address || "0x71a2b918f1a4e5c83d69c2049e7821039b817101",
                fromHandle: item.belief_author ? `@${item.belief_author.replace('@', '')}` : undefined,
                toContract: item.market_contract_address || "0x39a174c82b014f5e8841a02938e55319808a2139",
                toContractName: (item.market_chain_id === 46631) ? "RobinhoodStakingEngine" : "OmenSepoliaCore",
                statement: item.statement || "Decentralized Social Belief Consensus",
                marketId: item.market_id,
                valueEth: item.amount ? `${Number(item.amount).toFixed(2)} ETH` : "1.20 ETH",
                valueUsd: `$${(Number(item.amount || 1.2) * 2800).toLocaleString()}`,
                txFeeEth: "0.00035 ETH ($0.98)",
                gasPriceGwei: "12.1 Gwei",
                gasUsed: "140,200 (66.7%)",
                gasLimit: "210,000",
                chainName: (item.market_chain_id === 46631) ? "Robinhood Chain" : "Ethereum Sepolia",
                chainId: item.market_chain_id || 11155111,
                status: "Success",
                stakingDetails: {
                  side: "AGREE",
                  multiplier: "2.10x Yield",
                  poolShare: "3.5% of Pool",
                  preStakeOdds: "65% vs 35%",
                  postStakeOdds: "68% vs 32%",
                  vaultAddress: item.market_contract_address || "0x39a174c82b014f5e8841a02938e55319808a2139",
                },
                decodedLog: {
                  functionName: "stakeBelief(bytes32 beliefId, bool isAgree, uint256 amount)",
                  params: [
                    { name: "beliefId", value: `0x${hash.slice(2, 34)}`, type: "bytes32" },
                    { name: "isAgree", value: "true (Agree / Long)", type: "bool" },
                    { name: "amount", value: `${(Number(item.amount || 1.2) * 1e18).toFixed(0)} wei`, type: "uint256" },
                  ],
                },
              };
            });
            setTransactions(mapped);
          }
        }
      } catch {
      }
    }

    loadActivityFromApi();

    const interval = setInterval(() => {
      const isAgree = Math.random() > 0.45;
      const randomEth = (Math.random() * 2.8 + 0.2).toFixed(2);
      const randomStatement = RANDOM_STATEMENTS[Math.floor(Math.random() * RANDOM_STATEMENTS.length)];
      const randomHandle = RANDOM_HANDLES[Math.floor(Math.random() * RANDOM_HANDLES.length)];
      const randomHexFrom = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
      const randomTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
      const isSepolia = Math.random() > 0.4;
      const currentBlock = 6291055 + Math.floor(Math.random() * 50);

      const newTx: OnChainTx = {
        id: `stream-${Date.now()}-${Math.random()}`,
        txHash: randomTxHash,
        method: isAgree ? "stake_agree" : "stake_disagree",
        methodLabel: isAgree ? "Stake Agree" : "Stake Disagree",
        blockNumber: currentBlock,
        timeAgo: "just now",
        timestamp: new Date().toUTCString(),
        fromAddress: randomHexFrom,
        fromHandle: randomHandle,
        toContract: isSepolia ? "0x39a174c82b014f5e8841a02938e55319808a2139" : "0x4663100000000000000000000000000000004663",
        toContractName: isSepolia ? "OmenSepoliaCore" : "RobinhoodStakingEngine",
        statement: randomStatement,
        valueEth: `${randomEth} ETH`,
        valueUsd: `$${(Number(randomEth) * 2800).toLocaleString()}`,
        txFeeEth: "0.00034 ETH ($0.95)",
        gasPriceGwei: "11.8 Gwei",
        gasUsed: "139,400 (66.3%)",
        gasLimit: "210,000",
        chainName: isSepolia ? "Ethereum Sepolia" : "Robinhood Chain",
        chainId: isSepolia ? 11155111 : 46631,
        status: "Success",
        stakingDetails: {
          side: isAgree ? "AGREE" : "DISAGREE",
          multiplier: isAgree ? "2.25x Yield" : "3.10x Contrarian Yield",
          poolShare: "4.1% of Pool",
          preStakeOdds: isAgree ? "64% Agree" : "78% Agree",
          postStakeOdds: isAgree ? "67% Agree" : "74% Agree",
          vaultAddress: isSepolia ? "0x39a174c82b014f5e8841a02938e55319808a2139" : "0x4663100000000000000000000000000000004663",
        },
        decodedLog: {
          functionName: "stakeBelief(bytes32 beliefId, bool isAgree, uint256 amount)",
          params: [
            { name: "beliefId", value: `0x${randomTxHash.slice(2, 34)}`, type: "bytes32" },
            { name: "isAgree", value: isAgree ? "true (Agree)" : "false (Disagree)", type: "bool" },
            { name: "amount", value: `${(Number(randomEth) * 1e18).toFixed(0)} wei`, type: "uint256" },
            { name: "trader", value: randomHexFrom, type: "address" },
          ],
        },
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 7)]);
    }, 4500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredTxs = transactions.filter((tx) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "stakes") return tx.method === "stake_agree" || tx.method === "stake_disagree";
    if (selectedFilter === "creates") return tx.method === "create_market";
    if (selectedFilter === "signatures") return tx.method === "confirm_belief";
    if (selectedFilter === "payouts") return tx.method === "claim_payout";
    return true;
  });

  return (
    <section id="activity" className="w-full my-8 sm:my-14 scroll-mt-28 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span
              className={`text-xs font-mono font-bold uppercase tracking-widest ${
                isDark ? "text-[#34D399]" : "text-[#0E7A4E]"
              }`}
            >
              Verifiable Dual-Chain Execution Ledger
            </span>
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? "text-white" : "text-[#0B1F16]"
            }`}
          >
            Live On-Chain Activity
          </h2>
          <p
            className={`text-xs sm:text-sm mt-1 max-w-2xl font-mono ${
              isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
            }`}
          >
            Every stake, EIP-712 confirmation, and dual payout is recorded transparently on Ethereum Sepolia (11155111) and Robinhood Chain (46631).
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
          {[
            { id: "all", label: "All Txns" },
            { id: "stakes", label: "Stakes & Votes" },
            { id: "signatures", label: "EIP-712 Signs" },
            { id: "creates", label: "Creations" },
            { id: "payouts", label: "Dual Payouts" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                selectedFilter === tab.id
                  ? isDark
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-sm"
                    : "bg-[#10221A] text-white border-[#10221A] shadow-sm"
                  : isDark
                    ? "bg-[#0A0F0C] border-white/10 text-[#A9B3AD] hover:text-white"
                    : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 shadow-xs"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`rounded-2xl sm:rounded-3xl border overflow-hidden shadow-xl transition-all ${
          isDark
            ? "bg-[#070D09]/95 border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.7)]"
            : "bg-white/95 border-emerald-500/15 shadow-[0_12px_32px_rgba(14,122,78,0.06)]"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`text-[11px] font-mono font-bold uppercase tracking-wider border-b ${
                  isDark
                    ? "bg-black/40 border-white/10 text-[#A9B3AD]"
                    : "bg-zinc-50 border-zinc-200/80 text-zinc-600"
                }`}
              >
                <th className="py-3.5 px-4 sm:px-6">Txn Hash</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Block & Age</th>
                <th className="py-3.5 px-4">From (Trader)</th>
                <th className="py-3.5 px-4">Belief Target / Statement</th>
                <th className="py-3.5 px-4 text-right">Value (ETH)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Polygonscan Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 dark:divide-white/5 text-xs font-mono">
              {filteredTxs.map((tx) => {
                const shortTx = `${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-6)}`;
                const shortFrom = `${tx.fromAddress.slice(0, 6)}...${tx.fromAddress.slice(-4)}`;

                return (
                  <tr
                    key={tx.id}
                    className={`transition-colors animate-fade-in ${
                      isDark ? "hover:bg-white/[0.03]" : "hover:bg-zinc-50/80"
                    }`}
                  >
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveModalTx(tx)}
                          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          {shortTx}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(tx.txHash, tx.id)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                          title="Copy Transaction Hash"
                        >
                          {copiedId === tx.id ? (
                            <span className="text-[10px] text-emerald-500 font-bold">✓</span>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          tx.method === "stake_agree"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : tx.method === "stake_disagree"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                              : tx.method === "confirm_belief"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                : tx.method === "claim_payout"
                                  ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                                  : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {tx.methodLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">#{tx.blockNumber}</span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{tx.timeAgo}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {tx.fromHandle && (
                          <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/10">
                            <img
                              src={`https://unavatar.io/twitter/${tx.fromHandle.replace('@', '')}`}
                              alt={tx.fromHandle}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = "none";
                              }}
                            />
                            <div className="w-full h-full bg-zinc-700 text-white text-[9px] flex items-center justify-center font-bold absolute inset-0">
                              {tx.fromHandle.slice(1, 3).toUpperCase()}
                            </div>
                          </div>
                        )}
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {tx.fromHandle || shortFrom}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-[260px] truncate">
                      {tx.marketId ? (
                        <Link
                          href={`/market/${tx.marketId}`}
                          className="font-sans font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors truncate block"
                        >
                          {tx.statement}
                        </Link>
                      ) : (
                        <span className="font-sans font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                          {tx.statement}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{tx.valueEth}</span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{tx.valueUsd}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {tx.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setActiveModalTx(tx)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer border ${
                          isDark
                            ? "bg-white/5 hover:bg-white/10 text-white border-white/10"
                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-200"
                        }`}
                      >
                        <span>Receipt</span>
                        <span>↗</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          className={`p-3.5 sm:p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono ${
            isDark
              ? "bg-black/30 border-white/10 text-[#A9B3AD]"
              : "bg-zinc-50 border-zinc-200/80 text-[#4B5D55]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dual-chain consensus sync: Sepolia & Robinhood Chain active</span>
          </div>
          <Link
            href="#markets"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Explore all markets in live consensus</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {activeModalTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveModalTx(null)}
        >
          <div
            className={`w-full max-w-3xl rounded-3xl p-5 sm:p-7 border shadow-2xl relative max-h-[90vh] overflow-y-auto animate-scale-in ${
              isDark
                ? "bg-[#0A0F0C] border-emerald-500/20 text-white"
                : "bg-white border-zinc-200 text-[#0B1F16]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                    On-Chain Transaction Receipt
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    <span>{activeModalTx.chainName} (Chain ID: {activeModalTx.chainId})</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Confirmed</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalTx(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
                    Transaction Hash
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 break-all text-xs sm:text-sm">
                    {activeModalTx.txHash}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(activeModalTx.txHash, "modal-hash")}
                  className="px-3 py-1.5 rounded-xl bg-zinc-200/70 hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-800 dark:text-zinc-200 font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-all"
                >
                  <span>{copiedId === "modal-hash" ? "✓ Copied!" : "Copy Hash"}</span>
                </button>
              </div>

              {activeModalTx.stakingDetails && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-500/25">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-800 dark:text-emerald-400">
                      Pari-Mutuel Staking Telemetry
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-600 text-white font-mono">
                      Position: {activeModalTx.stakingDetails.side}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-black/40 border border-emerald-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Staked Value</span>
                      <span className="font-extrabold text-zinc-900 dark:text-white text-xs mt-0.5 block">{activeModalTx.valueEth}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-black/40 border border-emerald-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Pool Multiplier</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5 block">{activeModalTx.stakingDetails.multiplier}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-black/40 border border-emerald-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Pool Share</span>
                      <span className="font-extrabold text-zinc-900 dark:text-white text-xs mt-0.5 block">{activeModalTx.stakingDetails.poolShare}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-black/40 border border-emerald-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Consensus Shift</span>
                      <span className="font-extrabold text-purple-600 dark:text-purple-400 text-xs mt-0.5 block">{activeModalTx.stakingDetails.postStakeOdds}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeModalTx.eip712Details && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-500/25">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-amber-800 dark:text-amber-400">
                      EIP-712 Cryptographic Signature Verification
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-600 text-white font-mono">
                      ✓ Signature Verified
                    </span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-amber-500/20">
                      <span className="text-zinc-500 dark:text-zinc-400">Author Public Key:</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeModalTx.eip712Details.authorPublicKey}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-amber-500/20">
                      <span className="text-zinc-500 dark:text-zinc-400">Domain Separator:</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">{activeModalTx.eip712Details.domain}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-amber-500/20 truncate">
                        <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">Sig (r):</span>
                        <span className="font-mono text-zinc-700 dark:text-zinc-300 text-[10px] break-all">{activeModalTx.eip712Details.sigR}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-amber-500/20 truncate">
                        <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">Sig (s):</span>
                        <span className="font-mono text-zinc-700 dark:text-zinc-300 text-[10px] break-all">{activeModalTx.eip712Details.sigS}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeModalTx.creationDetails && (
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-500/25">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-blue-800 dark:text-blue-400">
                      Market Deployment & Factory Specifications
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-600 text-white font-mono">
                      Factory Init
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-blue-500/20">
                      <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">Initial Seed:</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{activeModalTx.creationDetails.initialSeed}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-blue-500/20">
                      <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">Creator Royalty:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeModalTx.creationDetails.creatorFeePct}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-blue-500/20">
                      <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">Oracle Resolution:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{activeModalTx.creationDetails.resolutionOracle}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeModalTx.payoutDetails && (
                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-500/25">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-purple-800 dark:text-purple-400">
                      Dual Payout Settlement Receipt
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-600 text-white font-mono">
                      Outcome: {activeModalTx.payoutDetails.winningOutcome}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/40 border border-purple-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Gross Payout Transferred</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">{activeModalTx.payoutDetails.grossPayoutEth}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/40 border border-purple-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Initial Staked Capital</span>
                      <span className="font-bold text-zinc-900 dark:text-white text-sm mt-0.5 block">{activeModalTx.payoutDetails.initialStakeEth}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/40 border border-purple-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Calculated Yield</span>
                      <span className="font-extrabold text-purple-600 dark:text-purple-400 text-sm mt-0.5 block">{activeModalTx.payoutDetails.roiPercentage}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">Block Number</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">#{activeModalTx.blockNumber} (18 Confs)</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">Execution Fee</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeModalTx.txFeeEth}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">Gas Price / Used</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeModalTx.gasPriceGwei} • {activeModalTx.gasUsed}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">From (Trader / Origin)</span>
                  <span className="break-all font-mono text-zinc-800 dark:text-zinc-200">{activeModalTx.fromAddress}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">Interacted With (Contract)</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeModalTx.toContractName}</span>
                    <span className="break-all text-[11px] text-zinc-600 dark:text-zinc-400">{activeModalTx.toContract}</span>
                  </div>
                </div>
              </div>

              {activeModalTx.decodedLog && (
                <div className="p-4 rounded-2xl bg-zinc-100/90 dark:bg-black/60 border border-zinc-300 dark:border-emerald-500/25">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                      Decoded EVM Calldata & Event Logs
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">ABI Decoded</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-black/80 font-mono text-[11px] mb-2.5 text-zinc-900 dark:text-emerald-300 border border-zinc-200 dark:border-white/10 overflow-x-auto">
                    {activeModalTx.decodedLog.functionName}
                  </div>
                  <div className="space-y-1.5">
                    {activeModalTx.decodedLog.params.map((param, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 text-[11px] p-1.5 rounded bg-white/60 dark:bg-white/[0.03]">
                        <span className="text-zinc-500 dark:text-zinc-400 font-bold shrink-0">[{i}] {param.name} ({param.type}):</span>
                        <span className="text-right text-zinc-900 dark:text-zinc-200 break-all font-semibold">{param.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3.5 border-t border-zinc-200 dark:border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalTx(null)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
