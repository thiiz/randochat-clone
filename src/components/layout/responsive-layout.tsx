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

interface ResponsiveLayoutProps {
  user: User;
  conversations: Conversation[];
  favorites: FavoriteConversation[];
  mobileContent: React.ReactNode;
  desktopContent: React.ReactNode;
}

export function ResponsiveLayout({
  user,
  conversations,
  favorites,
  mobileContent,
  desktopContent
}: ResponsiveLayoutProps) {
  const isDesktop = useIsDesktop();
  const pathname = usePathname();

  // Check if we're on a chat page
  const hasActiveChat = pathname.startsWith('/home/chat/');

  if (isDesktop) {
    return (
      <DesktopLayout
        user={user}
        conversations={conversations}
        favorites={favorites}
        hasActiveChat={hasActiveChat}
      >
        {desktopContent}
      </DesktopLayout>
    );
  }

  // Mobile layout - render the mobile content directly
  return <>{mobileContent}</>;
}
