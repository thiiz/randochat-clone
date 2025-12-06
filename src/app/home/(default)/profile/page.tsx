'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useSession } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';
import { ProfileForm } from './components';

export default function ProfilePage() {
  const { data: session, isPending: isSessionLoading, refetch } = useSession();

  if (isSessionLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p className='text-muted-foreground'>Usuário não autenticado</p>
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
              <ProfileForm
                initialData={{
                  name: session.user.name || '',
                  email: session.user.email || '',
                  image: session.user.image || ''
                }}
                onSuccess={refetch}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
