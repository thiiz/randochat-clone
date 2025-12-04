'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient, useSession } from '@/lib/auth-client';
import { Camera, Loader2 } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateProfile, uploadAvatar } from './actions';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with session data
  if (session?.user && !initialized) {
    setName(session.user.name || '');
    setImageUrl(session.user.image || '');
    setInitialized(true);
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadAvatar(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.url) {
        setImageUrl(result.url);
        toast.success('Imagem carregada com sucesso');
      }
    } catch {
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set('name', name);
    formData.set('image', imageUrl);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        // Força refresh da sessão para atualizar os dados em todos os componentes
        await authClient.getSession({ fetchOptions: { cache: 'no-store' } });
        toast.success('Perfil atualizado com sucesso!');
      }
    });
  };

  if (isSessionLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='from-theme-gradient-from dark:from-theme-gradient-dark-from dark:to-background flex h-screen flex-col bg-gradient-to-b to-white'>
      <div className='flex-1 overflow-auto p-4'>
        <div className='mx-auto max-w-2xl space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Avatar */}
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
                      disabled={isUploading}
                      className='bg-primary text-primary-foreground hover:bg-primary/90 absolute -right-1 -bottom-1 rounded-full p-2 shadow-md transition-colors disabled:opacity-50'
                    >
                      {isUploading ? (
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
                    onChange={handleImageUpload}
                    className='hidden'
                  />
                  <p className='text-muted-foreground text-sm'>
                    Clique no ícone para alterar a foto
                  </p>
                </div>

                {/* Name */}
                <div className='space-y-2'>
                  <Label htmlFor='name'>Nome</Label>
                  <Input
                    id='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Seu nome'
                    maxLength={50}
                  />
                </div>

                {/* Email (read-only) */}
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    value={session?.user.email || ''}
                    disabled
                    className='bg-muted'
                  />
                  <p className='text-muted-foreground text-xs'>
                    O email não pode ser alterado
                  </p>
                </div>

                <Button type='submit' className='w-full' disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Salvando...
                    </>
                  ) : (
                    'Salvar alterações'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
