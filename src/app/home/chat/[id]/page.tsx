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
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useFailedMessages } from '@/hooks/use-failed-messages';

interface Message {
  id: string;
  content: string | null;
  imageUrl: string | null;
  senderId: 'me' | 'other';
  createdAt: Date;
  isRead: boolean;
  status?: 'sending' | 'sent' | 'failed';
}

interface Conversation {
  id: string;
  name: string;
  image: string | null;
  lastSeenAt: Date | null;
  otherUserId: string;
  isBlocked?: boolean;
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

  const { failedMessages, saveFailedMessage, removeFailedMessage } =
    useFailedMessages(conversationId);

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

  const handleMessageRead = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m))
    );
  }, []);

  useRealtimeMessages({
    conversationId,
    currentUserId: session?.user?.id || '',
    onNewMessage: handleNewMessage,
    onMessageRead: handleMessageRead
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

  // Combina mensagens do servidor com mensagens falhadas do localStorage
  const allMessages = useMemo(() => {
    const failed: Message[] = failedMessages.map((fm) => ({
      id: fm.id,
      content: fm.content,
      imageUrl: fm.imageUrl,
      senderId: 'me' as const,
      createdAt: new Date(fm.createdAt),
      isRead: false,
      status: 'failed' as const
    }));

    // Filtra mensagens falhadas que já existem no estado (evita duplicatas)
    const newFailed = failed.filter(
      (fm) => !messages.some((m) => m.id === fm.id)
    );

    return [...messages, ...newFailed].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages, failedMessages]);

  const handleSend = async () => {
    if (!message.trim() || !conversation) return;

    const messageText = message;
    const tempId = `temp-${Date.now()}`;

    // Adiciona mensagem temporária com status 'sending'
    const tempMessage: Message = {
      id: tempId,
      content: messageText,
      imageUrl: null,
      senderId: 'me',
      createdAt: new Date(),
      isRead: false,
      status: 'sending'
    };

    setMessages((prev) => [...prev, tempMessage]);
    setMessage('');
    setSending(true);
    stopTyping();

    try {
      const newMessage = await sendMessage(conversationId, messageText);
      // Substitui a mensagem temporária pela real
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...newMessage, status: 'sent' as const } : m
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      // Marca a mensagem como falha e salva no localStorage
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
      );
      saveFailedMessage(tempMessage);
    } finally {
      setSending(false);
    }
  };

  const handleRetry = useCallback(
    async (messageId: string) => {
      const failedMessage = allMessages.find((m) => m.id === messageId);
      if (!failedMessage || !failedMessage.content) return;

      // Atualiza status para 'sending'
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status: 'sending' } : m))
      );

      try {
        const newMessage = await sendMessage(
          conversationId,
          failedMessage.content
        );
        // Substitui a mensagem falha pela real e remove do localStorage
        setMessages((prev) => {
          // Se a mensagem não existe no estado (veio do localStorage), adiciona
          const exists = prev.some((m) => m.id === messageId);
          if (!exists) {
            return [...prev, { ...newMessage, status: 'sent' as const }];
          }
          return prev.map((m) =>
            m.id === messageId ? { ...newMessage, status: 'sent' as const } : m
          );
        });
        removeFailedMessage(messageId);
      } catch (error) {
        console.error('Failed to retry message:', error);
        // Marca novamente como falha
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, status: 'failed' } : m))
        );
      }
    },
    [conversationId, allMessages, removeFailedMessage]
  );

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
      <ChatHeader
        conversation={conversation}
        isDesktop={isDesktop}
        onBlockChange={(isBlocked) =>
          setConversation((prev) => (prev ? { ...prev, isBlocked } : prev))
        }
      />

      <MessageList
        messages={allMessages}
        conversation={conversation}
        isOtherTyping={isOtherTyping}
        loading={loading}
        onRetry={handleRetry}
      />

      <ChatInput
        value={message}
        onChange={setMessage}
        onSend={handleSend}
        onTyping={sendTypingEvent}
        onStopTyping={stopTyping}
        sending={sending}
        disabled={conversation.isBlocked}
        disabledMessage='Usuário bloqueado'
      />
    </div>
  );
}
