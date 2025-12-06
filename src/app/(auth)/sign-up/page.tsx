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
import { signUp } from '@/lib/auth-client';
import { IconLoader2 } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp.email({
        email,
        password,
        name,
        callbackURL: '/'
      });

      if (error) {
        throw error;
      }

      toast.success('Conta criada com sucesso!');
      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error('Sign up error:', error);

      // Handle specific errors
      if (error?.message?.includes('already exists')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error(error?.message || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='border-border bg-background/50 shadow-2xl backdrop-blur-xl'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>Criar Conta</CardTitle>
        <CardDescription>
          Preencha os dados abaixo para criar sua conta
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Nome</Label>
            <Input
              id='name'
              type='text'
              placeholder='Seu nome'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
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
              minLength={8}
            />
            <p className='text-muted-foreground text-xs'>
              Mínimo de 8 caracteres
            </p>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirmar Senha</Label>
            <Input
              id='confirmPassword'
              type='password'
              placeholder='••••••••'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={8}
            />
          </div>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4'>
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
          <p className='text-muted-foreground text-center text-sm'>
            Já tem uma conta?{' '}
            <Link
              href='/sign-in'
              className='text-primary font-medium hover:underline'
            >
              Fazer login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
