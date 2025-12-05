import { useRef, useEffect, useLayoutEffect } from 'react';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from '@/components/typing-indicator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  id: string;
  content: string | null;
  imageUrl: string | null;
  senderId: 'me' | 'other';
  createdAt: Date;
  isRead: boolean;
}

interface MessageListProps {
  messages: Message[];
  conversation: {
    name: string;
    image: string | null;
  };
  isOtherTyping: boolean;
  loading: boolean;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function MessageList({
  messages,
  conversation,
  isOtherTyping,
  loading
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);

  const scrollToBottom = (instant = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: instant ? 'instant' : 'smooth'
    });
  };

  // Initial scroll
  useLayoutEffect(() => {
    if (loading || messages.length === 0 || initialScrollDone.current) return;

    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      initialScrollDone.current = true;
    }
  }, [loading, messages]);

  // Scroll on new message
  useEffect(() => {
    if (loading || messages.length === 0 || !initialScrollDone.current) return;
    scrollToBottom();
  }, [messages, loading, isOtherTyping]);

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <p className='text-muted-foreground animate-pulse'>
          Carregando mensagens...
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className='scrollbar-thin scrollbar-thumb-muted-foreground/20 flex-1 overflow-y-auto overscroll-contain px-2 py-4 sm:px-4'
    >
      <div className='mx-auto max-w-3xl space-y-1 pb-4'>
        {messages.length === 0 ? (
          <div className='text-muted-foreground flex h-[50vh] flex-col items-center justify-center text-center'>
            <Avatar className='mb-4 h-20 w-20 opacity-50 grayscale'>
              <AvatarImage src={conversation.image || undefined} />
              <AvatarFallback>{getInitials(conversation.name)}</AvatarFallback>
            </Avatar>
            <p className='text-lg font-medium'>Nenhuma mensagem ainda</p>
            <p className='text-sm'>
              Comece a conversa com {conversation.name}!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const prevMsg = messages[index - 1];
            const nextMsg = messages[index + 1];

            const isMe = msg.senderId === 'me';
            const isPrevSameSender =
              prevMsg && prevMsg.senderId === msg.senderId;
            const isNextSameSender =
              nextMsg && nextMsg.senderId === msg.senderId;

            const isFirstInGroup = !isPrevSameSender;
            const isLastInGroup = !isNextSameSender;

            // Show avatar only for the last message in a group from 'other'
            const showAvatar = !isMe && isLastInGroup;

            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMe={isMe}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
                showAvatar={showAvatar}
                avatarSrc={conversation.image}
                initials={getInitials(conversation.name)}
              />
            );
          })
        )}

        {isOtherTyping && (
          <div className='mb-2 flex items-end gap-2 pl-1'>
            <Avatar className='mb-1 h-8 w-8'>
              <AvatarImage src={conversation.image || undefined} />
              <AvatarFallback className='bg-muted text-[10px]'>
                {getInitials(conversation.name)}
              </AvatarFallback>
            </Avatar>
            <div className='bg-muted/50 rounded-2xl rounded-tl-sm p-3'>
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className='h-1' />
      </div>
    </div>
  );
}
