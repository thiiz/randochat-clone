import { UserMenu } from '@/components/layout/user-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth';
import { Home, Settings, Shuffle } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { ConversationsSearch } from './_components/conversations-search';

export const metadata = {
  title: 'Conversas - RandoChat'
};

// Mock data - será substituído por dados reais do banco
const mockFavorites = [
  { id: '1', name: 'Anônimo #1234', image: null },
  { id: '2', name: 'Anônimo #5678', image: null }
];

const mockConversations = [
  {
    id: '1',
    name: 'Anônimo #1234',
    lastMessage: 'Here are 18 recipes for healthy low-carb breakfasts that also happen...',
    time: '11:20',
    unreadCount: 4
  },
  {
    id: '2',
    name: 'Anônimo #5678',
    lastMessage: "So you can't waste surface area with a tattoo that's subpar. That's...",
    time: '11:20',
    unreadCount: 2
  },
  {
    id: '3',
    name: 'Anônimo #9012',
    lastMessage: "Known as the Garden City, it's in full bloom in spring and summer...",
    time: '11:20',
    unreadCount: 0
  }
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return null;
  }

  return (
    <div className='flex h-screen flex-col bg-gradient-to-b from-theme-gradient-from to-white dark:from-theme-gradient-dark-from dark:to-background'>
      {/* Header */}
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <div className='flex items-center gap-3'>
          <UserMenu user={session.user} />
          <h1 className='text-lg font-semibold'>Minhas conversas</h1>
        </div>
      </div>

      {/* Search */}
      <ConversationsSearch conversations={mockConversations} />

      <ScrollArea className='flex-1 px-4'>
          {/* Favorites Section */}
          <div className='mb-4'>
            <p className='text-muted-foreground mb-3 text-sm font-medium'>
              Conversas favoritas
            </p>
            <div className='flex gap-4 overflow-x-auto pb-2'>
              {mockFavorites.map((fav) => (
                <Link
                  key={fav.id}
                  href={`/chat/${fav.id}`}
                  className='flex flex-col items-center gap-2'
                >
                  <Avatar className='h-14 w-14 border-2 border-primary'>
                    <AvatarImage src={fav.image || undefined} />
                    <AvatarFallback className='bg-theme-accent-light text-theme-accent-text'>
                      {getInitials(fav.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className='max-w-[80px] truncate text-xs font-medium'>
                    {fav.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <Separator className='mb-4' />

          {/* Conversations List */}
          <div className='space-y-1'>
            {mockConversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className='hover:bg-muted/50 flex items-start gap-3 rounded-lg p-3 transition-colors'
              >
                <Avatar className='h-12 w-12'>
                  <AvatarFallback className='bg-theme-accent-light text-theme-accent-text'>
                    {getInitials(conv.name)}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>{conv.name}</span>
                    <div className='flex items-center gap-2'>
                      {conv.unreadCount > 0 && (
                        <Badge className='h-5 min-w-5 justify-center rounded-full bg-primary px-1.5 text-[10px] hover:bg-primary'>
                          {conv.unreadCount}
                        </Badge>
                      )}
                      <span className='text-muted-foreground text-xs'>
                        {conv.time}
                      </span>
                    </div>
                  </div>
                  <p className='text-muted-foreground mt-1 truncate text-sm'>
                    {conv.lastMessage}
                  </p>
                </div>
              </Link>
            ))}
          </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className='flex items-center justify-around border-t py-3'>
        <Button variant='ghost' size='icon' className='text-primary'>
          <Home className='h-5 w-5' />
        </Button>
        <Button
          size='icon'
          className='h-12 w-12 rounded-full bg-primary hover:bg-primary/90'
        >
          <Shuffle className='h-5 w-5' />
        </Button>
        <Button variant='ghost' size='icon' asChild>
          <Link href='/settings'>
            <Settings className='h-5 w-5' />
          </Link>
        </Button>
      </div>
    </div>
  );
}
