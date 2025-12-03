'use client';

import { isUserOnline, getLastSeenText } from '@/lib/online-status';
import { cn } from '@/lib/utils';

interface OnlineIndicatorProps {
  lastSeenAt: Date | null | undefined;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3'
};

export function OnlineIndicator({
  lastSeenAt,
  showText = false,
  size = 'md',
  className
}: OnlineIndicatorProps) {
  const online = isUserOnline(lastSeenAt);

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'rounded-full',
          sizeClasses[size],
          online ? 'bg-green-500' : 'bg-gray-400'
        )}
      />
      {showText && (
        <span className='text-xs text-muted-foreground'>
          {online ? 'Online' : getLastSeenText(lastSeenAt)}
        </span>
      )}
    </div>
  );
}
