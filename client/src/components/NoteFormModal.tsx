import { useState, FormEvent } from 'react';
import { Modal } from './Modal';
import { TagSelect } from './TagSelect';
import { Note, CreateNoteDto } from '../types';
import { useCreateNote, useUpdateNote, useDeleteNote } from '../hooks/useNotes';

interface Props {
  note?: Note;
  onClose: () => void;
}

export function NoteFormModal({ note, onClose }: Props) {
  const isEdit = !!note;
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [tagIds, setTagIds] = useState<string[]>(note?.tags.map((t) => t.id) ?? []);

  const isPending = createNote.isPending || updateNote.isPending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data: CreateNoteDto = {
      title: title.trim(),
      content: content.trim() || undefined,
      tagIds,
    };
    if (isEdit) {
      await updateNote.mutateAsync({ id: note.id, data });
    } else {
      await createNote.mutateAsync(data);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!note || !confirm(`Delete "${note.title}"?`)) return;
    await deleteNote.mutateAsync(note.id);
    onClose();
  };

  const inputClass =
    'w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors';
  const labelClass = 'block text-xs font-medium text-zinc-500 mb-1.5';

  return (
    <Modal title={isEdit ? 'Edit Note' : 'Add Note'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass}>Title *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="e.g. Sliding window cheatsheet"
          />
        </div>

        <div>
          <label className={labelClass}>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className={`${inputClass} resize-y`}
            placeholder="Write your note here..."
          />
        </div>

        <div>
          <label className={labelClass}>Tags</label>
          <TagSelect selectedIds={tagIds} onChange={setTagIds} />
        </div>

        {isEdit && (
          <p className="text-xs text-gray-400">
            Updated {new Date(note.updatedAt).toLocaleDateString()}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Note'}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteNote.isPending}
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
