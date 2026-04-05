import { Difficulty } from '../types';

const styles: Record<Difficulty, string> = {
  [Difficulty.Easy]: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  [Difficulty.Medium]: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  [Difficulty.Hard]: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}
