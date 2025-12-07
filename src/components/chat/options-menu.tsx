'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { isUserBlocked, toggleBlockUser } from '@/lib/block-actions';
import { Ban, MoreVertical } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface OptionsMenuProps {
  otherUserId: string;
  userName: string;
  onBlockChange?: (isBlocked: boolean) => void;
}

export function OptionsMenu({
  otherUserId,
  userName,
  onBlockChange
}: OptionsMenuProps) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showBlockDialog, setShowBlockDialog] = useState(false);

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
      setShowBlockDialog(false);
    });
  };

  const handleBlockClick = () => {
    if (isBlocked) {
      handleToggleBlock();
    } else {
      setShowBlockDialog(true);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='text-muted-foreground h-10 w-10 rounded-full'
            aria-label='Mais opções'
          >
            <MoreVertical className='h-5 w-5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onClick={handleBlockClick}
            disabled={isPending}
            variant={isBlocked ? 'default' : 'destructive'}
            className='cursor-pointer'
          >
            <Ban className='h-4 w-4' />
            {isBlocked ? 'Desbloquear usuário' : 'Bloquear usuário'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
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
    </>
  );
}
