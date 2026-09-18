"use client";

import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { QuestCategory } from "./QuestCard";

export type QuestRecurrence = "ONE_TIME" | "DAILY" | "WEEKLY";

export interface AdminQuestItem {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  points: number;
  recurrence?: QuestRecurrence;
  actionUrl?: string;
  isActive: boolean;
  completionsCount?: number;
  createdAt?: string;
}

export interface AdminQuestManagementFormProps {
  initialQuests?: AdminQuestItem[];
  onCreateQuest?: (quest: AdminQuestItem) => Promise<void> | void;
  onToggleQuestStatus?: (id: string, active: boolean) => Promise<void> | void;
  onDeleteQuest?: (id: string) => Promise<void> | void;
  className?: string;
}

export default function AdminQuestManagementForm({
  initialQuests = [],
  onCreateQuest,
  onToggleQuestStatus,
  onDeleteQuest,
  className = "",
}: AdminQuestManagementFormProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [quests, setQuests] = useState<AdminQuestItem[]>(initialQuests);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<QuestCategory>("ONBOARDING");
  const [recurrence, setRecurrence] = useState<QuestRecurrence>("ONE_TIME");
  const [points, setPoints] = useState<string>("100");
  const [actionUrl, setActionUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [toggleUpdatingId, setToggleUpdatingId] = useState<string | null>(null);

  const [deleteModalQuest, setDeleteModalQuest] = useState<AdminQuestItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [prevInitialQuests, setPrevInitialQuests] = useState(initialQuests);
  if (initialQuests !== prevInitialQuests) {
    setPrevInitialQuests(initialQuests);
    setQuests(initialQuests);
  }

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

  const validateQuestForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Quest title is required.";
    } else if (title.trim().length < 5) {
      errors.title = "Quest title must be at least 5 characters long.";
    }

    if (!description.trim()) {
      errors.description = "Quest description instruction is required.";
    } else if (description.trim().length < 10) {
      errors.description = "Quest description must be at least 10 characters long.";
    }

    const pointsNum = parseInt(points, 10);
    if (isNaN(pointsNum) || pointsNum < 10) {
      errors.points = "Points reward must be at least 10 PTS.";
    } else if (pointsNum > 10000) {
      errors.points = "Points reward cannot exceed 10,000 PTS.";
    }

    if (actionUrl.trim()) {
      try {
        const parsed = new URL(actionUrl.trim());
        if (!["http:", "https:"].includes(parsed.protocol)) {
          errors.actionUrl = "Action URL must start with http:// or https://";
        }
      } catch {
        errors.actionUrl = "Please provide a valid web URL.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!validateQuestForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const pointsNum = parseInt(points, 10);
      const res = await fetch("/api/admin/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          points_reward: pointsNum,
          action_url: actionUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        let errMessage = "Failed to create quest";
        try {
          const errData = await res.json();
          if (errData?.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      const resData = await res.json();
      const savedQuestData = resData.quest;

      const createdQuest: AdminQuestItem = {
        id: savedQuestData?.id || `quest-${Date.now()}`,
        title: savedQuestData?.title || title.trim(),
        description: savedQuestData?.description || description.trim(),
        category: (savedQuestData?.category || category).toUpperCase() as QuestCategory,
        recurrence,
        points: Number(savedQuestData?.points_reward ?? pointsNum),
        actionUrl: savedQuestData?.action_url || actionUrl.trim() || undefined,
        isActive: Boolean(savedQuestData?.is_active ?? true),
        completionsCount: Number(savedQuestData?.completions_count ?? 0),
        createdAt: savedQuestData?.created_at || new Date().toISOString().split("T")[0],
      };

      if (onCreateQuest) {
        await onCreateQuest(createdQuest);
      }

      setQuests((prev) => [createdQuest, ...prev]);
      setTitle("");
      setDescription("");
      setCategory("ONBOARDING");
      setRecurrence("ONE_TIME");
      setPoints("100");
      setActionUrl("");
      setFieldErrors({});
      setSuccessMessage(`Quest "${createdQuest.title}" created successfully!`);
    } catch (err: any) {
      setFormError(err?.message || "Failed to create quest. Please check parameters and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    setToggleUpdatingId(id);
    const newActiveState = !currentActive;

    try {
      const res = await fetch(`/api/admin/quests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newActiveState }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update status for quest ${id}.`);
      }

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

  const handleConfirmDelete = async () => {
    if (!deleteModalQuest) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/quests/${deleteModalQuest.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete quest ${deleteModalQuest.id}.`);
      }

      if (onDeleteQuest) {
        await onDeleteQuest(deleteModalQuest.id);
      }

      setQuests((prev) => prev.filter((q) => q.id !== deleteModalQuest.id));
      setSuccessMessage(`Quest "${deleteModalQuest.title}" was archived.`);
      setDeleteModalQuest(null);
    } catch {
      setFormError(`Failed to delete quest ${deleteModalQuest.id}.`);
    } finally {
      setIsDeleting(false);
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
      <div className="rounded-2xl border p-6 sm:p-8 transition-all bg-white dark:bg-[#0A0F0C] border-zinc-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3 pb-6 border-b border-zinc-200 dark:border-white/10">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
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
                aria-invalid={Boolean(fieldErrors.title)}
                aria-describedby={fieldErrors.title ? "quest-title-error" : undefined}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) {
                    setFieldErrors((prev) => ({ ...prev, title: "" }));
                  }
                }}
                placeholder="e.g., Join Telegram Announcement Channel"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                  fieldErrors.title
                    ? "border-no-red bg-rose-50/50 dark:bg-rose-950/20 text-accent-navy dark:text-white"
                    : "bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white focus:border-emerald-500"
                }`}
              />
              {fieldErrors.title && (
                <p id="quest-title-error" className="mt-1 text-xs text-no-red font-medium">
                  {fieldErrors.title}
                </p>
              )}
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
                className="w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none cursor-pointer bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white focus:border-emerald-500"
              >
                <option value="ONBOARDING">ONBOARDING</option>
                <option value="SOCIAL">SOCIAL</option>
                <option value="ON-CHAIN">ON-CHAIN</option>
                <option value="DAILY">DAILY</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
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
                aria-invalid={Boolean(fieldErrors.description)}
                aria-describedby={fieldErrors.description ? "quest-desc-error" : undefined}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) {
                    setFieldErrors((prev) => ({ ...prev, description: "" }));
                  }
                }}
                placeholder="Provide clear step-by-step instructions for completing this quest..."
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none resize-none ${
                  fieldErrors.description
                    ? "border-no-red bg-rose-50/50 dark:bg-rose-950/20 text-accent-navy dark:text-white"
                    : "bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white focus:border-emerald-500"
                }`}
              />
              {fieldErrors.description && (
                <p id="quest-desc-error" className="mt-1 text-xs text-no-red font-medium">
                  {fieldErrors.description}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="quest-recurrence"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-2"
              >
                Recurrence Type
              </label>
              <select
                id="quest-recurrence"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as QuestRecurrence)}
                className="w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none cursor-pointer bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white focus:border-emerald-500"
              >
                <option value="ONE_TIME">One-Time Completion</option>
                <option value="DAILY">Daily Recurring</option>
                <option value="WEEKLY">Weekly Recurring</option>
              </select>
            </div>
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
                min="10"
                max="10000"
                step="5"
                value={points}
                aria-invalid={Boolean(fieldErrors.points)}
                aria-describedby={fieldErrors.points ? "quest-points-error" : undefined}
                onChange={(e) => {
                  setPoints(e.target.value);
                  if (fieldErrors.points) {
                    setFieldErrors((prev) => ({ ...prev, points: "" }));
                  }
                }}
                placeholder="100"
                className={`w-full px-4 py-3 rounded-xl border font-mono text-sm font-bold transition-all outline-none ${
                  fieldErrors.points
                    ? "border-no-red bg-rose-50/50 dark:bg-rose-950/20 text-accent-navy dark:text-white"
                    : "bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white focus:border-emerald-500"
                }`}
              />
              {fieldErrors.points && (
                <p id="quest-points-error" className="mt-1 text-xs text-no-red font-medium">
                  {fieldErrors.points}
                </p>
              )}
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
                aria-invalid={Boolean(fieldErrors.actionUrl)}
                aria-describedby={fieldErrors.actionUrl ? "quest-url-error" : undefined}
                onChange={(e) => {
                  setActionUrl(e.target.value);
                  if (fieldErrors.actionUrl) {
                    setFieldErrors((prev) => ({ ...prev, actionUrl: "" }));
                  }
                }}
                placeholder="https://t.me/omenmarket"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                  fieldErrors.actionUrl
                    ? "border-no-red bg-rose-50/50 dark:bg-rose-950/20 text-accent-navy dark:text-white"
                    : "bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white focus:border-emerald-500"
                }`}
              />
              {fieldErrors.actionUrl && (
                <p id="quest-url-error" className="mt-1 text-xs text-no-red font-medium">
                  {fieldErrors.actionUrl}
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
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

      <div className="rounded-2xl border p-6 sm:p-8 transition-all bg-white dark:bg-[#0A0F0C] border-zinc-200 dark:border-white/10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-white/10">
          <div>
            <h2 className="text-xl font-bold text-accent-navy dark:text-white">
              Manage Existing Quests
            </h2>
            <p className="text-xs sm:text-sm text-text-muted dark:text-[#A9B3AD]">
              Toggle active status, review completion statistics, or archive quests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl p-1 bg-zinc-100 dark:bg-[#121815] border border-zinc-200 dark:border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white"
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
                    : "text-zinc-600 dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white"
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
                    : "text-zinc-600 dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white"
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
            className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/30 focus:border-emerald-500"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
          <table className="w-full text-left border-collapse" aria-label="Existing Quests Table">
            <thead>
              <tr className="text-[11px] font-mono uppercase tracking-wider border-b bg-zinc-50 dark:bg-[#121815] text-zinc-600 dark:text-[#CBD5E1] border-zinc-200 dark:border-white/10">
                <th className="py-3 px-4 font-bold">Quest Details</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Points / Type</th>
                <th className="py-3 px-4 font-bold">Completions</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle dark:divide-white/10 text-sm">
              {filteredQuests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted dark:text-[#A9B3AD]">
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
                      <div className="text-[10px] font-mono text-text-muted/60 dark:text-white/40 mt-1 flex items-center gap-2">
                        <span>ID: {quest.id}</span>
                        {quest.actionUrl && (
                          <a
                            href={quest.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-blue hover:underline truncate max-w-[140px]"
                          >
                            {quest.actionUrl}
                          </a>
                        )}
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
                      <div className="font-mono font-bold text-primary-blue">
                        +{quest.points} PTS
                      </div>
                      <div className="text-[10px] font-mono text-text-muted dark:text-[#A9B3AD] mt-0.5">
                        {quest.recurrence || "ONE_TIME"}
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap font-mono text-xs text-accent-navy dark:text-white">
                      {(quest.completionsCount || 0).toLocaleString()} users
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
                      <div className="flex items-center justify-end gap-3">
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

                        <button
                          type="button"
                          onClick={() => setDeleteModalQuest(quest)}
                          aria-label={`Delete quest ${quest.title}`}
                          className="p-1.5 rounded-lg text-text-muted hover:text-no-red hover:bg-no-red-soft dark:hover:bg-no-red/10 transition-colors cursor-pointer"
                          title="Archive Quest"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteModalQuest && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/75 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border p-6 sm:p-8 transition-all shadow-2xl space-y-4 bg-white dark:bg-[#0A0F0C] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-no-red-soft dark:bg-no-red/20 text-no-red flex items-center justify-center font-bold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 id="delete-dialog-title" className="text-lg font-bold">
                  Archive Quest
                </h3>
                <p className="text-xs text-text-muted dark:text-[#A9B3AD]">
                  Confirm removal of quest from active catalog
                </p>
              </div>
            </div>

            <p className="text-xs text-text-muted dark:text-zinc-300 leading-relaxed font-sans">
              Are you sure you want to archive quest <strong>&ldquo;{deleteModalQuest.title}&rdquo;</strong>? Users will no longer be able to complete this task.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setDeleteModalQuest(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl font-bold text-xs border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-accent-navy dark:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide bg-no-red hover:bg-red-600 text-white transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                  isDeleting ? "opacity-60 cursor-not-allowed" : "active:scale-[0.98]"
                }`}
              >
                {isDeleting ? "Archiving..." : "Confirm Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
