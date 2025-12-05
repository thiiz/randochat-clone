'use client';

import { parseDate } from '@/lib/date';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

interface Message {
  id: string;
  content: string | null;
  imageUrl: string | null;
  senderId: 'me' | 'other';
  createdAt: Date;
  isRead: boolean;
}

interface RealtimePayload {
  new: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string | null;
    imageUrl: string | null;
    isRead: boolean;
    createdAt: string;
  };
}

interface UseRealtimeMessagesProps {
  conversationId: string;
  currentUserId: string;
  onNewMessage: (message: Message) => void;
}

export function useRealtimeMessages({
  conversationId,
  currentUserId,
  onNewMessage
}: UseRealtimeMessagesProps) {
  useEffect(() => {
    // Não conecta se não tiver userId ainda
    if (!currentUserId) return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message',
          filter: `conversationId=eq.${conversationId}`
        },
        (payload: RealtimePayload) => {
          const newMsg = payload.new;

          // Só adiciona se não foi enviada pelo usuário atual
          if (newMsg.senderId !== currentUserId) {
            onNewMessage({
              id: newMsg.id,
              content: newMsg.content,
              imageUrl: newMsg.imageUrl,
              senderId: 'other',
              createdAt: parseDate(newMsg.createdAt),
              isRead: newMsg.isRead
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, onNewMessage]);
}
