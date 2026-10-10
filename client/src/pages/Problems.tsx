import { useState } from 'react';
import { useProblems, useUpdateProblem, useDeleteProblem } from '../hooks/useProblems';
import { useCategories } from '../hooks/useCategories';
import { useTags } from '../hooks/useTags';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { StatusBadge } from '../components/StatusBadge';
import { ProblemFormModal } from '../components/ProblemFormModal';
import { Problem, Difficulty, Status, Performance, FilterProblemsParams, Tag } from '../types';

const STATUS_CYCLE: Record<Status, Status> = {
  [Status.Unsolved]: Status.Attempted,
  [Status.Attempted]: Status.Solved,
  [Status.Solved]: Status.Unsolved,
};

const PAGE_SIZE = 10;

/** Page numbers to render: first, last, and the current page ±1, with '…' for the gaps. */
function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const visible = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  return visible.flatMap((n, i) =>
    i > 0 && n - visible[i - 1] > 1 ? ['…' as const, n] : [n],
  );
}

const PERFORMANCE_ROW_CLASS: Record<Performance, string> = {
  [Performance.Good]: 'bg-emerald-50 hover:bg-emerald-100',
  [Performance.Average]: 'bg-amber-50 hover:bg-amber-100',
  [Performance.Bad]: 'bg-red-50 hover:bg-red-100',
};

function ProblemsFilters({
  filters,
  onChange,
  categories,
  tags,
}: {
  filters: FilterProblemsParams;
  onChange: (f: FilterProblemsParams) => void;
  categories: { id: string; name: string }[];
  tags: Tag[];
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
      <select
        value={filters.tag ?? ''}
        onChange={(e) => set('tag', e.target.value)}
        className={selectClass}
      >
        <option value="">All Tags</option>
        {tags.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
      </select>
    </div>
  );
}

function ProblemRow({
  problem,
  onSelect,
  onStatusToggle,
  onDelete,
  onTagClick,
}: {
  problem: Problem;
  onSelect: () => void;
  onStatusToggle: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onTagClick: (e: React.MouseEvent, tag: Tag) => void;
}) {
  return (
    <tr
      onClick={onSelect}
      className={`group border-b border-zinc-100 cursor-pointer transition-colors ${
        problem.performance ? PERFORMANCE_ROW_CLASS[problem.performance] : 'hover:bg-zinc-50'
      }`}
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
            <button
              key={tag.id}
              onClick={(e) => onTagClick(e, tag)}
              title={`Filter by ${tag.name}`}
              className="px-1.5 py-0.5 bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-700 rounded text-xs transition-colors"
            >
              {tag.name}
            </button>
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
  const [page, setPage] = useState(1);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const { data: problems = [], isLoading } = useProblems(filters);
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
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

  const handleTagClick = (e: React.MouseEvent, tag: Tag) => {
    e.stopPropagation();
    setFilters((f) => ({
      ...f,
      tag: f.tag === tag.name ? undefined : tag.name,
    }));
    setPage(1);
  };

  const handleFiltersChange = (f: FilterProblemsParams) => {
    setFilters(f);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(problems.length / PAGE_SIZE));
  // Clamp so deleting the last row of the last page doesn't strand us on an empty page.
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageProblems = problems.slice(pageStart, pageStart + PAGE_SIZE);

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
        onChange={handleFiltersChange}
        categories={categories}
        tags={tags}
      />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-visible">
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
                <th className="px-4 py-3 text-left rounded-tl-xl">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Difficulty</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Tags</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 rounded-tr-xl" />
              </tr>
            </thead>
            <tbody>
              {pageProblems.map((p) => (
                <ProblemRow
                  key={p.id}
                  problem={p}
                  onSelect={() => setSelectedProblem(p)}
                  onStatusToggle={(e) => handleStatusToggle(e, p)}
                  onDelete={(e) => handleDelete(e, p)}
                  onTagClick={handleTagClick}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!isLoading && problems.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500 tabular-nums">
            Showing {pageStart + 1}–{pageStart + pageProblems.length} of {problems.length}
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
