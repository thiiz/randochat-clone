'use client';

import { Button } from '@/components/ui/button';
import { isUserBlocked, toggleBlockUser } from '@/lib/block-actions';
import { Ban } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

interface BlockButtonProps {
  otherUserId: string;
  userName: string;
  onBlockChange?: (isBlocked: boolean) => void;
}

export function BlockButton({
  otherUserId,
  userName,
  onBlockChange
}: BlockButtonProps) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadBlockStatus = async () => {
      const status = await isUserBlocked(otherUserId);
      setIsBlocked(status);
    };
    loadBlockStatus();
  }, [otherUserId]);

  const handleToggleBlock = () => {
    startTransition(async () => {
      const result = await toggleBlockUser(otherUserId);

      if (result.success) {
        setIsBlocked(result.isBlocked);
        onBlockChange?.(result.isBlocked);
        toast.success(
          result.isBlocked
            ? `${userName} foi bloqueado`
            : `${userName} foi desbloqueado`
        );
      } else {
        toast.error(result.error || 'Erro ao atualizar bloqueio');
      }
      setOpen(false);
    });
  };

  if (isBlocked) {
    return (
      <Button
        variant='ghost'
        size='icon'
        className='h-10 w-10 rounded-full text-red-500 hover:text-red-600'
        onClick={handleToggleBlock}
        disabled={isPending}
        aria-label='Desbloquear usuário'
      >
        <Ban className='h-5 w-5 fill-current' />
      </Button>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='text-muted-foreground h-10 w-10 rounded-full hover:text-red-500'
          disabled={isPending}
          aria-label='Bloquear usuário'
        >
          <Ban className='h-5 w-5' />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bloquear {userName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Ao bloquear este usuário, vocês não poderão mais se encontrar em
            buscas aleatórias.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleToggleBlock}
            className='bg-red-500 hover:bg-red-600'
          >
            Bloquear
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
