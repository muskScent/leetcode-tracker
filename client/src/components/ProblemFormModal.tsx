import { useState, FormEvent } from 'react';
import { Modal } from './Modal';
import { TagSelect } from './TagSelect';
import { Problem, Difficulty, Status, CreateProblemDto } from '../types';
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
  const [categoryId, setCategoryId] = useState(problem?.category?.id ?? '');
  const [tagIds, setTagIds] = useState<string[]>(problem?.tags.map((t) => t.id) ?? []);
  const [notes, setNotes] = useState(problem?.notes ?? '');
  const [timesAttempted, setTimesAttempted] = useState(problem?.timesAttempted ?? 0);

  const isPending = createProblem.isPending || updateProblem.isPending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data: CreateProblemDto = {
      title: title.trim(),
      leetcodeUrl: url.trim() || undefined,
      difficulty,
      status,
      categoryId: categoryId || null,
      tagIds,
      notes: notes.trim() || undefined,
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
    'w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

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

        <div className="grid grid-cols-2 gap-4">
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
          <label className={labelClass}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className={`${inputClass} font-mono resize-y`}
            placeholder="Key techniques, approach, gotchas..."
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
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
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
