'use client';

import { Button } from '@/components/ui/button';
import { isFavorite, toggleFavorite } from '@/lib/chat-actions';
import { cn } from '@/lib/utils';
import { StarIcon } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  conversationId: string;
}

export function FavoriteButton({ conversationId }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Carrega o status de favorito ao montar
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      const status = await isFavorite(conversationId);
      setIsFav(status);
    };
    loadFavoriteStatus();
  }, [conversationId]);

  const handleToggleFavorite = () => {
    startTransition(async () => {
      const result = await toggleFavorite(conversationId);

      if (result.success) {
        setIsFav(result.isFavorite);
        toast.success(
          result.isFavorite
            ? 'Adicionado aos favoritos!'
            : 'Removido dos favoritos!'
        );
      } else {
        toast.error(result.error || 'Erro ao atualizar favorito');
      }
    });
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      className={cn(
        'h-10 w-10 rounded-full transition-colors',
        isFav
          ? 'text-yellow-500 hover:text-yellow-600'
          : 'text-muted-foreground hover:text-yellow-500'
      )}
      onClick={handleToggleFavorite}
      disabled={isPending}
      aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <StarIcon
        className={cn('h-5 w-5 transition-all', isFav && 'fill-current')}
      />
    </Button>
  );
}
