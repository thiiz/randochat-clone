'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseTypingIndicatorProps {
  conversationId: string;
  currentUserId: string;
  isBlocked?: boolean;
}

interface TypingPayload {
  userId: string;
  timestamp: string;
}

const TYPING_TIMEOUT = 1500; // 1,5 segundos sem digitar = parou de digitar
const DEBOUNCE_DELAY = 300; // Delay entre eventos de typing

export function useTypingIndicator({
  conversationId,
  currentUserId,
  isBlocked = false
}: UseTypingIndicatorProps) {
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    if (!conversationId || !currentUserId || isBlocked) return;

    const channelName = `typing:${conversationId}`;
    const channel = supabase.channel(channelName);

    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const typingPayload = payload as TypingPayload;

        // Ignora eventos do próprio usuário
        if (typingPayload.userId === currentUserId) return;

        setIsOtherTyping(true);

        // Reseta o timeout - se não receber novo evento em 3s, para de mostrar
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setIsOtherTyping(false);
        }, TYPING_TIMEOUT);
      })
      .subscribe();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, currentUserId, isBlocked]);

  const sendTypingEvent = useCallback(() => {
    if (!channelRef.current || !currentUserId || isBlocked) return;

    const now = Date.now();

    // Debounce: só envia se passou tempo suficiente desde o último
    if (now - lastSentRef.current < DEBOUNCE_DELAY) {
      // Agenda para enviar depois se não tiver já agendado
      if (!debounceTimeoutRef.current) {
        debounceTimeoutRef.current = setTimeout(() => {
          debounceTimeoutRef.current = null;
          sendTypingEvent();
        }, DEBOUNCE_DELAY);
      }
      return;
    }

    lastSentRef.current = now;

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: currentUserId,
        timestamp: new Date().toISOString()
      } as TypingPayload
    });
  }, [currentUserId]);

  const stopTyping = useCallback(() => {
    // Limpa qualquer debounce pendente quando para de digitar
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  return {
    isOtherTyping,
    sendTypingEvent,
    stopTyping
  };
}
