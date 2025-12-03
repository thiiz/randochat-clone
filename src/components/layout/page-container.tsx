import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PageContainer({
  children,
  scrollable = true
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <>
      {scrollable ? (
        <ScrollArea className='h-[calc(100dvh-52px)]'>
          <div className='flex h-screen flex-col bg-gradient-to-b from-theme-gradient-from to-white dark:from-theme-gradient-dark-from dark:to-background p-4 md:px-6'>{children}</div>
        </ScrollArea>
      ) : (
        <div className='flex h-screen flex-col bg-gradient-to-b from-theme-gradient-from to-white dark:from-theme-gradient-dark-from dark:to-background p-4 md:px-6'>{children}</div>
      )}
    </>
  );
}
