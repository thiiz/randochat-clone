'use client';

import { useCallback, useEffect, useState } from 'react';

interface FailedMessage {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  conversationId: string;
}

const STORAGE_KEY = 'failed-messages';

function getStoredMessages(): FailedMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredMessages(messages: FailedMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Ignore storage errors
  }
}

export function useFailedMessages(conversationId: string) {
  const [failedMessages, setFailedMessages] = useState<FailedMessage[]>([]);

  // Carrega mensagens falhadas do localStorage ao montar
  useEffect(() => {
    const stored = getStoredMessages();
    const forConversation = stored.filter(
      (m) => m.conversationId === conversationId
    );
    setFailedMessages(forConversation);
  }, [conversationId]);

  // Salva uma mensagem falhada
  const saveFailedMessage = useCallback(
    (message: {
      id: string;
      content: string | null;
      imageUrl: string | null;
      createdAt: Date;
    }) => {
      // Não salva se não tiver conteúdo
      if (!message.content) return;

      const failedMsg: FailedMessage = {
        id: message.id,
        content: message.content,
        imageUrl: message.imageUrl,
        createdAt: message.createdAt.toISOString(),
        conversationId
      };

      setFailedMessages((prev) => {
        const updated = [...prev, failedMsg];
        const allStored = getStoredMessages();
        const otherConversations = allStored.filter(
          (m) => m.conversationId !== conversationId
        );
        setStoredMessages([...otherConversations, ...updated]);
        return updated;
      });
    },
    [conversationId]
  );

  // Remove uma mensagem falhada (quando enviada com sucesso)
  const removeFailedMessage = useCallback((messageId: string) => {
    setFailedMessages((prev) => {
      const updated = prev.filter((m) => m.id !== messageId);
      const allStored = getStoredMessages();
      const filtered = allStored.filter((m) => m.id !== messageId);
      setStoredMessages(filtered);
      return updated;
    });
  }, []);

  // Limpa todas as mensagens falhadas da conversa
  const clearFailedMessages = useCallback(() => {
    setFailedMessages([]);
    const allStored = getStoredMessages();
    const filtered = allStored.filter(
      (m) => m.conversationId !== conversationId
    );
    setStoredMessages(filtered);
  }, [conversationId]);

  return {
    failedMessages,
    saveFailedMessage,
    removeFailedMessage,
    clearFailedMessages
  };
}
