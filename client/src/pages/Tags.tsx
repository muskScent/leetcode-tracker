import { useState, FormEvent } from 'react';
import { useTags, useCreateTag, useDeleteTag } from '../hooks/useTags';

export function Tags() {
  const { data: tags = [], isLoading } = useTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const [newName, setNewName] = useState('');

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createTag.mutate(
      { name: newName.trim() },
      { onSuccess: () => setNewName('') },
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete tag "${name}"? It will be removed from all problems.`)) return;
    deleteTag.mutate(id);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
        <p className="text-gray-500 text-sm mt-1">Label problems with techniques and topics</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-3 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New tag name..."
          className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={createTag.isPending || !newName.trim()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add Tag
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : tags.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No tags yet. Add one above.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md text-sm font-medium">
                  {tag.name}
                </span>
                <button
                  onClick={() => handleDelete(tag.id, tag.name)}
                  disabled={deleteTag.isPending}
                  className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
