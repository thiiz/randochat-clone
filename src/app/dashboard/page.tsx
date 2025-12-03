import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const metadata = {
  title: 'Dashboard - Unified Sales'
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Dashboard Unificado de Vendas'
            description='Bem-vindo ao seu painel de controle'
          />
        </div>
        <Separator />

        {session?.user && (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
              <CardDescription>Sessão autenticada com sucesso</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div>
                <span className='font-medium'>Nome:</span>{' '}
                <span className='text-muted-foreground'>
                  {session.user.name || 'N/A'}
                </span>
              </div>
              <div>
                <span className='font-medium'>Email:</span>{' '}
                <span className='text-muted-foreground'>
                  {session.user.email}
                </span>
              </div>
              <div>
                <span className='font-medium'>ID:</span>{' '}
                <span className='text-muted-foreground font-mono text-sm'>
                  {session.user.id}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
