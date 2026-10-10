import { useState, useRef, useEffect } from 'react';
import { useStats } from '../hooks/useStats';
import { useTags } from '../hooks/useTags';
import { ProgressBar } from '../components/ProgressBar';
import { ProblemFormModal } from '../components/ProblemFormModal';
import { Difficulty, Performance, PerformanceStats } from '../types';

const difficultyColors: Record<string, string> = {
  Easy: 'bg-emerald-400',
  Medium: 'bg-amber-400',
  Hard: 'bg-rose-500',
};

const PERFORMANCE_BUCKETS: { key: string; label: string; color: string; text: string }[] = [
  { key: Performance.Good, label: 'Good', color: 'bg-emerald-500', text: 'text-emerald-600' },
  { key: Performance.Average, label: 'Average', color: 'bg-amber-400', text: 'text-amber-600' },
  { key: Performance.Bad, label: 'Bad', color: 'bg-rose-500', text: 'text-rose-600' },
  { key: 'Unrated', label: 'Unrated', color: 'bg-zinc-300', text: 'text-zinc-500' },
];

const EMPTY_PERFORMANCE: PerformanceStats = { count: 0, percent: 0 };

export function Dashboard() {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: stats, isLoading } = useStats(selectedTagIds.length > 0 ? selectedTagIds : undefined);
  const { data: tags = [] } = useTags();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addTag = (id: string) => {
    setSelectedTagIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setTagSearch('');
    setDropdownOpen(false);
  };

  const removeTag = (id: string) =>
    setSelectedTagIds((prev) => prev.filter((t) => t !== id));

  const filteredTags = tags.filter(
    (t) =>
      !selectedTagIds.includes(t.id) &&
      t.name.toLowerCase().includes(tagSearch.toLowerCase()),
  );

  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400">
        Loading stats...
      </div>
    );
  }

  if (!stats) return null;

  const performanceStats = (key: string): PerformanceStats =>
    stats.byPerformance?.[key] ?? EMPTY_PERFORMANCE;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Your interview prep progress</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Problem
        </button>
      </div>

      {/* Tag filter */}
      <div className="mb-6 pb-6 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-zinc-400 shrink-0">Filter by tag</span>
          <div ref={searchRef} className="relative w-56">
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => { setTagSearch(e.target.value); setDropdownOpen(true); }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Search tags..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
            {dropdownOpen && filteredTags.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => addTag(tag.id)}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedTagIds.length > 0 && (
            <button
              onClick={() => setSelectedTagIds([])}
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500 text-white rounded-full text-xs font-medium"
              >
                {tag.name}
                <button
                  onClick={() => removeTag(tag.id)}
                  className="hover:opacity-70 leading-none transition-opacity"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Overall Progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Overall Progress
            {selectedTagIds.length > 0 && (
              <span className="ml-2 normal-case text-blue-500 font-normal">
                · {selectedTagIds.length} tag{selectedTagIds.length > 1 ? 's' : ''} selected
              </span>
            )}
          </h2>
          <span className="text-3xl font-bold text-gray-900">
            {stats.overallCompletionPercent}%
          </span>
        </div>
        <ProgressBar value={stats.totalSolved} max={stats.totalProblems} size="md" />
        <p className="text-sm text-gray-500 mt-2">
          {stats.totalSolved} / {stats.totalProblems} problems solved
        </p>
      </div>

      {/* Difficulty Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.values(Difficulty).map((diff) => {
          const s = stats.byDifficulty[diff];
          if (!s) return null;
          return (
            <div key={diff} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{diff}</span>
                <span className="text-lg font-bold text-gray-900">{s.percent}%</span>
              </div>
              <ProgressBar
                value={s.solved}
                max={s.total}
                color={difficultyColors[diff]}
                size="sm"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                {s.solved}/{s.total} solved
              </p>
            </div>
          );
        })}
      </div>

      {/* Performance Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Performance
          </h2>
          <span className="text-xs text-gray-400">
            of {stats.totalSolved} solved problem{stats.totalSolved === 1 ? '' : 's'}
          </span>
        </div>

        {stats.totalSolved === 0 ? (
          <p className="text-sm text-gray-400">No solved problems yet</p>
        ) : (
          <>
            <div className="flex w-full h-2 rounded-full overflow-hidden bg-zinc-100">
              {PERFORMANCE_BUCKETS.map(({ key, color }) => {
                const s = performanceStats(key);
                if (s.count === 0) return null;
                return (
                  <div
                    key={key}
                    className={`${color} h-2 transition-all duration-500`}
                    style={{ width: `${(s.count / stats.totalSolved) * 100}%` }}
                  />
                );
              })}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {PERFORMANCE_BUCKETS.map(({ key, label, color, text }) => {
                const s = performanceStats(key);
                return (
                  <div key={key} className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                      <span className={`w-2 h-2 rounded-full ${color}`} />
                      {label}
                    </span>
                    <span className={`text-xl font-bold tabular-nums ${text}`}>
                      {s.percent}%
                    </span>
                    <span className="text-xs text-gray-400 tabular-nums">
                      {s.count} problem{s.count === 1 ? '' : 's'}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Category Cards */}
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
        By Category
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.byCategory.map((cat) => (
          <div
            key={cat.categoryId}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-800">{cat.categoryName}</h3>
              <span className="text-sm font-bold text-gray-700">
                {cat.solved}/{cat.total}
              </span>
            </div>
            <ProgressBar value={cat.solved} max={cat.total} size="sm" />
            <div className="flex flex-col gap-1.5 mt-3">
              {Object.values(Difficulty).map((diff) => {
                const d = cat.byDifficulty[diff];
                if (!d || d.total === 0) return null;
                const color =
                  diff === 'Easy' ? 'bg-emerald-400' : diff === 'Medium' ? 'bg-amber-400' : 'bg-rose-500';
                const textColor =
                  diff === 'Easy' ? 'text-emerald-600' : diff === 'Medium' ? 'text-amber-600' : 'text-rose-600';
                return (
                  <div key={diff} className="flex items-center gap-2">
                    <span className={`text-xs font-medium w-14 ${textColor}`}>{diff}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${d.percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums w-16 text-right">
                      {d.solved}/{d.total} ({d.percent}%)
                    </span>
                  </div>
                );
              })}
              {cat.total === 0 && (
                <span className="text-xs text-gray-400">No problems yet</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAdd && <ProblemFormModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
