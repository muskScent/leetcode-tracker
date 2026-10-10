import { useState } from 'react';
import { useNotes, useDeleteNote } from '../hooks/useNotes';
import { useTags } from '../hooks/useTags';
import { NoteFormModal } from '../components/NoteFormModal';
import { Note, FilterNotesParams } from '../types';

function NoteCard({
  note,
  onSelect,
  onDelete,
}: {
  note: Note;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="group bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
          {note.title}
        </h3>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-base shrink-0"
          title="Delete note"
        >
          ×
        </button>
      </div>
      {note.content && (
        <p className="text-xs text-gray-500 line-clamp-4 whitespace-pre-wrap">
          {note.content}
        </p>
      )}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {note.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-xs"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-auto pt-1 tabular-nums">
        Updated {new Date(note.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export function Notes() {
  const [filters, setFilters] = useState<FilterNotesParams>({});
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const { data: notes = [], isLoading } = useNotes(filters);
  const { data: tags = [] } = useTags();
  const deleteNote = useDeleteNote();

  const handleDelete = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    if (!confirm(`Delete "${note.title}"?`)) return;
    deleteNote.mutate(note.id);
  };

  const set = (key: keyof FilterNotesParams, value: string) =>
    setFilters({ ...filters, [key]: value || undefined });

  const selectClass =
    'bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-500';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-500 text-sm mt-1">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Note
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search notes..."
          value={filters.search ?? ''}
          onChange={(e) => set('search', e.target.value)}
          className="flex-1 min-w-[180px] bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
        />
        <select
          value={filters.tag ?? ''}
          onChange={(e) => set('tag', e.target.value)}
          className={selectClass}
        >
          <option value="">All Tags</option>
          {tags.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 shadow-sm">
          Loading...
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 shadow-sm">
          No notes found.{' '}
          <button
            onClick={() => setShowAdd(true)}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Add one
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              onSelect={() => setSelectedNote(n)}
              onDelete={(e) => handleDelete(e, n)}
            />
          ))}
        </div>
      )}

      {selectedNote && (
        <NoteFormModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}
      {showAdd && <NoteFormModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
