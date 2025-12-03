'use client';

import { useEffect, useRef } from 'react';

const HEARTBEAT_INTERVAL = 60 * 1000; // 1 minuto

export function useHeartbeat() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/user/heartbeat', { method: 'POST' });
      } catch (error) {
        console.error('Failed to send heartbeat:', error);
      }
    };

    // Envia imediatamente ao montar
    sendHeartbeat();

    // Configura intervalo
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Envia ao focar na janela (usuário voltou)
    const handleFocus = () => sendHeartbeat();
    window.addEventListener('focus', handleFocus);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
}
