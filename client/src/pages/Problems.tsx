import { useState } from 'react';
import { useProblems, useUpdateProblem, useDeleteProblem } from '../hooks/useProblems';
import { useCategories } from '../hooks/useCategories';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { StatusBadge } from '../components/StatusBadge';
import { ProblemFormModal } from '../components/ProblemFormModal';
import { Problem, Difficulty, Status, FilterProblemsParams } from '../types';

const STATUS_CYCLE: Record<Status, Status> = {
  [Status.Unsolved]: Status.Attempted,
  [Status.Attempted]: Status.Solved,
  [Status.Solved]: Status.Unsolved,
};

function ProblemsFilters({
  filters,
  onChange,
  categories,
}: {
  filters: FilterProblemsParams;
  onChange: (f: FilterProblemsParams) => void;
  categories: { id: string; name: string }[];
}) {
  const set = (key: keyof FilterProblemsParams, value: string) =>
    onChange({ ...filters, [key]: value || undefined });

  const selectClass =
    'bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-500';

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <input
        type="text"
        placeholder="Search problems..."
        value={filters.search ?? ''}
        onChange={(e) => set('search', e.target.value)}
        className="flex-1 min-w-[180px] bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
      />
      <select
        value={filters.category ?? ''}
        onChange={(e) => set('category', e.target.value)}
        className={selectClass}
      >
        <option value="">All Categories</option>
        {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>
      <select
        value={filters.difficulty ?? ''}
        onChange={(e) => set('difficulty', e.target.value)}
        className={selectClass}
      >
        <option value="">All Difficulties</option>
        {Object.values(Difficulty).map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select
        value={filters.status ?? ''}
        onChange={(e) => set('status', e.target.value)}
        className={selectClass}
      >
        <option value="">All Statuses</option>
        {Object.values(Status).map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}

function ProblemRow({
  problem,
  onSelect,
  onStatusToggle,
  onDelete,
}: {
  problem: Problem;
  onSelect: () => void;
  onStatusToggle: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <tr
      onClick={onSelect}
      className="group border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-gray-900 text-sm">{problem.title}</span>
          {problem.keyTechniques && (
            <div className="relative group/techniques">
              <span className="text-indigo-400 hover:text-indigo-600 cursor-pointer select-none text-2xl leading-none" title="Key Techniques">
                ⚡
              </span>
              <div className="pointer-events-none absolute left-0 top-full mt-1.5 w-80 bg-gray-900 text-gray-100 text-xs rounded-lg p-3 shadow-xl z-50 hidden group-hover/techniques:block">
                <p className="font-semibold text-indigo-300 mb-1">Key Techniques &amp; Patterns</p>
                <p className="whitespace-pre-wrap break-words font-mono">{problem.keyTechniques}</p>
              </div>
            </div>
          )}
          {problem.performanceComment && (
            <div className="relative group/perf">
              <span className="text-amber-400 hover:text-amber-600 cursor-pointer select-none text-2xl leading-none" title="Performance Comment">
                ★
              </span>
              <div className="pointer-events-none absolute left-0 top-full mt-1.5 w-72 bg-gray-900 text-gray-100 text-xs rounded-lg p-3 shadow-xl z-50 hidden group-hover/perf:block">
                <p className="font-semibold text-amber-300 mb-1">Performance</p>
                <p className="whitespace-pre-wrap break-words">{problem.performanceComment}</p>
              </div>
            </div>
          )}
        </div>
        {problem.leetcodeUrl && (
          <a
            href={problem.leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-indigo-500 hover:text-indigo-700"
          >
            leetcode ↗
          </a>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {problem.category?.name ?? '—'}
      </td>
      <td className="px-4 py-3">
        <DifficultyBadge difficulty={problem.difficulty} />
      </td>
      <td className="px-4 py-3" onClick={onStatusToggle}>
        <StatusBadge status={problem.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {problem.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {tag.name}
            </span>
          ))}
          {problem.tags.length > 3 && (
            <span className="text-xs text-gray-400">+{problem.tags.length - 3}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-400 tabular-nums">
        {new Date(problem.updatedAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-base"
          title="Delete problem"
        >
          ×
        </button>
      </td>
    </tr>
  );
}

export function Problems() {
  const [filters, setFilters] = useState<FilterProblemsParams>({});
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const { data: problems = [], isLoading } = useProblems(filters);
  const { data: categories = [] } = useCategories();
  const updateProblem = useUpdateProblem();
  const deleteProblem = useDeleteProblem();

  const handleDelete = (e: React.MouseEvent, problem: Problem) => {
    e.stopPropagation();
    if (!confirm(`Delete "${problem.title}"?`)) return;
    deleteProblem.mutate(problem.id);
  };

  const handleStatusToggle = (e: React.MouseEvent, problem: Problem) => {
    e.stopPropagation();
    updateProblem.mutate({
      id: problem.id,
      data: { status: STATUS_CYCLE[problem.status] },
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Problems</h1>
          <p className="text-gray-500 text-sm mt-1">
            {problems.length} problem{problems.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Problem
        </button>
      </div>

      <ProblemsFilters
        filters={filters}
        onChange={setFilters}
        categories={categories}
      />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : problems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No problems found.{' '}
            <button
              onClick={() => setShowAdd(true)}
              className="text-indigo-600 hover:text-indigo-700"
            >
              Add one
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Difficulty</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Tags</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {problems.map((p) => (
                <ProblemRow
                  key={p.id}
                  problem={p}
                  onSelect={() => setSelectedProblem(p)}
                  onStatusToggle={(e) => handleStatusToggle(e, p)}
                  onDelete={(e) => handleDelete(e, p)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedProblem && (
        <ProblemFormModal
          problem={selectedProblem}
          onClose={() => setSelectedProblem(null)}
        />
      )}
      {showAdd && <ProblemFormModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
