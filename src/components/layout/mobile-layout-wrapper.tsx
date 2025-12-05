'use client';

import { BottomNav } from '@/components/layout/bottom-nav';
import { UserMenu } from '@/components/layout/user-menu';
import { useIsDesktop } from '@/hooks/use-media-query';
import { useSession } from '@/lib/auth-client';

interface MobileLayoutWrapperProps {
  children: React.ReactNode;
}

export function MobileLayoutWrapper({ children }: MobileLayoutWrapperProps) {
  const isDesktop = useIsDesktop();
  const { data: session } = useSession();

  // On desktop, don't render the mobile wrapper - content is rendered inside DesktopLayout
  if (isDesktop) {
    return <>{children}</>;
  }

  // Mobile layout with header and bottom nav
  return (
    <div className='from-theme-gradient-from dark:from-theme-gradient-dark-from dark:to-background flex h-screen flex-col bg-gradient-to-b to-white'>
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <div className='flex items-center gap-3'>
          {session?.user && <UserMenu user={session.user} />}
          <h1 className='text-lg font-semibold'>Conversas</h1>
        </div>
      </div>
      {children}
      <BottomNav />
    </div>
  );
}
