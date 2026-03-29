import { Difficulty } from '../types';

const styles: Record<Difficulty, string> = {
  [Difficulty.Easy]: 'bg-green-100 text-green-700 border border-green-200',
  [Difficulty.Medium]: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  [Difficulty.Hard]: 'bg-red-100 text-red-700 border border-red-200',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}
