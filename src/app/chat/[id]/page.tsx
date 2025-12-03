'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Camera,
  ChevronUp,
  MoreVertical,
  Paperclip,
  Send,
  Smile
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Mock data - será substituído por dados reais
const mockMessages = [
  {
    id: '1',
    content: 'Hey its just a theory! A 1.8 millon theory aaaannnddd CUT',
    senderId: 'other',
    createdAt: new Date()
  },
  {
    id: '2',
    content:
      'I want to see a scene where Thor and Thanos are fighting. At the end, Thanos tries to kill Thor by punching him in the chest',
    senderId: 'other',
    createdAt: new Date()
  },
  {
    id: '3',
    content:
      "Easy, judging by Disneys new standards it will end like this; Women will beat Thanos, it'll be the green chick, blue chick, and the new chick.",
    senderId: 'me',
    createdAt: new Date()
  }
];

const mockConversation = {
  id: '1',
  name: 'Anônimo #1234'
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const [isTyping, setIsTyping] = useState(true);

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        content: message,
        senderId: 'me',
        createdAt: new Date()
      }
    ]);
    setMessage('');
  };

  return (
    <div className='flex h-screen flex-col bg-gradient-to-b from-theme-gradient-from to-white dark:from-theme-gradient-dark-from dark:to-background'>
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
          <Avatar className='h-10 w-10 border-2 border-primary'>
            <AvatarFallback className='bg-theme-accent-light text-theme-accent-text'>
              {getInitials(mockConversation.name)}
            </AvatarFallback>
          </Avatar>
          <span className='mt-1 text-sm font-medium'>
            {mockConversation.name}
          </span>
        </div>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <MoreVertical className='h-4 w-4' />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className='flex-1 px-4'>
        <div className='py-4'>
          {/* Unread indicator */}
          <div className='mb-4 flex justify-center'>
            <Button
              variant='ghost'
              size='sm'
              className='h-auto gap-1 rounded-full bg-theme-accent-light px-3 py-1 text-xs text-theme-accent-text hover:bg-theme-accent-medium'
            >
              <ChevronUp className='h-3 w-3' />2 mensagens não lidas
            </Button>
          </div>

          {/* Messages list */}
          <div className='space-y-4'>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.senderId !== 'me' && (
                  <Avatar className='mr-2 h-8 w-8 self-end'>
                    <AvatarFallback className='bg-theme-accent-light text-theme-accent-text text-xs'>
                      {getInitials(mockConversation.name)}
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
                  <p className='text-sm'>{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Typing indicator */}
          {isTyping && (
            <div className='mt-4 flex items-center gap-2'>
              <Avatar className='h-8 w-8'>
                <AvatarFallback className='bg-theme-accent-light text-theme-accent-text text-xs'>
                  {getInitials(mockConversation.name)}
                </AvatarFallback>
              </Avatar>
              <div className='bg-muted rounded-2xl px-4 py-2'>
                <div className='flex gap-1'>
                  <span className='h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]' />
                  <span className='h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]' />
                  <span className='h-2 w-2 animate-bounce rounded-full bg-primary' />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className='border-t px-4 py-3'>
        <div className='flex items-center gap-2'>
          <Input
            placeholder='Digite uma mensagem'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className='flex-1'
          />
          <Button variant='ghost' size='icon' className='h-9 w-9'>
            <Smile className='h-5 w-5 text-primary' />
          </Button>
          <Button variant='ghost' size='icon' className='h-9 w-9'>
            <Paperclip className='h-5 w-5 text-primary' />
          </Button>
          <Button variant='ghost' size='icon' className='h-9 w-9'>
            <Camera className='h-5 w-5 text-primary' />
          </Button>
          <Button
            size='icon'
            className='h-9 w-9 rounded-full bg-primary hover:bg-primary/90'
            onClick={handleSend}
          >
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
