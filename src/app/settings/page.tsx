'use client';

import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';
import { ThemeSelector } from '@/components/theme-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Home, Settings, Shuffle } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className='flex h-screen flex-col bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-background'>
      {/* Header */}
      <div className='flex items-center gap-3 border-b px-4 py-3'>
        <Button variant='ghost' size='icon' asChild>
          <Link href='/home'>
            <ArrowLeft className='h-5 w-5' />
          </Link>
        </Button>
        <h1 className='text-lg font-semibold'>Configurações</h1>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-auto p-4'>
        <div className='mx-auto max-w-2xl space-y-6'>
          {/* Aparência */}
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência do aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Modo claro/escuro */}
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>Modo</p>
                  <p className='text-muted-foreground text-sm'>
                    Alternar entre modo claro e escuro
                  </p>
                </div>
                <ModeToggle />
              </div>

              <Separator />

              {/* Seletor de tema */}
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <p className='font-medium'>Tema</p>
                  <p className='text-muted-foreground text-sm'>
                    Escolha um tema de cores
                  </p>
                </div>
                <ThemeSelector />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className='flex items-center justify-around border-t py-3'>
        <Button variant='ghost' size='icon' asChild>
          <Link href='/home'>
            <Home className='h-5 w-5' />
          </Link>
        </Button>
        <Button
          size='icon'
          className='h-12 w-12 rounded-full bg-emerald-500 hover:bg-emerald-600'
        >
          <Shuffle className='h-5 w-5' />
        </Button>
        <Button variant='ghost' size='icon' className='text-emerald-600'>
          <Settings className='h-5 w-5' />
        </Button>
      </div>
    </div>
  );
}
