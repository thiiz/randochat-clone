import { ConversationsList } from '@/components/conversations-list';
import { OnlineIndicator } from '@/components/online-indicator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

export default async function Page() {
  const [conversations, favorites] = await Promise.all([
    getConversations(),
    getFavoriteConversations()
  ]);

  return (
    <>
      {/* Search */}
      <ConversationsSearch conversations={conversations} />

      <div className='flex-1 overflow-y-auto px-4'>
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
                      <Avatar className='border-primary h-14 w-14 border-2'>
                        <AvatarImage src={fav.image || undefined} />
                        <AvatarFallback className='bg-theme-accent-light text-theme-accent-text'>
                          {getInitials(fav.name)}
                        </AvatarFallback>
                      </Avatar>
                      <OnlineIndicator
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
        <ConversationsList initialConversations={conversations} />
      </div>

      {/* Bottom Navigation */}
    </>
  );
}
