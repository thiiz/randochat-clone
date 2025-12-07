'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef
} from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/lib/auth-client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  userId: string;
  online_at: string;
}

interface PresenceContextType {
  onlineUsers: Set<string>;
  isUserOnline: (userId: string) => boolean;
  getOnlineUserIds: () => string[];
}

const PresenceContext = createContext<PresenceContextType | null>(null);

const PRESENCE_CHANNEL = 'online-users';

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const currentUserId = session?.user?.id;

  useEffect(() => {
    if (!currentUserId) return;

    // Cria o canal de presença
    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: {
        presence: {
          key: currentUserId
        }
      }
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>();
        const userIds = new Set<string>();

        // Extrai todos os IDs de usuários online
        Object.keys(state).forEach((key) => {
          userIds.add(key);
        });

        setOnlineUsers(userIds);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers((prev) => {
          const next = new Set(Array.from(prev));
          next.add(key);
          return next;
        });
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Registra a presença do usuário atual
          await channel.track({
            userId: currentUserId,
            online_at: new Date().toISOString()
          });
        }
      });

    // Atualiza lastSeenAt no banco periodicamente (a cada 30s)
    const updateLastSeen = () => {
      fetch('/api/presence', { method: 'POST' }).catch(console.error);
    };

    // Atualiza imediatamente ao conectar
    updateLastSeen();

    // Atualiza periodicamente
    const interval = setInterval(updateLastSeen, 30000);

    // Atualiza quando o usuário sair da página
    const handleBeforeUnload = () => {
      // Usa sendBeacon para garantir que a requisição seja enviada mesmo ao fechar
      navigator.sendBeacon('/api/presence');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup ao desmontar
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateLastSeen(); // Atualiza uma última vez ao desmontar

      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentUserId]);

  const isUserOnline = useCallback(
    (userId: string) => {
      return onlineUsers.has(userId);
    },
    [onlineUsers]
  );

  const getOnlineUserIds = useCallback(() => {
    return Array.from(onlineUsers);
  }, [onlineUsers]);

  return (
    <PresenceContext.Provider
      value={{ onlineUsers, isUserOnline, getOnlineUserIds }}
    >
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
}

// Hook opcional que não lança erro se usado fora do provider
// Útil para componentes que podem ser renderizados em contextos diferentes
export function usePresenceOptional() {
  return useContext(PresenceContext);
}
