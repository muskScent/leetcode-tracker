import { Status } from '../types';

const styles: Record<Status, string> = {
  [Status.Unsolved]: 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-500/15',
  [Status.Attempted]: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  [Status.Solved]: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
