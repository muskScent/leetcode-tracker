import { useState } from 'react';
import { useStats } from '../hooks/useStats';
import { ProgressBar } from '../components/ProgressBar';
import { ProblemFormModal } from '../components/ProblemFormModal';
import { Difficulty } from '../types';

const difficultyColors: Record<string, string> = {
  Easy: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Hard: 'bg-red-500',
};

export function Dashboard() {
  const { data: stats, isLoading } = useStats();
  const [showAdd, setShowAdd] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading stats...
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Your interview prep progress</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Problem
        </button>
      </div>

      {/* Overall Progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Overall Progress
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
                  diff === 'Easy' ? 'bg-green-500' : diff === 'Medium' ? 'bg-yellow-500' : 'bg-red-500';
                const textColor =
                  diff === 'Easy' ? 'text-green-700' : diff === 'Medium' ? 'text-yellow-700' : 'text-red-700';
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
