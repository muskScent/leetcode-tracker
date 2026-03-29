import { useState, FormEvent } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { Category } from '../types';

function CategoryRow({
  category,
  onDelete,
}: {
  category: Category;
  onDelete: () => void;
}) {
  const updateCategory = useUpdateCategory();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === category.name) {
      setEditing(false);
      return;
    }
    updateCategory.mutate(
      { id: category.id, data: { name: name.trim() } },
      { onSuccess: () => setEditing(false) },
    );
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-0">
      {editing ? (
        <form onSubmit={handleSave} className="flex items-center gap-2 flex-1">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-white border border-indigo-400 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-300"
          />
          <button
            type="submit"
            disabled={updateCategory.isPending}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => { setEditing(false); setName(category.name); }}
            className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-600 text-xs rounded border border-gray-300 transition-colors"
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          <div className="flex-1">
            <span className="font-medium text-gray-900">{category.name}</span>
            <span className="ml-3 text-sm text-gray-500">
              {category.totalProblems ?? 0} problems
              {(category.solvedProblems ?? 0) > 0 && (
                <span className="text-green-600 ml-1">
                  · {category.solvedProblems} solved
                </span>
              )}
            </span>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            Rename
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}

export function Categories() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const [newName, setNewName] = useState('');

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createCategory.mutate(
      { name: newName.trim() },
      { onSuccess: () => setNewName('') },
    );
  };

  const handleDelete = (category: Category) => {
    if (!confirm(`Delete "${category.name}"? Problems in this category will be uncategorized.`)) return;
    deleteCategory.mutate(category.id);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-500 text-sm mt-1">Organize problems by topic</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-3 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name..."
          className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={createCategory.isPending || !newName.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add Category
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No categories yet. Add one above.
          </div>
        ) : (
          categories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              onDelete={() => handleDelete(cat)}
            />
          ))
        )}
      </div>
    </div>
  );
}
