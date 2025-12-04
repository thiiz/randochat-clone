'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

  return conversations;
}
