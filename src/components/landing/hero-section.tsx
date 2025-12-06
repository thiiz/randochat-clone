'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className='relative min-h-screen overflow-hidden'>
      {/* Background decorations */}
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute top-20 -left-40 h-[500px] w-[500px] rounded-full bg-lime-500/20 blur-[120px]' />
        <div className='absolute -right-40 bottom-20 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[120px]' />
      </div>

      <div className='container mx-auto h-full px-4'>
        <div className='flex min-h-screen flex-col items-center justify-center py-20 text-center lg:items-start lg:text-left'>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='border-border bg-muted/50 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2'
          >
            <span className='relative flex h-2 w-2'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75' />
              <span className='relative inline-flex h-2 w-2 rounded-full bg-green-500' />
            </span>
            <span className='text-muted-foreground text-sm font-medium'>
              Milhares online agora
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className='mb-6 max-w-3xl text-5xl leading-[1.1] font-bold tracking-tight md:text-6xl lg:text-7xl'
          >
            Converse com{' '}
            <span className='bg-gradient-to-r from-lime-400 via-green-500 to-emerald-500 bg-clip-text text-transparent'>
              estranhos
            </span>
            <br />
            do mundo todo
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className='text-muted-foreground mb-8 max-w-lg text-lg md:text-xl'
          >
            Encontre pessoas aleatórias para conversar em tempo real. Faça
            amizades, compartilhe histórias e descubra conexões inesperadas.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className='flex flex-col gap-4 sm:flex-row'
          >
            <Button
              asChild
              size='lg'
              className='group h-14 min-w-[180px] bg-gradient-to-r from-lime-500 to-green-500 text-lg font-semibold text-white hover:from-lime-600 hover:to-green-600'
            >
              <Link href='/sign-up'>
                Começar agora
                <ArrowRight className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
              </Link>
            </Button>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='h-14 min-w-[180px] text-lg font-semibold'
            >
              <Link href='/sign-in'>Já tenho conta</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className='mt-12 flex gap-8'
          >
            {[
              { value: '10K+', label: 'Usuários' },
              { value: '1M+', label: 'Mensagens' },
              { value: '<1s', label: 'Conexão' }
            ].map((stat, index) => (
              <div key={index}>
                <div className='text-2xl font-bold md:text-3xl'>
                  {stat.value}
                </div>
                <div className='text-muted-foreground text-sm'>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className='absolute bottom-8 left-1/2 -translate-x-1/2'
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className='flex flex-col items-center gap-2'
        >
          <span className='text-muted-foreground text-sm'>
            Role para explorar
          </span>
          <div className='border-border h-12 w-7 rounded-full border-2 p-1'>
            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className='bg-muted-foreground/60 h-2.5 w-full rounded-full'
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
