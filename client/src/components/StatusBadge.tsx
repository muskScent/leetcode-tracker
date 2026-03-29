import { Status } from '../types';

const styles: Record<Status, string> = {
  [Status.Unsolved]: 'bg-gray-100 text-gray-600 border border-gray-200',
  [Status.Attempted]: 'bg-orange-100 text-orange-700 border border-orange-200',
  [Status.Solved]: 'bg-green-100 text-green-700 border border-green-200',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
