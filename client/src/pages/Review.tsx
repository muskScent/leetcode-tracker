import { useEffect, useMemo, useRef, useState } from 'react';
import { useDueReviews, useMarkReviewed, useUndoReview } from '../hooks/useReviews';
import { useCategories } from '../hooks/useCategories';
import { useTags } from '../hooks/useTags';
import { ReviewSnapshot } from '../api/reviews';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { ProblemFormModal } from '../components/ProblemFormModal';
import { Difficulty, Performance, Problem } from '../types';

const PAGE_SIZE = 9;
const UNDO_WINDOW_MS = 6000;

const PERFORMANCE_STYLE: Record<Performance, string> = {
  [Performance.Bad]: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  [Performance.Average]: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  [Performance.Good]: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
};

const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  [Difficulty.Easy]: 0,
  [Difficulty.Medium]: 1,
  [Difficulty.Hard]: 2,
};

type SortBy = 'due' | 'difficulty' | 'alpha';
type DueBucket = 'overdue' | 'today' | 'upcoming' | 'unscheduled';

/** Page numbers to render: first, last, and the current page ±1, with '…' for the gaps. */
function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const visible = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  return visible.flatMap((n, i) =>
    i > 0 && n - visible[i - 1] > 1 ? ['…' as const, n] : [n],
  );
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function dueBucket(problem: Problem): DueBucket {
  if (!problem.nextReviewAt) return 'unscheduled';
  const days = daysUntil(problem.nextReviewAt);
  if (days === null || days < 0) return 'overdue';
  if (days === 0) return 'today';
  return 'upcoming';
}

const BUCKET_LABEL: Record<DueBucket, string> = {
  overdue: 'Overdue',
  today: 'Due today',
  upcoming: 'Upcoming',
  unscheduled: 'Not scheduled yet',
};

function dueLabel(problem: Problem): string {
  if (!problem.nextReviewAt) return 'Not scheduled yet';
  const days = daysUntil(problem.nextReviewAt);
  if (days === null) return '';
  if (days < 0) return `${-days} day${days === -1 ? '' : 's'} overdue`;
  if (days === 0) return 'Due today';
  return `Due in ${days} day${days === 1 ? '' : 's'}`;
}

function snapshotOf(problem: Problem): ReviewSnapshot {
  return {
    performance: problem.performance,
    timesAttempted: problem.timesAttempted,
    nextReviewAt: problem.nextReviewAt,
    lastReviewedAt: problem.lastReviewedAt,
    reviewInterval: problem.reviewInterval,
  };
}

function sortProblems(problems: Problem[], sortBy: SortBy): Problem[] {
  const list = [...problems];
  if (sortBy === 'alpha') {
    return list.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sortBy === 'difficulty') {
    return list.sort(
      (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty],
    );
  }
  // 'due': struggling first, then soonest due date, matching the backend's default order.
  return list.sort((a, b) => {
    const perfOrder = (p: Performance | null) =>
      p === Performance.Bad ? 0 : p === Performance.Average ? 1 : 2;
    const perfDiff = perfOrder(a.performance) - perfOrder(b.performance);
    if (perfDiff !== 0) return perfDiff;
    const aDue = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() : 0;
    const bDue = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() : 0;
    return aDue - bDue;
  });
}

function RatingButtons({
  onRate,
  pending,
  className,
}: {
  onRate: (performance: Performance) => void;
  pending: boolean;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-3 gap-2 ${className ?? ''}`}>
      <button
        disabled={pending}
        onClick={() => onRate(Performance.Bad)}
        className="py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
      >
        Bad
      </button>
      <button
        disabled={pending}
        onClick={() => onRate(Performance.Average)}
        className="py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors disabled:opacity-50"
      >
        Average
      </button>
      <button
        disabled={pending}
        onClick={() => onRate(Performance.Good)}
        className="py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
      >
        Good
      </button>
    </div>
  );
}

function ProblemSummary({ problem }: { problem: Problem }) {
  const lastReviewed = daysSince(problem.lastReviewedAt);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <DifficultyBadge difficulty={problem.difficulty} />
        {problem.category && (
          <span className="text-xs text-gray-500">{problem.category.name}</span>
        )}
        {problem.performance && (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${PERFORMANCE_STYLE[problem.performance]}`}
          >
            {problem.performance}
          </span>
        )}
      </div>
      {problem.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {problem.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      {problem.keyTechniques && (
        <div className="text-xs text-gray-600 bg-indigo-50/40 border border-indigo-100 rounded-lg p-2 mt-2">
          <p className="font-medium text-indigo-700 mb-0.5">Key techniques</p>
          <p className="whitespace-pre-wrap font-mono line-clamp-3">
            {problem.keyTechniques}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
        <span className="tabular-nums">{dueLabel(problem)}</span>
        <span className="tabular-nums">
          {lastReviewed === null
            ? 'Never reviewed'
            : lastReviewed === 0
              ? 'Reviewed today'
              : `Reviewed ${lastReviewed}d ago`}
        </span>
      </div>
    </>
  );
}

function ReviewCard({
  problem,
  onOpen,
  onRate,
  pending,
}: {
  problem: Problem;
  onOpen: () => void;
  onRate: (performance: Performance) => void;
  pending: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <button
            onClick={onOpen}
            className="text-left font-semibold text-gray-900 text-sm hover:text-indigo-600 transition-colors"
          >
            {problem.title}
          </button>
          <ProblemSummary problem={problem} />
        </div>
        {problem.leetcodeUrl && (
          <a
            href={problem.leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-500 hover:text-indigo-700 shrink-0"
          >
            leetcode ↗
          </a>
        )}
      </div>

      <RatingButtons onRate={onRate} pending={pending} />
    </div>
  );
}

function FocusCard({
  problem,
  index,
  total,
  onOpen,
  onRate,
  onPrev,
  onNext,
  pending,
}: {
  problem: Problem;
  index: number;
  total: number;
  onOpen: () => void;
  onRate: (performance: Performance) => void;
  onPrev: () => void;
  onNext: () => void;
  pending: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-xl mx-auto">
      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
        <span className="tabular-nums">
          Card {index + 1} of {total}
        </span>
        <span>Shortcuts: 1 bad · 2 average · 3 good</span>
      </div>

      <button
        onClick={onOpen}
        className="text-left font-semibold text-gray-900 text-lg hover:text-indigo-600 transition-colors"
      >
        {problem.title}
      </button>
      <ProblemSummary problem={problem} />

      {problem.leetcodeUrl && (
        <a
          href={problem.leetcodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-500 hover:text-indigo-700 mt-2 inline-block"
        >
          leetcode ↗
        </a>
      )}

      <RatingButtons onRate={onRate} pending={pending} className="mt-4" />

      <div className="flex items-center justify-between mt-3">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={index === total - 1}
          className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export function Review() {
  const { data: due = [], isLoading } = useDueReviews();
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const markReviewed = useMarkReviewed();
  const undoReview = useUndoReview();

  const [selected, setSelected] = useState<Problem | null>(null);
  const [search, setSearch] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState<Performance | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('due');
  const [page, setPage] = useState(1);
  const [focusMode, setFocusMode] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [toast, setToast] = useState<{ problem: Problem; snapshot: ReviewSnapshot } | null>(
    null,
  );
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const badCount = due.filter((p) => p.performance === Performance.Bad).length;
  const avgCount = due.filter((p) => p.performance === Performance.Average).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return due.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q)) return false;
      if (performanceFilter && p.performance !== performanceFilter) return false;
      if (categoryFilter && p.category?.name !== categoryFilter) return false;
      if (tagFilter && !p.tags.some((t) => t.name === tagFilter)) return false;
      return true;
    });
  }, [due, search, performanceFilter, categoryFilter, tagFilter]);

  const sorted = useMemo(() => sortProblems(filtered, sortBy), [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageProblems = sorted.slice(pageStart, pageStart + PAGE_SIZE);

  const clampedFocusIndex = Math.min(focusIndex, Math.max(0, sorted.length - 1));
  const focusProblem = sorted[clampedFocusIndex] as Problem | undefined;

  const clearToastTimer = () => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
  };

  const handleFiltersChange = () => setPage(1);

  const handleRate = (problem: Problem, performance: Performance) => {
    clearToastTimer();
    const snapshot = snapshotOf(problem);
    markReviewed.mutate({ id: problem.id, performance });
    setSessionCount((n) => n + 1);
    setToast({ problem, snapshot });
    toastTimer.current = setTimeout(() => setToast(null), UNDO_WINDOW_MS);
  };

  const handleUndo = () => {
    if (!toast) return;
    clearToastTimer();
    undoReview.mutate({ id: toast.problem.id, snapshot: toast.snapshot });
    setSessionCount((n) => Math.max(0, n - 1));
    setToast(null);
  };

  useEffect(() => () => clearToastTimer(), []);

  // Keyboard shortcuts for rating the current card while in focus mode.
  useEffect(() => {
    if (!focusMode || !focusProblem) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        return;
      }
      if (e.key === '1' || e.key === 'ArrowLeft') handleRate(focusProblem, Performance.Bad);
      else if (e.key === '2' || e.key === 'ArrowDown') handleRate(focusProblem, Performance.Average);
      else if (e.key === '3' || e.key === 'ArrowRight') handleRate(focusProblem, Performance.Good);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMode, focusProblem]);

  let lastBucket: DueBucket | null = null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review</h1>
          <p className="text-gray-500 text-sm mt-1">
            Spaced repetition — rate each problem after retrying it
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {sessionCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 font-medium">
              {sessionCount} reviewed this session
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 ring-1 ring-red-200 font-medium">
            {badCount} struggling
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 font-medium">
            {avgCount} average
          </span>
          <button
            onClick={() => setFocusMode((f) => !f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              focusMode
                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {focusMode ? 'Exit focus mode' : 'Focus mode'}
          </button>
        </div>
      </div>

      {!focusMode && (
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFiltersChange();
            }}
            className="flex-1 min-w-[180px] bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
          <select
            value={performanceFilter}
            onChange={(e) => {
              setPerformanceFilter(e.target.value as Performance | '');
              handleFiltersChange();
            }}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Performance</option>
            <option value={Performance.Bad}>Bad</option>
            <option value={Performance.Average}>Average</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              handleFiltersChange();
            }}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              handleFiltersChange();
            }}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="due">Sort: Overdue first</option>
            <option value="difficulty">Sort: Difficulty</option>
            <option value="alpha">Sort: Alphabetical</option>
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 shadow-sm">
          Loading...
        </div>
      ) : due.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm">
          <p className="text-2xl mb-2">✓</p>
          <p className="text-gray-700 font-medium">Nothing to review right now</p>
          <p className="text-gray-500 text-sm mt-1">
            Come back later — problems return to this list on their spaced-repetition
            schedule. Mark a problem as <em>Bad</em> or <em>Average</em> anywhere in the
            app to add it here.
          </p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm">
          <p className="text-gray-700 font-medium">No problems match your filters</p>
        </div>
      ) : focusMode ? (
        focusProblem && (
          <FocusCard
            problem={focusProblem}
            index={clampedFocusIndex}
            total={sorted.length}
            onOpen={() => setSelected(focusProblem)}
            onRate={(perf) => handleRate(focusProblem, perf)}
            onPrev={() => setFocusIndex((i) => Math.max(0, i - 1))}
            onNext={() => setFocusIndex((i) => Math.min(sorted.length - 1, i + 1))}
            pending={markReviewed.isPending}
          />
        )
      ) : (
        <div className="flex flex-col gap-4">
          {pageProblems.map((p) => {
            const bucket = sortBy === 'due' ? dueBucket(p) : null;
            const showHeader = bucket !== null && bucket !== lastBucket;
            if (bucket !== null) lastBucket = bucket;
            return (
              <div key={p.id} className="contents">
                {showHeader && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2 first:mt-0">
                    {BUCKET_LABEL[bucket as DueBucket]}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ReviewCard
                    problem={p}
                    onOpen={() => setSelected(p)}
                    onRate={(perf) => handleRate(p, perf)}
                    pending={markReviewed.isPending}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!focusMode && !isLoading && sorted.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500 tabular-nums">
            Showing {pageStart + 1}–{pageStart + pageProblems.length} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
            >
              Previous
            </button>
            {pageWindow(currentPage, totalPages).map((n, i) =>
              n === '…' ? (
                <span key={`gap-${i}`} className="w-6 text-center text-sm text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 text-sm rounded-lg tabular-nums transition-colors ${
                    n === currentPage
                      ? 'bg-blue-500 text-white font-medium'
                      : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 z-50">
          <span>
            Rated <span className="font-medium">{toast.problem.title}</span>
          </span>
          <button
            onClick={handleUndo}
            className="text-indigo-300 hover:text-indigo-200 font-medium"
          >
            Undo
          </button>
        </div>
      )}

      {selected && <ProblemFormModal problem={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
