interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({
  value,
  max,
  color,
  showLabel = false,
  size = 'md',
}: ProgressBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  const height = size === 'sm' ? 'h-1.5' : 'h-2';

  const fill = color ?? 'bg-blue-500';

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 bg-zinc-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${fill} rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-zinc-400 tabular-nums w-12 text-right">
          {value}/{max}
        </span>
      )}
    </div>
  );
}
