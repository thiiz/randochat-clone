'use client';

import { DesktopLayout } from '@/components/layout/desktop-layout';
import { useIsDesktop } from '@/hooks/use-media-query';
import type { Conversation } from '@/hooks/use-realtime-conversations';
import type { User } from '@/lib/auth';
import { usePathname } from 'next/navigation';

interface FavoriteConversation {
  id: string;
  name: string;
  image: string | null;
  lastSeenAt: Date | null;
  otherUserId: string;
}

interface HomeLayoutClientProps {
  user: User;
  conversations: Conversation[];
  favorites: FavoriteConversation[];
  children: React.ReactNode;
}

export function HomeLayoutClient({
  user,
  conversations,
  favorites,
  children
}: HomeLayoutClientProps) {
  const isDesktop = useIsDesktop();
  const pathname = usePathname();

  // Check if we're on a chat page
  const hasActiveChat = pathname.startsWith('/home/chat/');

  // On desktop, render the split-panel layout
  if (isDesktop) {
    return (
      <DesktopLayout
        user={user}
        conversations={conversations}
        favorites={favorites}
        hasActiveChat={hasActiveChat}
      >
        {children}
      </DesktopLayout>
    );
  }

  // On mobile, render children directly (they have their own layouts)
  return <>{children}</>;
}
