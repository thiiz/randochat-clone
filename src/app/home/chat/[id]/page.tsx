'use client';

import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageList } from '@/components/chat/message-list';
import { NoiseBackground } from '@/components/ui/noise-background';
import { GridBackground } from '@/components/ui/grid-background';
import { useIsDesktop } from '@/hooks/use-media-query';
import { useRealtimeMessages } from '@/hooks/use-realtime-messages';
import { useTypingIndicator } from '@/hooks/use-typing-indicator';
import { useSession } from '@/lib/auth-client';
import {
  getConversationMessages,
  markMessagesAsRead,
  sendMessage
} from '@/lib/chat-actions';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Message {
  id: string;
  content: string | null;
  imageUrl: string | null;
  senderId: 'me' | 'other';
  createdAt: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  name: string;
  image: string | null;
  lastSeenAt: Date | null;
  otherUserId: string;
}

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const { data: session } = useSession();
  const isDesktop = useIsDesktop();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const handleNewMessage = useCallback(
    (newMessage: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      // Marca como lida se a mensagem é do outro usuário
      if (newMessage.senderId === 'other') {
        markMessagesAsRead(conversationId);
      }
    },
    [conversationId]
  );

  useRealtimeMessages({
    conversationId,
    currentUserId: session?.user?.id || '',
    onNewMessage: handleNewMessage
  });

  const { isOtherTyping, sendTypingEvent, stopTyping } = useTypingIndicator({
    conversationId,
    currentUserId: session?.user?.id || ''
  });

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const data = await getConversationMessages(conversationId);
        setConversation(data.conversation);
        setMessages(data.messages);

        // Marca mensagens como lidas ao abrir a conversa
        await markMessagesAsRead(conversationId);
      } catch (error) {
        console.error('Failed to load conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  const handleSend = async () => {
    if (!message.trim() || !conversation) return;

    const messageText = message;
    setMessage('');
    setSending(true);
    stopTyping();

    try {
      const newMessage = await sendMessage(conversationId, messageText);
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className='bg-background flex h-dvh items-center justify-center'>
        <div className='flex flex-col items-center gap-2'>
          <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
          <p className='text-muted-foreground text-sm'>
            Carregando conversa...
          </p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className='bg-background flex h-dvh items-center justify-center'>
        <p className='text-muted-foreground'>Conversa não encontrada</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-background relative flex flex-col ${isDesktop ? 'h-full' : 'fixed inset-0 h-dvh'}`}
    >
      <NoiseBackground />
      <GridBackground opacity={0.3} />
      <ChatHeader conversation={conversation} isDesktop={isDesktop} />

      <MessageList
        messages={messages}
        conversation={conversation}
        isOtherTyping={isOtherTyping}
        loading={loading}
      />

      <ChatInput
        value={message}
        onChange={setMessage}
        onSend={handleSend}
        onTyping={sendTypingEvent}
        onStopTyping={stopTyping}
        sending={sending}
      />
    </div>
  );
}
