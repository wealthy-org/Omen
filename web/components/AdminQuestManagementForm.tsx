"use client";

import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { QuestCategory } from "./QuestCard";

export interface AdminQuestItem {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  points: number;
  actionUrl?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AdminQuestManagementFormProps {
  initialQuests?: AdminQuestItem[];
  onCreateQuest?: (quest: AdminQuestItem) => Promise<void> | void;
  onToggleQuestStatus?: (id: string, active: boolean) => Promise<void> | void;
  className?: string;
}

const DEFAULT_QUESTS: AdminQuestItem[] = [
  {
    id: "quest-1",
    title: "Connect Web3 Wallet",
    description: "Connect your Web3 crypto wallet to Omen prediction platform",
    category: "ONBOARDING",
    points: 100,
    actionUrl: "https://omen.market",
    isActive: true,
    createdAt: "2026-03-01",
  },
  {
    id: "quest-2",
    title: "Follow Omen on X (Twitter)",
    description: "Follow official @OmenMarket account on X to receive platform alpha",
    category: "SOCIAL",
    points: 150,
    actionUrl: "https://twitter.com/omenmarket",
    isActive: true,
    createdAt: "2026-03-02",
  },
  {
    id: "quest-3",
    title: "Place Your First Prediction",
    description: "Stake at least 10 USDT on any active prediction market outcome",
    category: "ON-CHAIN",
    points: 300,
    actionUrl: "https://omen.market/predictions",
    isActive: true,
    createdAt: "2026-03-05",
  },
  {
    id: "quest-4",
    title: "Join Discord Community",
    description: "Join the verified community server and introduce yourself in #general",
    category: "SOCIAL",
    points: 120,
    actionUrl: "https://discord.gg/omen",
    isActive: false,
    createdAt: "2026-03-06",
  },
];

export default function AdminQuestManagementForm({
  initialQuests = DEFAULT_QUESTS,
  onCreateQuest,
  onToggleQuestStatus,
  className = "",
}: AdminQuestManagementFormProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [quests, setQuests] = useState<AdminQuestItem[]>(initialQuests);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<QuestCategory>("ONBOARDING");
  const [points, setPoints] = useState<string>("100");
  const [actionUrl, setActionUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [toggleUpdatingId, setToggleUpdatingId] = useState<string | null>(null);

  const getCategoryBadgeClass = (cat: QuestCategory) => {
    switch (cat) {
      case "SOCIAL":
        return "text-sky-500 bg-sky-500/10 border-sky-500/20";
      case "ON-CHAIN":
        return "text-warning-amber bg-warning-soft dark:bg-amber-500/15 border-amber-500/20";
      case "DAILY":
        return "text-yes-green bg-yes-green-soft dark:bg-yes-green/10 border-yes-green/20";
      case "ONBOARDING":
      default:
        return "text-primary-blue bg-primary-blue-soft dark:bg-primary-blue/15 border-primary-blue/20";
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setFormError("Quest title is required.");
      return;
    }

    if (!description.trim()) {
      setFormError("Quest description instruction is required.");
      return;
    }

    const pointsNum = parseInt(points, 10);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      setFormError("Points reward must be a positive integer greater than 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newQuest: AdminQuestItem = {
        id: `quest-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        category,
        points: pointsNum,
        actionUrl: actionUrl.trim() || undefined,
        isActive: true,
        createdAt: new Date().toISOString().split("T")[0],
      };

      if (onCreateQuest) {
        await onCreateQuest(newQuest);
      }

      setQuests((prev) => [newQuest, ...prev]);
      setTitle("");
      setDescription("");
      setCategory("ONBOARDING");
      setPoints("100");
      setActionUrl("");
      setSuccessMessage(`Quest "${newQuest.title}" created successfully!`);
    } catch {
      setFormError("Failed to create quest. Please check parameters and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    setToggleUpdatingId(id);
    const newActiveState = !currentActive;

    try {
      if (onToggleQuestStatus) {
        await onToggleQuestStatus(id, newActiveState);
      }

      setQuests((prev) =>
        prev.map((q) => (q.id === id ? { ...q, isActive: newActiveState } : q))
      );
    } catch {
      setFormError(`Failed to update status for quest ${id}.`);
    } finally {
      setToggleUpdatingId(null);
    }
  };

  const filteredQuests = quests.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && q.isActive) ||
      (statusFilter === "INACTIVE" && !q.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`space-y-8 ${className}`}>
      <div
        className={`rounded-2xl border p-6 sm:p-8 transition-all ${
          isDark
            ? "bg-[#0A0F0C] border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
            : "bg-white border-emerald-500/10 shadow-[0_4px_20px_rgba(14,122,78,0.06)]"
        }`}
      >
        <div className="flex items-center gap-3 pb-6 border-b border-border-subtle dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-primary-blue-soft text-primary-blue dark:bg-primary-blue/15 flex items-center justify-center font-bold">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-accent-navy dark:text-white">
              Create New Quest
            </h2>
            <p className="text-xs sm:text-sm text-text-muted dark:text-[#A9B3AD]">
              Add gamified tasks for users to earn platform XP and reward points.
            </p>
          </div>
        </div>

        {formError && (
          <div
            role="alert"
            className="mt-6 p-4 rounded-xl border border-no-red/30 bg-no-red-soft dark:bg-no-red/10 text-no-red text-sm flex items-center gap-3"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{formError}</span>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mt-6 p-4 rounded-xl border border-yes-green/30 bg-yes-green-soft dark:bg-yes-green/10 text-yes-green text-sm flex items-center gap-3"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <form noValidate onSubmit={handleCreateSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="quest-title"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-2"
              >
                Quest Title <span className="text-no-red">*</span>
              </label>
              <input
                id="quest-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Join Telegram Announcement Channel"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                  isDark
                    ? "bg-[#121815] border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                    : "bg-[#F4FBF7] border-emerald-500/20 text-accent-navy placeholder:text-accent-navy/40 focus:border-emerald-500"
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="quest-category"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-2"
              >
                Category <span className="text-no-red">*</span>
              </label>
              <select
                id="quest-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as QuestCategory)}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none cursor-pointer ${
                  isDark
                    ? "bg-[#121815] border-white/10 text-white focus:border-emerald-500/50"
                    : "bg-[#F4FBF7] border-emerald-500/20 text-accent-navy focus:border-emerald-500"
                }`}
              >
                <option value="ONBOARDING">ONBOARDING</option>
                <option value="SOCIAL">SOCIAL</option>
                <option value="ON-CHAIN">ON-CHAIN</option>
                <option value="DAILY">DAILY</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="quest-description"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-2"
            >
              Description & Instructions <span className="text-no-red">*</span>
            </label>
            <textarea
              id="quest-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide clear step-by-step instructions for completing this quest..."
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none resize-none ${
                isDark
                  ? "bg-[#121815] border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                  : "bg-[#F4FBF7] border-emerald-500/20 text-accent-navy placeholder:text-accent-navy/40 focus:border-emerald-500"
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="quest-points"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-2"
              >
                Points Reward (+PTS) <span className="text-no-red">*</span>
              </label>
              <input
                id="quest-points"
                type="number"
                min="1"
                step="1"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="100"
                className={`w-full px-4 py-3 rounded-xl border font-mono text-sm font-bold transition-all outline-none ${
                  isDark
                    ? "bg-[#121815] border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                    : "bg-[#F4FBF7] border-emerald-500/20 text-accent-navy placeholder:text-accent-navy/40 focus:border-emerald-500"
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="quest-action-url"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-2"
              >
                Action Target URL (Optional)
              </label>
              <input
                id="quest-action-url"
                type="url"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="https://t.me/omenmarket"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                  isDark
                    ? "bg-[#121815] border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                    : "bg-[#F4FBF7] border-emerald-500/20 text-accent-navy placeholder:text-accent-navy/40 focus:border-emerald-500"
                }`}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting
                  ? "opacity-60 cursor-not-allowed bg-emerald-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Creating Quest...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Quest</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div
        className={`rounded-2xl border p-6 sm:p-8 transition-all ${
          isDark
            ? "bg-[#0A0F0C] border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
            : "bg-white border-emerald-500/10 shadow-[0_4px_20px_rgba(14,122,78,0.06)]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-subtle dark:border-white/10">
          <div>
            <h2 className="text-xl font-bold text-accent-navy dark:text-white">
              Manage Existing Quests
            </h2>
            <p className="text-xs sm:text-sm text-text-muted dark:text-[#A9B3AD]">
              Toggle active status and inspect live configured platform quests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl p-1 bg-[#F4FBF7] dark:bg-[#121815] border border-emerald-500/10 dark:border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-text-muted dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white"
                }`}
              >
                All ({quests.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === "ACTIVE"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-text-muted dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white"
                }`}
              >
                Active ({quests.filter((q) => q.isActive).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("INACTIVE")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === "INACTIVE"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-text-muted dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white"
                }`}
              >
                Inactive ({quests.filter((q) => !q.isActive).length})
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quest by title, description, or ID..."
            aria-label="Search quests"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
              isDark
                ? "bg-[#121815] border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                : "bg-[#F4FBF7] border-emerald-500/20 text-accent-navy placeholder:text-accent-navy/40 focus:border-emerald-500"
            }`}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border-subtle dark:border-white/10">
          <table className="w-full text-left border-collapse" aria-label="Existing Quests Table">
            <thead>
              <tr
                className={`text-[11px] font-mono uppercase tracking-wider border-b ${
                  isDark
                    ? "bg-[#121815] text-[#CBD5E1] border-white/10"
                    : "bg-[#F4FBF7] text-text-muted border-emerald-500/10"
                }`}
              >
                <th className="py-3 px-4 font-bold">Quest Details</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Points</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Action Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle dark:divide-white/10 text-sm">
              {filteredQuests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted dark:text-[#A9B3AD]">
                    No quests found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredQuests.map((quest) => (
                  <tr
                    key={quest.id}
                    className={`transition-colors ${
                      isDark ? "hover:bg-white/[0.02]" : "hover:bg-emerald-50/40"
                    }`}
                  >
                    <td className="py-4 px-4 max-w-xs sm:max-w-md">
                      <div className="font-bold text-accent-navy dark:text-white leading-tight">
                        {quest.title}
                      </div>
                      <div className="text-xs text-text-muted dark:text-[#A9B3AD] mt-1 line-clamp-1">
                        {quest.description}
                      </div>
                      <div className="text-[10px] font-mono text-text-muted/60 dark:text-white/40 mt-1">
                        ID: {quest.id}
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(
                          quest.category
                        )}`}
                      >
                        {quest.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-primary-blue dark:text-primary-blue">
                        +{quest.points} PTS
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {quest.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-yes-green-soft dark:bg-yes-green/15 text-yes-green border border-yes-green/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-yes-green animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-slate-100 dark:bg-white/10 text-text-muted dark:text-[#A9B3AD] border border-border-subtle dark:border-white/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={quest.isActive}
                        aria-label={`Toggle status for ${quest.title}`}
                        disabled={toggleUpdatingId === quest.id}
                        onClick={() => handleToggle(quest.id, quest.isActive)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                          quest.isActive ? "bg-emerald-600" : "bg-slate-300 dark:bg-white/20"
                        } ${toggleUpdatingId === quest.id ? "opacity-50 cursor-wait" : ""}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            quest.isActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
