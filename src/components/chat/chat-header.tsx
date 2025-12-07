import { ExpandableAvatar } from '@/components/expandable-avatar';
import { Button } from '@/components/ui/button';
import { OnlineIndicator } from '@/components/online-indicator';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FavoriteButton } from './favorite-button';
import { BlockButton } from './block-button';

interface ChatHeaderProps {
  conversation: {
    id: string;
    name: string;
    image: string | null;
    otherUserId: string;
    lastSeenAt: Date | null;
  };
  isDesktop: boolean;
  onBlockChange?: (isBlocked: boolean) => void;
  className?: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ChatHeader({
  conversation,
  isDesktop,
  onBlockChange,
  className
}: ChatHeaderProps) {
  return (
    <header
      className={cn(
        'bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b px-4 backdrop-blur-md',
        className
      )}
    >
      <div className='flex items-center gap-3'>
        {!isDesktop && (
          <Link href='/home' className='mr-1 -ml-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-10 w-10 rounded-full'
            >
              <ArrowLeft className='h-6 w-6' />
            </Button>
          </Link>
        )}

        <div className='relative'>
          <ExpandableAvatar
            src={conversation.image}
            fallback={getInitials(conversation.name)}
            name={conversation.name}
            size='md'
            showExpandIcon={true}
            avatarClassName='border-2 border-background'
          />
          <OnlineIndicator
            userId={conversation.otherUserId}
            lastSeenAt={conversation.lastSeenAt}
            size='sm'
            className='border-background pointer-events-none absolute right-0 bottom-0 rounded-full border-2'
            showIndicator={true}
          />
        </div>

        <div className='flex flex-col justify-center'>
          <span className='text-sm leading-none font-semibold tracking-tight sm:text-base'>
            {conversation.name}
          </span>
          <OnlineIndicator
            userId={conversation.otherUserId}
            lastSeenAt={conversation.lastSeenAt}
            showIndicator={false}
            showText={true}
            className='text-muted-foreground text-xs'
          />
        </div>
      </div>

      <div className='flex items-center gap-1'>
        <FavoriteButton conversationId={conversation.id} />
        <BlockButton
          otherUserId={conversation.otherUserId}
          userName={conversation.name}
          onBlockChange={onBlockChange}
        />
      </div>
    </header>
  );
}
