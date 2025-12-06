'use client';

import { ConversationsList } from '@/components/conversations-list';
import { ConversationsSearch } from '@/components/conversations-search';
import { OnlineIndicator } from '@/components/online-indicator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { findRandomUser } from '@/lib/chat-actions';
import type { Conversation } from '@/hooks/use-realtime-conversations';
import type { User } from '@/lib/auth';
import { Loader2Icon, MessageCircleIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { UserMenu } from './user-menu';

interface FavoriteConversation {
  id: string;
  name: string;
  image: string | null;
  lastSeenAt: Date | null;
  otherUserId: string;
}

interface SidebarProps {
  user: User;
  conversations: Conversation[];
  favorites: FavoriteConversation[];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar({ user, conversations, favorites }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Get active conversation ID from pathname
  const activeConversationId = pathname.startsWith('/home/chat/')
    ? pathname.split('/home/chat/')[1]
    : null;

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRandomConnect = useCallback(async () => {
    if (isSearching || cooldown > 0) return;

    setIsSearching(true);
    try {
      // Busca usuário aleatório (validação de online feita no servidor)
      const result = await findRandomUser();

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
  }, [isSearching, cooldown, router]);

  const isDisabled = isSearching || cooldown > 0;

  return (
    <div className='bg-background flex h-full flex-col border-r'>
      {/* Header */}
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <div className='flex items-center gap-3'>
          <UserMenu user={user} />
          <h1 className='text-lg font-semibold'>Conversas</h1>
        </div>
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleRandomConnect}
            disabled={isDisabled}
            className='h-9 w-9'
            title='Encontrar alguém novo'
          >
            {isSearching ? (
              <Loader2Icon className='h-5 w-5 animate-spin' />
            ) : cooldown > 0 ? (
              <span className='text-sm font-semibold'>{cooldown}</span>
            ) : (
              <MessageCircleIcon className='h-5 w-5' />
            )}
          </Button>
          <Link href='/home/settings'>
            <Button variant='ghost' size='icon' className='h-9 w-9'>
              <Settings className='h-5 w-5' />
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <ConversationsSearch conversations={conversations} />

      {/* Content */}
      <div className='flex-1 overflow-y-auto px-4'>
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <>
            <div className='mb-4'>
              <p className='text-muted-foreground mb-3 text-sm font-medium'>
                Favoritos
              </p>
              <div className='flex gap-4 overflow-x-auto pb-2'>
                {favorites.map((fav) => (
                  <Link
                    key={fav.id}
                    href={`/home/chat/${fav.id}`}
                    className='flex flex-col items-center gap-1'
                  >
                    <div className='relative'>
                      <Avatar className={`h-10 w-10 border-2`}>
                        <AvatarImage src={fav.image || undefined} />
                        <AvatarFallback className='bg-theme-accent-light text-theme-accent-text'>
                          {getInitials(fav.name)}
                        </AvatarFallback>
                      </Avatar>
                      <OnlineIndicator
                        userId={fav.otherUserId}
                        lastSeenAt={fav.lastSeenAt}
                        size='md'
                        className='border-background absolute -right-0.5 -bottom-0.5 rounded-full border-2'
                      />
                    </div>
                    <span className='max-w-[80px] truncate text-xs font-medium'>
                      {fav.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <Separator className='mb-4' />
          </>
        )}

        {/* Conversations List */}
        <ConversationsList
          initialConversations={conversations}
          activeConversationId={activeConversationId}
        />
      </div>
    </div>
  );
}
