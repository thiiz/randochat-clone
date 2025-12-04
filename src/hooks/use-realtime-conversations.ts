'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export type Conversation = {
  id: string;
  name: string;
  image: string | null;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  lastSeenAt: Date | null;
  otherUserId: string;
};

export function useRealtimeConversations(initialConversations: Conversation[]) {
  const [conversations, setConversations] = useState(initialConversations);
  const router = useRouter();

  // Atualiza quando os dados iniciais mudam (após refresh do server)
  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  // Limpa o unreadCount localmente de forma imediata
  const clearUnreadCount = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message'
        },
        () => {
          // Usa router.refresh() para revalidar os Server Components
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message'
        },
        () => {
          // Atualiza quando mensagens são marcadas como lidas
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation'
        },
        () => {
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation'
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return { conversations, clearUnreadCount };
}
