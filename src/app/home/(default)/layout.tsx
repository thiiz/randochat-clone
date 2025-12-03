import { BottomNav } from '@/components/layout/bottom-nav';
import { UserMenu } from '@/components/layout/user-menu';
import { HeartbeatProvider } from '@/components/heartbeat-provider';
import { auth } from '@/lib/auth';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'RandoChat - Chat Anônimo',
  description: 'Converse com pessoas aleatórias de forma anônima'
};

export default async function ChatLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return null;
  }
  return (
    <HeartbeatProvider>
      <div className='flex h-screen flex-col bg-gradient-to-b from-theme-gradient-from to-white dark:from-theme-gradient-dark-from dark:to-background'>
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <div className='flex items-center gap-3'>
            <UserMenu user={session.user} />
            <h1 className='text-lg font-semibold'>Minhas conversas</h1>
          </div>
        </div>
        {children}
        <BottomNav />
      </div>
    </HeartbeatProvider>
  );
}
