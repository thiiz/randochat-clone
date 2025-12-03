'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarResults,
  KBarSearch,
  useKBar,
  useMatches
} from 'kbar';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

interface ConversationsSearchProps {
  conversations: Conversation[];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function SearchTrigger() {
  const { query } = useKBar();

  return (
    <div className='px-4 py-3'>
      <div className='relative'>
        <Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
        <Input
          placeholder='Buscar conversa...'
          className='bg-muted/50 pl-9 cursor-pointer'
          onClick={() => query.toggle()}
          readOnly
        />
      </div>
    </div>
  );
}

function SearchResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className='text-muted-foreground px-4 py-2 text-xs uppercase'>
            {item}
          </div>
        ) : (
          <div
            className={`flex cursor-pointer items-center gap-3 px-4 py-3 ${
              active ? 'bg-emerald-50 dark:bg-emerald-950/50' : ''
            }`}
          >
            <Avatar className='h-10 w-10'>
              <AvatarFallback className='bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-sm'>
                {item.icon}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <p className='font-medium text-sm'>{item.name}</p>
              {item.subtitle && (
                <p className='text-muted-foreground text-xs truncate'>
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>
        )
      }
    />
  );
}

export function ConversationsSearch({
  conversations
}: ConversationsSearchProps) {
  const router = useRouter();

  const actions = useMemo(() => {
    return conversations.map((conv) => ({
      id: conv.id,
      name: conv.name,
      subtitle: conv.lastMessage,
      icon: getInitials(conv.name),
      keywords: conv.name.toLowerCase(),
      section: 'Conversas',
      perform: () => router.push(`/chat/${conv.id}`)
    }));
  }, [conversations, router]);

  return (
    <KBarProvider actions={actions}>
      <SearchTrigger />
      <KBarPortal>
        <KBarPositioner className='bg-background/80 fixed inset-0 z-50 backdrop-blur-sm'>
          <KBarAnimator className='bg-card text-card-foreground w-full max-w-md overflow-hidden rounded-xl border shadow-2xl'>
            <div className='border-b px-4 py-3'>
              <KBarSearch
                className='bg-transparent w-full border-none text-base outline-none placeholder:text-muted-foreground'
                defaultPlaceholder='Buscar conversa...'
              />
            </div>
            <div className='max-h-[300px] overflow-y-auto'>
              <SearchResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
    </KBarProvider>
  );
}
