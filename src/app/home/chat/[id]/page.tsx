'use client';

import { HeartbeatProvider } from '@/components/heartbeat-provider';
import { OnlineIndicator } from '@/components/online-indicator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtimeMessages } from '@/hooks/use-realtime-messages';
import { useSession } from '@/lib/auth-client';
import { getConversationMessages, sendMessage } from '@/lib/chat-actions';
import {
  ArrowLeft,
  Camera,
  MoreVertical,
  Paperclip,
  Send,
  Smile
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Callback para adicionar novas mensagens recebidas em tempo real
  const handleNewMessage = useCallback((newMessage: Message) => {
    setMessages((prev) => {
      // Evita duplicatas
      if (prev.some((m) => m.id === newMessage.id)) return prev;
      return [...prev, newMessage];
    });
  }, []);

  // Hook de realtime - escuta novas mensagens
  useRealtimeMessages({
    conversationId,
    currentUserId: session?.user?.id || '',
    onNewMessage: handleNewMessage
  });

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const data = await getConversationMessages(conversationId);
        setConversation(data.conversation);
        setMessages(data.messages);
      } catch (error) {
        console.error('Failed to load conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  // Auto-scroll quando novas mensagens chegam
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !conversation) return;

    const messageText = message;
    setMessage('');
    setSending(true);

    try {
      const newMessage = await sendMessage(conversationId, messageText);
      setMessages([...messages, newMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p className='text-muted-foreground'>Carregando conversa...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p className='text-muted-foreground'>Conversa não encontrada</p>
      </div>
    );
  }

  return (
    <HeartbeatProvider>
      <div className='from-theme-gradient-from dark:from-theme-gradient-dark-from dark:to-background flex h-screen flex-col bg-gradient-to-b to-white'>
        {/* Header */}
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <div className='flex items-center gap-3'>
            <Link href='/home'>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <ArrowLeft className='h-4 w-4' />
              </Button>
            </Link>
          </div>
          <div className='flex flex-col items-center'>
            <div className='relative'>
              <Avatar className='border-primary h-10 w-10 border-2'>
                <AvatarFallback className='bg-theme-accent-light text-theme-accent-text'>
                  {getInitials(conversation.name)}
                </AvatarFallback>
              </Avatar>
              <OnlineIndicator
                lastSeenAt={conversation.lastSeenAt}
                size='sm'
                className='border-background absolute -right-0.5 -bottom-0.5 rounded-full border-2'
              />
            </div>
            <span className='mt-1 text-sm font-medium'>
              {conversation.name}
            </span>
            <OnlineIndicator
              lastSeenAt={conversation.lastSeenAt}
              showText
              className='mt-0.5'
            />
          </div>
          <Button variant='ghost' size='icon' className='h-8 w-8'>
            <MoreVertical className='h-4 w-4' />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className='flex-1 px-4'>
          <div className='py-4'>
            {/* Messages list */}
            <div className='space-y-4'>
              {messages.length === 0 ? (
                <div className='text-muted-foreground py-8 text-center'>
                  <p>Nenhuma mensagem ainda. Comece a conversa!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.senderId !== 'me' && (
                      <Avatar className='mr-2 h-8 w-8 self-end'>
                        <AvatarFallback className='bg-theme-accent-light text-theme-accent-text text-xs'>
                          {getInitials(conversation.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        msg.senderId === 'me'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt='Message image'
                          className='mb-2 max-w-full rounded'
                        />
                      )}
                      {msg.content && <p className='text-sm'>{msg.content}</p>}
                    </div>
                  </div>
                ))
              )}
              {/* Elemento para auto-scroll */}
              <div ref={scrollRef} />
            </div>
          </div>
        </ScrollArea>

        {/* Input */}
        <div className='border-t px-4 py-3'>
          <div className='flex items-center gap-2'>
            <Input
              placeholder='Digite uma mensagem'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !sending && handleSend()}
              disabled={sending}
              className='flex-1'
            />
            <Button
              variant='ghost'
              size='icon'
              className='h-9 w-9'
              disabled={sending}
            >
              <Smile className='text-primary h-5 w-5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-9 w-9'
              disabled={sending}
            >
              <Paperclip className='text-primary h-5 w-5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-9 w-9'
              disabled={sending}
            >
              <Camera className='text-primary h-5 w-5' />
            </Button>
            <Button
              size='icon'
              className='bg-primary hover:bg-primary/90 h-9 w-9 rounded-full disabled:opacity-50'
              onClick={handleSend}
              disabled={sending || !message.trim()}
            >
              <Send className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </HeartbeatProvider>
  );
}
