export interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showValues?: boolean;
  variant?: 'default' | 'warning' | 'danger';
  color?: string;
}

export function ProgressBar({
  current,
  max,
  label,
  showValues = true,
  variant = 'default',
  color,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(Math.max((current / max) * 100, 0), 100) : 0;

  // If custom color is provided, use it; otherwise use variant-based colors
  const barColor = color || (variant === 'danger' ? 'bg-red-600' : variant === 'warning' ? 'bg-yellow-500' : 'bg-emerald-600');
  const textColor = 'text-black';

  return (
    <div className="w-full">
      {(label || showValues) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-black">{label}</span>
          )}
          {showValues && (
            <span className={`text-sm font-medium ${textColor}`}>
              ${current.toFixed(2)} / ${max.toFixed(2)}
            </span>
          )}
        </div>
      )}
      <div className="w-full border border-black h-3 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {current > max && (
        <p className="text-xs text-red-600 mt-1">
          Over budget by ${(current - max).toFixed(2)}
        </p>
      )}
    </div>
  );
}
