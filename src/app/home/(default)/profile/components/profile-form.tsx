'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { updateProfile, uploadAvatar } from '../actions';
import { profileSchema, type ProfileFormData } from '../schema';
import { ProfileAvatar } from './profile-avatar';

interface ProfileFormProps {
  initialData: {
    name: string;
    email: string;
    image: string;
  };
  onSuccess?: () => void;
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name,
      image: initialData.image
    }
  });

  const { isSubmitting } = form.formState;

  const handleImageSelect = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
  };

  const onSubmit = async (data: ProfileFormData) => {
    let finalImageUrl = data.image || '';

    // Se tem arquivo selecionado, faz upload primeiro
    if (selectedFile) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);

      const uploadResult = await uploadAvatar(uploadFormData);

      if (!('success' in uploadResult)) {
        toast.error(uploadResult.error);
        return;
      }

      if (uploadResult.data?.url) {
        finalImageUrl = uploadResult.data.url;
      }
    }

    // Atualiza o perfil
    const result = await updateProfile({
      name: data.name,
      image: finalImageUrl
    });

    if (!('success' in result)) {
      // Trata erros de validação do servidor
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            form.setError(field as keyof ProfileFormData, {
              type: 'server',
              message: messages[0]
            });
          }
        });
      } else {
        toast.error(result.error);
      }
      return;
    }

    // Sucesso - limpa o arquivo selecionado e atualiza a URL
    setSelectedFile(null);
    setPreviewUrl('');
    form.setValue('image', finalImageUrl);
    toast.success('Perfil atualizado com sucesso!');
    onSuccess?.();
  };

  // URL para exibir no avatar (preview local ou URL salva)
  const displayImageUrl = previewUrl || form.watch('image') || '';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Avatar */}
        <ProfileAvatar
          imageUrl={displayImageUrl}
          name={form.watch('name') || 'U'}
          disabled={isSubmitting}
          onImageSelect={handleImageSelect}
        />

        {/* Name */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder='Seu nome' maxLength={20} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email (read-only) */}
        <div className='space-y-2'>
          <FormLabel>Email</FormLabel>
          <Input value={initialData.email} disabled className='bg-muted' />
          <FormDescription>O email não pode ser alterado</FormDescription>
        </div>

        <Button type='submit' className='w-full' disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Salvando...
            </>
          ) : (
            'Salvar alterações'
          )}
        </Button>
      </form>
    </Form>
  );
}
