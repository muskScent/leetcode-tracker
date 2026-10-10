import { useState, FormEvent } from 'react';
import { Modal } from './Modal';
import { TagSelect } from './TagSelect';
import { Problem, Difficulty, Status, Performance, CreateProblemDto } from '../types';
import { useCategories } from '../hooks/useCategories';
import { useCreateProblem, useUpdateProblem, useDeleteProblem } from '../hooks/useProblems';

interface Props {
  problem?: Problem;
  onClose: () => void;
}

export function ProblemFormModal({ problem, onClose }: Props) {
  const isEdit = !!problem;
  const { data: categories = [] } = useCategories();
  const createProblem = useCreateProblem();
  const updateProblem = useUpdateProblem();
  const deleteProblem = useDeleteProblem();

  const [title, setTitle] = useState(problem?.title ?? '');
  const [url, setUrl] = useState(problem?.leetcodeUrl ?? '');
  const [difficulty, setDifficulty] = useState<Difficulty>(problem?.difficulty ?? Difficulty.Medium);
  const [status, setStatus] = useState<Status>(problem?.status ?? Status.Unsolved);
  const [performance, setPerformance] = useState<Performance | ''>(problem?.performance ?? '');
  const [categoryId, setCategoryId] = useState(problem?.category?.id ?? '');
  const [tagIds, setTagIds] = useState<string[]>(problem?.tags.map((t) => t.id) ?? []);
  const [keyTechniques, setKeyTechniques] = useState(problem?.keyTechniques ?? '');
  const [performanceComment, setPerformanceComment] = useState(problem?.performanceComment ?? '');
  const [timesAttempted, setTimesAttempted] = useState(problem?.timesAttempted ?? 0);

  const isPending = createProblem.isPending || updateProblem.isPending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data: CreateProblemDto = {
      title: title.trim(),
      leetcodeUrl: url.trim() || undefined,
      difficulty,
      status,
      performance: performance || null,
      categoryId: categoryId || null,
      tagIds,
      keyTechniques: keyTechniques.trim() || undefined,
      performanceComment: performanceComment.trim() || undefined,
      timesAttempted,
    };
    if (isEdit) {
      await updateProblem.mutateAsync({ id: problem.id, data });
    } else {
      await createProblem.mutateAsync(data);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!problem || !confirm(`Delete "${problem.title}"?`)) return;
    await deleteProblem.mutateAsync(problem.id);
    onClose();
  };

  const inputClass =
    'w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors';
  const labelClass = 'block text-xs font-medium text-zinc-500 mb-1.5';

  return (
    <Modal title={isEdit ? 'Edit Problem' : 'Add Problem'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass}>Title *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="e.g. Two Sum"
          />
        </div>

        <div>
          <label className={labelClass}>LeetCode URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={inputClass}
            placeholder="https://leetcode.com/problems/..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className={inputClass}
            >
              {Object.values(Difficulty).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className={inputClass}
            >
              {Object.values(Status).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Performance</label>
            <select
              value={performance}
              onChange={(e) => setPerformance(e.target.value as Performance | '')}
              className={inputClass}
            >
              <option value="">— None —</option>
              {Object.values(Performance).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Times Attempted</label>
            <input
              type="number"
              min={0}
              value={timesAttempted}
              onChange={(e) => setTimesAttempted(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Tags</label>
          <TagSelect selectedIds={tagIds} onChange={setTagIds} />
        </div>

        <div>
          <label className={labelClass}>Key Techniques &amp; Patterns</label>
          <textarea
            value={keyTechniques}
            onChange={(e) => setKeyTechniques(e.target.value)}
            rows={3}
            className={`${inputClass} font-mono resize-y`}
            placeholder="e.g. Two pointers, sliding window, hashmap for O(1) lookup..."
          />
        </div>

        <div>
          <label className={labelClass}>Performance Comment</label>
          <textarea
            value={performanceComment}
            onChange={(e) => setPerformanceComment(e.target.value)}
            rows={2}
            className={`${inputClass} resize-y`}
            placeholder="e.g. Solved quickly, ugly brute-force, took too long on edge cases..."
          />
        </div>

        {isEdit && (
          <p className="text-xs text-gray-400">
            Updated {new Date(problem.updatedAt).toLocaleDateString()}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Problem'}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteProblem.isPending}
              className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-sm rounded-lg border border-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
