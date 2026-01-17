export interface SkeletonProps {
  variant?: 'card' | 'list-item' | 'stat-card';
  className?: string;
}

export function Skeleton({ variant = 'card', className = '' }: SkeletonProps) {
  const baseClasses = 'bg-gray-300';

  if (variant === 'card') {
    return (
      <div className={`${baseClasses} p-4 sm:p-6 space-y-4 border border-black ${className}`}>
        <div className="h-4 bg-gray-400 w-3/4"></div>
        <div className="h-3 bg-gray-400 w-1/2"></div>
        <div className="space-y-2 pt-4 border-t border-black">
          <div className="h-3 bg-gray-400"></div>
          <div className="h-3 bg-gray-400 w-5/6"></div>
        </div>
      </div>
    );
  }

  if (variant === 'list-item') {
    return (
      <div className={`${baseClasses} p-4 sm:p-6 min-h-[72px] flex items-center justify-between border border-black ${className}`}>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-400 w-2/3"></div>
          <div className="h-3 bg-gray-400 w-1/2"></div>
        </div>
        <div className="h-4 bg-gray-400 w-20"></div>
      </div>
    );
  }

  if (variant === 'stat-card') {
    return (
      <div className={`${baseClasses} p-4 sm:p-6 space-y-2 border border-black ${className}`}>
        <div className="h-3 bg-gray-400 w-1/2"></div>
        <div className="h-8 bg-gray-400 w-3/4"></div>
      </div>
    );
  }

  return <div className={`${baseClasses} h-20 border border-black ${className}`}></div>;
}
