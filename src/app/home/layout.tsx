import { getConversations, getFavoriteConversations } from '@/lib/chat-actions';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { HomeLayoutClient } from './home-layout-client';

export default async function HomeLayout({
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

  const [conversations, favorites] = await Promise.all([
    getConversations(),
    getFavoriteConversations()
  ]);

  return (
    <HomeLayoutClient
      user={session.user}
      conversations={conversations}
      favorites={favorites}
    >
      {children}
    </HomeLayoutClient>
  );
}
