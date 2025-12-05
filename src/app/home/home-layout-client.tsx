'use client';

import { DesktopLayout } from '@/components/layout/desktop-layout';
import { PresenceProvider } from '@/contexts/presence-context';
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

  // Check if we're on a page that should show content in the main panel
  const hasActiveContent =
    pathname.startsWith('/home/chat/') ||
    pathname.startsWith('/home/settings') ||
    pathname.startsWith('/home/profile');

  // Wrap everything with PresenceProvider at the top level
  return (
    <PresenceProvider>
      {isDesktop ? (
        <DesktopLayout
          user={user}
          conversations={conversations}
          favorites={favorites}
          hasActiveChat={hasActiveContent}
        >
          {children}
        </DesktopLayout>
      ) : (
        // On mobile, render children directly (they have their own layouts)
        <>{children}</>
      )}
    </PresenceProvider>
  );
}
