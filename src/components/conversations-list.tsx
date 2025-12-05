'use client';

import { OnlineIndicator } from '@/components/online-indicator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  useRealtimeConversations,
  type Conversation
} from '@/hooks/use-realtime-conversations';
import { markMessagesAsRead } from '@/lib/chat-actions';
import Link from 'next/link';

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
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return new Date(date).toLocaleDateString('pt-BR', {
    month: 'short',
    day: 'numeric'
  });
}

interface ConversationsListProps {
  initialConversations: Conversation[];
  activeConversationId?: string | null;
}

export function ConversationsList({
  initialConversations,
  activeConversationId
}: ConversationsListProps) {
  const { conversations, clearUnreadCount } =
    useRealtimeConversations(initialConversations);

  const handleConversationClick = (conversationId: string) => {
    // Limpa o contador localmente de forma imediata (UX instantânea)
    clearUnreadCount(conversationId);
    // Marca como lido no servidor em background
    markMessagesAsRead(conversationId);
  };

  if (conversations.length === 0) {
    return (
      <div className='text-muted-foreground py-8 text-center'>
        <p>Nenhuma conversa ainda</p>
      </div>
    );
  }

  return (
    <div className='mb-6 space-y-1'>
      {conversations.map((conv) => (
        <Link
          key={conv.id}
          href={`/home/chat/${conv.id}`}
          onClick={() => handleConversationClick(conv.id)}
          className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${
            activeConversationId === conv.id ? 'bg-muted' : 'hover:bg-muted/50'
          }`}
        >
          <div className='relative'>
            <Avatar className='h-12 w-12'>
              <AvatarImage src={conv.image || undefined} />
              <AvatarFallback className='bg-theme-accent-light text-theme-accent-text'>
                {getInitials(conv.name)}
              </AvatarFallback>
            </Avatar>
            <OnlineIndicator
              userId={conv.otherUserId}
              lastSeenAt={conv.lastSeenAt}
              size='sm'
              className='border-background absolute -right-0.5 -bottom-0.5 rounded-full border-2'
            />
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center justify-between'>
              <span className='font-medium'>{conv.name}</span>
              <div className='flex items-center gap-2'>
                {conv.unreadCount > 0 && (
                  <Badge className='bg-primary hover:bg-primary h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]'>
                    {conv.unreadCount}
                  </Badge>
                )}
                <span className='text-muted-foreground text-xs'>
                  {formatTime(conv.lastMessageTime)}
                </span>
              </div>
            </div>
            <p className='text-muted-foreground mt-1 line-clamp-1 truncate text-sm'>
              {conv.lastMessage}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
