'use client';

import { HeartbeatProvider } from '@/components/heartbeat-provider';
import { OnlineIndicator } from '@/components/online-indicator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRealtimeMessages } from '@/hooks/use-realtime-messages';
import { useIsDesktop } from '@/hooks/use-media-query';
import { useSession } from '@/lib/auth-client';
import {
  getConversationMessages,
  markMessagesAsRead,
  sendMessage
} from '@/lib/chat-actions';
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
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';

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
  const isDesktop = useIsDesktop();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const scrollToBottom = useCallback((instant = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: instant ? 'instant' : 'smooth'
    });
  }, []);

  const handleNewMessage = useCallback(
    (newMessage: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      setTimeout(scrollToBottom, 100);

      // Marca como lida se a mensagem é do outro usuário
      if (newMessage.senderId === 'other') {
        markMessagesAsRead(conversationId);
      }
    },
    [scrollToBottom, conversationId]
  );

  useRealtimeMessages({
    conversationId,
    currentUserId: session?.user?.id || '',
    onNewMessage: handleNewMessage
  });

  const initialScrollDone = useRef(false);

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

  // Scroll instantâneo no carregamento inicial (após loading = false)
  useLayoutEffect(() => {
    if (loading || messages.length === 0 || initialScrollDone.current) return;

    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      initialScrollDone.current = true;
    }
  }, [loading, messages]);

  // Scroll suave para novas mensagens após o carregamento inicial
  useEffect(() => {
    if (loading || messages.length === 0 || !initialScrollDone.current) return;

    scrollToBottom();
  }, [loading, messages, scrollToBottom]);

  const handleSend = async () => {
    if (!message.trim() || !conversation) return;

    const messageText = message;
    setMessage('');
    setSending(true);

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
      <div className='flex h-dvh items-center justify-center'>
        <p className='text-muted-foreground'>Carregando conversa...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className='flex h-dvh items-center justify-center'>
        <p className='text-muted-foreground'>Conversa não encontrada</p>
      </div>
    );
  }

  return (
    <HeartbeatProvider>
      <div
        className={`from-theme-gradient-from dark:from-theme-gradient-dark-from dark:to-background flex flex-col bg-gradient-to-b to-white ${isDesktop ? 'h-full' : 'fixed inset-0'}`}
      >
        {/* Header - altura fixa */}
        <header className='bg-background/80 flex shrink-0 items-center justify-between border-b px-3 py-2 backdrop-blur-sm sm:px-4 sm:py-3'>
          {!isDesktop ? (
            <Link href='/home'>
              <Button variant='ghost' size='icon' className='h-9 w-9'>
                <ArrowLeft className='h-5 w-5' />
              </Button>
            </Link>
          ) : (
            <div className='w-9' /> /* Spacer to maintain header layout */
          )}

          <div className='flex flex-col items-center'>
            <div className='relative'>
              <Avatar className='border-primary h-9 w-9 border-2 sm:h-10 sm:w-10'>
                <AvatarImage src={conversation.image || undefined} />
                <AvatarFallback className='bg-theme-accent-light text-theme-accent-text text-xs sm:text-sm'>
                  {getInitials(conversation.name)}
                </AvatarFallback>
              </Avatar>
              <OnlineIndicator
                lastSeenAt={conversation.lastSeenAt}
                size='sm'
                className='border-background absolute -right-0.5 -bottom-0.5 rounded-full border-2'
              />
            </div>
            <span className='mt-1 max-w-[150px] truncate text-sm font-medium sm:max-w-[200px]'>
              {conversation.name}
            </span>
            <OnlineIndicator
              lastSeenAt={conversation.lastSeenAt}
              showText
              className='mt-0.5 text-xs'
            />
          </div>

          <Button variant='ghost' size='icon' className='h-9 w-9'>
            <MoreVertical className='h-5 w-5' />
          </Button>
        </header>

        {/* Messages - área scrollável */}
        <div
          ref={messagesContainerRef}
          className='flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4'
        >
          <div className='mx-auto max-w-3xl py-4'>
            {messages.length === 0 ? (
              <div className='text-muted-foreground flex h-full items-center justify-center py-20 text-center'>
                <p>Nenhuma mensagem ainda. Comece a conversa!</p>
              </div>
            ) : (
              <div className='space-y-1'>
                {messages.map((msg, index) => {
                  const prevMsg = messages[index - 1];
                  const showAvatar =
                    msg.senderId !== 'me' &&
                    (!prevMsg || prevMsg.senderId !== msg.senderId);

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.senderId !== 'me' && (
                        <div className='mr-2 h-7 w-7 shrink-0 self-end sm:h-8 sm:w-8'>
                          {showAvatar && (
                            <Avatar className='h-7 w-7 sm:h-8 sm:w-8'>
                              <AvatarImage
                                src={conversation.image || undefined}
                              />
                              <AvatarFallback className='bg-theme-accent-light text-theme-accent-text text-xs'>
                                {getInitials(conversation.name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 sm:max-w-[70%] sm:px-4 ${
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
                        {msg.content && (
                          <p className='text-sm break-words'>{msg.content}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input - altura fixa */}
        <footer className='bg-background/80 shrink-0 border-t px-3 py-2 backdrop-blur-sm sm:px-4 sm:py-3'>
          <div className='mx-auto flex max-w-3xl items-center gap-1 sm:gap-2'>
            <Input
              placeholder='Digite uma mensagem'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !sending) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sending}
              className='min-w-0 flex-1'
            />
            <div className='hidden gap-1 sm:flex'>
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
            </div>
            <Button
              size='icon'
              className='bg-primary hover:bg-primary/90 h-9 w-9 shrink-0 rounded-full disabled:opacity-50'
              onClick={handleSend}
              disabled={sending || !message.trim()}
            >
              <Send className='h-4 w-4' />
            </Button>
          </div>
        </footer>
      </div>
    </HeartbeatProvider>
  );
}
