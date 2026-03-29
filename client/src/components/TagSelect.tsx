import { useState, useRef, useEffect } from 'react';
import { Tag } from '../types';
import { useTags, useCreateTag } from '../hooks/useTags';

interface TagSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TagSelect({ selectedIds, onChange }: TagSelectProps) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: allTags = [] } = useTags();
  const createTag = useCreateTag();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedTags = allTags.filter((t) => selectedIds.includes(t.id));
  const filtered = allTags.filter(
    (t) =>
      !selectedIds.includes(t.id) &&
      t.name.toLowerCase().includes(input.toLowerCase()),
  );
  const exactMatch = allTags.find(
    (t) => t.name.toLowerCase() === input.toLowerCase(),
  );

  const toggle = (tag: Tag) => {
    onChange(
      selectedIds.includes(tag.id)
        ? selectedIds.filter((id) => id !== tag.id)
        : [...selectedIds, tag.id],
    );
  };

  const handleCreate = async () => {
    if (!input.trim()) return;
    const tag = await createTag.mutateAsync({ name: input.trim() });
    onChange([...selectedIds, tag.id]);
    setInput('');
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex flex-wrap gap-1.5 p-2 min-h-[42px] bg-white border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-200 transition-colors">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-xs"
          >
            {tag.name}
            <button
              type="button"
              onClick={() => toggle(tag)}
              className="hover:text-indigo-900 leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={selectedTags.length === 0 ? 'Add tags...' : ''}
          className="flex-1 min-w-[80px] bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
      </div>

      {open && (filtered.length > 0 || (input.trim() && !exactMatch)) && (
        <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filtered.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                toggle(tag);
                setInput('');
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {tag.name}
            </button>
          ))}
          {input.trim() && !exactMatch && (
            <button
              type="button"
              onClick={handleCreate}
              className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-gray-100"
            >
              + Create &quot;{input.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
