import { UserMenu } from '@/components/layout/user-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth';
import { Home, Search, Settings, Shuffle } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';

export const metadata = {
  title: 'Conversas - RandoChat'
};

// Mock data - será substituído por dados reais do banco
const mockFavorites = [
  { id: '1', title: 'Avengers Endgame', participants: 5, image: null },
  { id: '2', title: 'Paris Stories', participants: 3, image: null }
];

const mockConversations = [
  {
    id: '1',
    title: 'Keto recipes',
    lastMessage: 'Here are 18 recipes for healthy low-carb breakfasts that also happen...',
    time: '11:20',
    unreadCount: 4,
    participants: [{ name: 'User 1' }, { name: 'User 2' }, { name: 'User 3' }]
  },
  {
    id: '2',
    title: 'Tattoo ideas',
    lastMessage: "So you can't waste surface area with a tattoo that's subpar. That's...",
    time: '11:20',
    unreadCount: 2,
    participants: [{ name: 'User 1' }, { name: 'User 2' }]
  },
  {
    id: '3',
    title: 'Best places in Victoria',
    lastMessage: "Known as the Garden City, it's in full bloom in spring and summer...",
    time: '11:20',
    unreadCount: 0,
    participants: [{ name: 'User 1' }]
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
    <div className='flex h-screen flex-col bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-background'>
      {/* Header */}
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <div className='flex items-center gap-3'>
          <UserMenu user={session.user} />
          <h1 className='text-lg font-semibold'>Minhas conversas</h1>
        </div>
      </div>

      {/* Search */}
      <div className='px-4 py-3'>
        <div className='relative'>
          <Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Buscar nova conversa'
            className='bg-muted/50 pl-9'
          />
        </div>
      </div>

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
                  <Avatar className='h-14 w-14 border-2 border-emerald-500'>
                    <AvatarImage src={fav.image || undefined} />
                    <AvatarFallback className='bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'>
                      {getInitials(fav.title)}
                    </AvatarFallback>
                  </Avatar>
                  <span className='max-w-[80px] truncate text-xs font-medium'>
                    {fav.title}
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
                  <AvatarFallback className='bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'>
                    {getInitials(conv.title)}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>{conv.title}</span>
                    <span className='text-muted-foreground text-xs'>
                      {conv.time}
                    </span>
                  </div>
                  <p className='text-muted-foreground mt-1 truncate text-sm'>
                    {conv.lastMessage}
                  </p>
                  <div className='mt-2 flex items-center justify-between'>
                    <div className='flex -space-x-2'>
                      {conv.participants.slice(0, 3).map((p, i) => (
                        <Avatar key={i} className='h-6 w-6 border-2 border-white dark:border-background'>
                          <AvatarFallback className='bg-muted text-[10px]'>
                            {getInitials(p.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {conv.participants.length > 3 && (
                        <div className='flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-[10px] font-medium text-emerald-700 dark:border-background dark:bg-emerald-900 dark:text-emerald-300'>
                          +{conv.participants.length - 3}
                        </div>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge className='h-5 min-w-5 justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] hover:bg-emerald-500'>
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className='flex items-center justify-around border-t py-3'>
        <Button variant='ghost' size='icon' className='text-emerald-600'>
          <Home className='h-5 w-5' />
        </Button>
        <Button
          size='icon'
          className='h-12 w-12 rounded-full bg-emerald-500 hover:bg-emerald-600'
        >
          <Shuffle className='h-5 w-5' />
        </Button>
        <Button variant='ghost' size='icon'>
          <Settings className='h-5 w-5' />
        </Button>
      </div>
    </div>
  );
}
