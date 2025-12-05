'use client';

import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('ml-1 flex items-center gap-1', className)}>
      <span
        className='bg-muted-foreground h-1.5 w-1.5 animate-bounce rounded-full'
        style={{ animationDelay: '0ms', animationDuration: '600ms' }}
      />
      <span
        className='bg-muted-foreground h-1.5 w-1.5 animate-bounce rounded-full'
        style={{ animationDelay: '150ms', animationDuration: '600ms' }}
      />
      <span
        className='bg-muted-foreground h-1.5 w-1.5 animate-bounce rounded-full'
        style={{ animationDelay: '300ms', animationDuration: '600ms' }}
      />
    </div>
  );
}
