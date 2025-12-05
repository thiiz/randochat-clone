'use client';

import {
  HomeIcon,
  MessageCircleIcon,
  SettingsIcon,
  Loader2Icon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { usePresence } from '@/contexts/presence-context';
import { findRandomUser } from '@/lib/chat-actions';
import { toast } from 'sonner';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { getOnlineUserIds } = usePresence();
  const [isSearching, setIsSearching] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const isActive = (path: string) => {
    if (path === '/home') {
      return pathname === '/home';
    }
    return pathname.startsWith(path);
  };

  const handleRandomConnect = useCallback(async () => {
    if (isSearching || cooldown > 0) return;

    setIsSearching(true);
    try {
      // Obtém IDs de usuários online da presença em tempo real
      const onlineUserIds = getOnlineUserIds();
      const result = await findRandomUser(onlineUserIds);

      if (result.success && result.conversationId) {
        router.push(`/home/chat/${result.conversationId}`);
      } else {
        toast.error(result.error || 'Erro ao buscar usuário');
        if (result.retryAfter) {
          setCooldown(result.retryAfter);
        }
      }
    } catch {
      toast.error('Erro ao conectar. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  }, [isSearching, cooldown, router, getOnlineUserIds]);

  const isDisabled = isSearching || cooldown > 0;

  return (
    <div className='dark:bg-background relative border-t bg-white'>
      {/* FAB Button - Floating */}
      <div className='absolute -top-7 left-1/2 -translate-x-1/2'>
        <button
          onClick={handleRandomConnect}
          disabled={isDisabled}
          className='bg-primary hover:bg-primary/90 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-colors disabled:opacity-70'
        >
          {isSearching ? (
            <Loader2Icon className='h-6 w-6 animate-spin' />
          ) : cooldown > 0 ? (
            <span className='text-sm font-semibold'>{cooldown}</span>
          ) : (
            <MessageCircleIcon className='h-6 w-6' />
          )}
        </button>
      </div>

      {/* Bottom Nav */}
      <div className='flex items-center justify-around px-8 pt-4 pb-2'>
        <Link href='/home' className='flex flex-col items-center gap-1'>
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
              isActive('/home/settings')
                ? 'text-primary'
                : 'text-muted-foreground'
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
