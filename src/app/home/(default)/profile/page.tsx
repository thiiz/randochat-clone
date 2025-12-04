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
import { useSession } from '@/lib/auth-client';
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
  const { data: session, isPending: isSessionLoading, refetch } = useSession();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [initialized, setInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with session data
  if (session?.user && !initialized) {
    setName(session.user.name || '');
    setImageUrl(session.user.image || '');
    setInitialized(true);
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 1MB');
      return;
    }

    // Cria preview local
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      let finalImageUrl = imageUrl;

      // Se tem arquivo selecionado, faz upload primeiro
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);

        const uploadResult = await uploadAvatar(uploadFormData);

        if (uploadResult.error) {
          toast.error(uploadResult.error);
          return;
        }

        if (uploadResult.url) {
          finalImageUrl = uploadResult.url;
        }
      }

      // Atualiza o perfil
      const formData = new FormData();
      formData.set('name', name);
      formData.set('image', finalImageUrl);

      const result = await updateProfile(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        // Limpa o arquivo selecionado e atualiza a URL
        setSelectedFile(null);
        setPreviewUrl('');
        setImageUrl(finalImageUrl);
        // Força refresh da sessão para atualizar os dados em todos os componentes (incluindo o header)
        await refetch();
        toast.success('Perfil atualizado com sucesso!');
      }
    });
  };

  // URL para exibir no avatar (preview local ou URL salva)
  const displayImageUrl = previewUrl || imageUrl;

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
                      <AvatarImage src={displayImageUrl || undefined} />
                      <AvatarFallback className='bg-theme-accent-light text-theme-accent-text text-2xl'>
                        {getInitials(name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPending}
                      className='bg-primary text-primary-foreground hover:bg-primary/90 absolute -right-1 -bottom-1 rounded-full p-2 shadow-md transition-colors disabled:opacity-50'
                    >
                      <Camera className='h-4 w-4' />
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
