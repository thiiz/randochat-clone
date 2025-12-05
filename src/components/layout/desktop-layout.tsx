'use client';

import { Sidebar } from './sidebar';
import { EmptyChatState } from '@/components/chat/empty-chat-state';
import { HeartbeatProvider } from '@/components/heartbeat-provider';
import type { Conversation } from '@/hooks/use-realtime-conversations';
import type { User } from '@/lib/auth';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable';

interface FavoriteConversation {
  id: string;
  name: string;
  image: string | null;
  lastSeenAt: Date | null;
  otherUserId: string;
}

interface DesktopLayoutProps {
  user: User;
  conversations: Conversation[];
  favorites: FavoriteConversation[];
  children: React.ReactNode;
  hasActiveChat?: boolean;
}

export function DesktopLayout({
  user,
  conversations,
  favorites,
  children,
  hasActiveChat = false
}: DesktopLayoutProps) {
  return (
    <HeartbeatProvider>
      <div className='from-theme-gradient-from dark:from-theme-gradient-dark-from dark:to-background flex h-screen bg-gradient-to-b to-white'>
        <ResizablePanelGroup direction='horizontal' className='h-full'>
          {/* Sidebar */}
          <ResizablePanel
            defaultSize={30}
            minSize={20}
            maxSize={40}
            className='min-w-[280px]'
          >
            <Sidebar
              user={user}
              conversations={conversations}
              favorites={favorites}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Content */}
          <ResizablePanel defaultSize={70} minSize={50}>
            {hasActiveChat ? (
              <div className='h-full'>{children}</div>
            ) : (
              <EmptyChatState />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </HeartbeatProvider>
  );
}
