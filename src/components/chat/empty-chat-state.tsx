'use client';

import { MessageCircle } from 'lucide-react';

export function EmptyChatState() {
  return (
    <div className='from-theme-gradient-from dark:from-theme-gradient-dark-from dark:to-background flex h-full flex-col items-center justify-center gap-6 bg-gradient-to-b to-white'>
      <div className='bg-primary/10 flex h-24 w-24 items-center justify-center rounded-full'>
        <MessageCircle className='text-primary h-12 w-12' />
      </div>
      <div className='text-center'>
        <h2 className='text-foreground text-xl font-semibold'>
          Selecione uma conversa
        </h2>
        <p className='text-muted-foreground mt-2'>
          Escolha uma conversa na lista ou encontre alguém novo
        </p>
      </div>
    </div>
  );
}
