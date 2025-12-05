import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { OnlineIndicator } from '@/components/online-indicator';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  conversation: {
    name: string;
    image: string | null;
    otherUserId: string;
    lastSeenAt: Date | null;
  };
  isDesktop: boolean;
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
          <Avatar className='border-background h-10 w-10 border-2 sm:h-11 sm:w-11'>
            <AvatarImage src={conversation.image || undefined} />
            <AvatarFallback className='bg-primary/10 text-primary text-sm font-medium'>
              {getInitials(conversation.name)}
            </AvatarFallback>
          </Avatar>
          <OnlineIndicator
            userId={conversation.otherUserId}
            lastSeenAt={conversation.lastSeenAt}
            size='sm'
            className='border-background absolute right-0 bottom-0 rounded-full border-2'
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
        <Button
          variant='ghost'
          size='icon'
          className='text-muted-foreground h-10 w-10 rounded-full'
        >
          <MoreVertical className='h-5 w-5' />
        </Button>
      </div>
    </header>
  );
}
