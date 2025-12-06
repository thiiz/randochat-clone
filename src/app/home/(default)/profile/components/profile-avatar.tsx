'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface ProfileAvatarProps {
  imageUrl: string;
  name: string;
  disabled?: boolean;
  onImageSelect: (file: File) => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileAvatar({
  imageUrl,
  name,
  disabled,
  onImageSelect
}: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    // Limite generoso no cliente - a compressão reduz drasticamente
    if (file.size > 20 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 20MB');
      return;
    }

    setIsProcessing(true);
    try {
      // Comprime a imagem no cliente (500x500, WebP, 80% qualidade)
      const { compressImage } = await import('@/lib/image-utils');
      const compressedFile = await compressImage(file, 500, 0.8);

      // Log para debug
      console.log(
        `Imagem comprimida: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`
      );

      onImageSelect(compressedFile);
    } catch {
      toast.error('Erro ao processar a imagem. Tente outra.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='flex flex-col items-center gap-4'>
      <div className='relative'>
        <Avatar className='h-24 w-24'>
          <AvatarImage src={imageUrl || undefined} />
          <AvatarFallback className='bg-theme-accent-light text-theme-accent-text text-2xl'>
            {getInitials(name || 'U')}
          </AvatarFallback>
        </Avatar>
        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isProcessing}
          className='bg-primary text-primary-foreground hover:bg-primary/90 absolute -right-1 -bottom-1 rounded-full p-2 shadow-md transition-colors disabled:opacity-50'
        >
          {isProcessing ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Camera className='h-4 w-4' />
          )}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleImageSelect}
        className='hidden'
      />
      <p className='text-muted-foreground text-sm'>
        Clique no ícone para alterar a foto
      </p>
    </div>
  );
}
