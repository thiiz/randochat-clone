'use client';

import { usePresenceOptional } from '@/contexts/presence-context';
import {
  isUserOnline as isUserOnlineByLastSeen,
  getLastSeenText
} from '@/lib/online-status';
import { cn } from '@/lib/utils';

interface OnlineIndicatorProps {
  userId?: string;
  lastSeenAt?: Date | null;
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
  userId,
  lastSeenAt,
  showText = false,
  size = 'md',
  className
}: OnlineIndicatorProps) {
  const presence = usePresenceOptional();

  // Determina se está online:
  // 1. Se temos presença disponível E userId, usa APENAS presença (fonte real-time)
  // 2. Senão, usa lastSeenAt como fallback
  const hasPresenceContext = presence !== null;
  const isOnlineViaPresence =
    userId && hasPresenceContext && presence.isUserOnline(userId);
  const isOnlineViaLastSeen = isUserOnlineByLastSeen(lastSeenAt);

  // Prioriza presença quando disponível, senão usa lastSeenAt
  const online =
    hasPresenceContext && userId ? isOnlineViaPresence : isOnlineViaLastSeen;

  // Determina o texto a exibir
  const getStatusText = () => {
    if (online) return 'Online';
    return getLastSeenText(lastSeenAt);
  };

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
        <span className='text-muted-foreground text-xs'>{getStatusText()}</span>
      )}
    </div>
  );
}
