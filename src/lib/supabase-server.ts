import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente server-side com service role para operações administrativas
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const PRESENCE_CHANNEL = 'online-users';

/**
 * Busca os IDs de usuários online diretamente do Supabase Presence (server-side)
 * Isso evita manipulação do cliente
 */
export async function getOnlineUserIdsFromServer(): Promise<string[]> {
  return new Promise((resolve) => {
    const channel = supabaseAdmin.channel(PRESENCE_CHANNEL);

    const timeout = setTimeout(() => {
      supabaseAdmin.removeChannel(channel);
      resolve([]);
    }, 5000);

    channel
      .on('presence', { event: 'sync' }, () => {
        clearTimeout(timeout);
        const state = channel.presenceState();
        const userIds = Object.keys(state);
        supabaseAdmin.removeChannel(channel);
        resolve(userIds);
      })
      .subscribe();
  });
}
