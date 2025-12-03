import { OnlineIndicator } from '@/components/online-indicator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ConversationsSearch } from '../../../components/conversations-search';
import { getConversations, getFavoriteConversations } from '@/lib/chat-actions';

export const metadata = {
  title: 'Conversas - RandoChat'
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
}

export default async function Page() {
  const [conversations, favorites] = await Promise.all([
    getConversations(),
    getFavoriteConversations()
  ]);


  return (
    <>
      {/* Search */}
      <ConversationsSearch conversations={conversations} />

      <div className='flex-1 px-4 overflow-y-auto'>
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <>
            <div className='mb-4'>
              <p className='text-muted-foreground mb-3 text-sm font-medium'>
                Conversas favoritas
              </p>
              <div className='flex gap-4 overflow-x-auto pb-2'>
                {favorites.map((fav) => (
                  <Link
                    key={fav.id}
                    href={`/home/chat/${fav.id}`}
                    className='flex flex-col items-center gap-2'
                  >
                    <div className='relative'>
                      <Avatar className='h-14 w-14 border-2 border-primary'>
                        <AvatarImage src={fav.image || undefined} />
                        <AvatarFallback className='bg-theme-accent-light text-theme-accent-text'>
                          {getInitials(fav.name)}
                        </AvatarFallback>
                      </Avatar>
                      <OnlineIndicator
                        lastSeenAt={fav.lastSeenAt}
                        size='md'
                        className='absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background'
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
        <div className='space-y-1 mb-6'>
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/home/chat/${conv.id}`}
                className='hover:bg-muted/50 flex items-start gap-3 rounded-lg p-3 transition-colors'
              >
                <div className='relative'>
                  <Avatar className='h-12 w-12'>
                    <AvatarImage src={conv.image || undefined} />
                    <AvatarFallback className='bg-theme-accent-light text-theme-accent-text'>
                      {getInitials(conv.name)}
                    </AvatarFallback>
                  </Avatar>
                  <OnlineIndicator
                    lastSeenAt={conv.lastSeenAt}
                    size='sm'
                    className='absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background'
                  />
                </div>
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
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                  </div>
                  <p className='text-muted-foreground mt-1 truncate text-sm line-clamp-1'>
                    {conv.lastMessage}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className='text-muted-foreground text-center py-8'>
              <p>Nenhuma conversa ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}

    </>

  );
}
