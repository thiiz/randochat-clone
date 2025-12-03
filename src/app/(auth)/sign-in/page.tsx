'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth-client';
import { IconLoader2 } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn.email({
        email,
        password,
        callbackURL: callbackUrl
      });

      if (error) {
        throw error;
      }

      toast.success('Login realizado com sucesso!');
      router.push(callbackUrl);
      router.refresh();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(
        error?.message || 'Email ou senha incorretos. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='border-border/50 shadow-lg'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>Login</CardTitle>
        <CardDescription>
          Entre com seu email e senha para acessar o dashboard
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='seu@email.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>Senha</Label>
            <Input
              id='password'
              type='password'
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4'>
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
          <p className='text-muted-foreground text-center text-sm'>
            Não tem uma conta?{' '}
            <Link
              href='/sign-up'
              className='text-primary font-medium hover:underline'
            >
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
