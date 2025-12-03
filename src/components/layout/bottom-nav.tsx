'use client';

import { HomeIcon, MessageCircleIcon, SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/home') {
      return pathname === '/home';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className='relative border-t bg-white dark:bg-background'>
      {/* FAB Button - Floating */}
      <div className='absolute left-1/2 -translate-x-1/2 -top-7'>
        <button className='flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors'>
          <MessageCircleIcon className='h-6 w-6' />
        </button>
      </div>

      {/* Bottom Nav */}
      <div className='flex items-center justify-around px-8 pb-2 pt-4'>
        <Link
          href='/home'
          className='flex flex-col items-center gap-1'
        >
          <HomeIcon
            className={cn(
              'h-6 w-6 transition-colors',
              isActive('/home') ? 'text-primary' : 'text-muted-foreground'
            )}
          />
          <div
            className={cn(
              'h-0.5 w-8 rounded-full transition-colors',
              isActive('/home') ? 'bg-primary' : 'bg-transparent'
            )}
          />
        </Link>

        {/* Spacer for FAB */}
        <div className='w-14' />

        <Link
          href='/home/settings'
          className='flex flex-col items-center gap-1'
        >
          <SettingsIcon
            className={cn(
              'h-6 w-6 transition-colors',
              isActive('/home/settings') ? 'text-primary' : 'text-muted-foreground'
            )}
          />
          <div
            className={cn(
              'h-0.5 w-8 rounded-full transition-colors',
              isActive('/home/settings') ? 'bg-primary' : 'bg-transparent'
            )}
          />
        </Link>
      </div>
    </div>
  );
}
