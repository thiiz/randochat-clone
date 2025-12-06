'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Floating decorative elements
const floatingElements = [
  { size: 8, x: '15%', y: '20%', delay: 0, duration: 4 },
  { size: 6, x: '80%', y: '15%', delay: 0.5, duration: 5 },
  { size: 10, x: '70%', y: '70%', delay: 1, duration: 4.5 },
  { size: 5, x: '25%', y: '75%', delay: 1.5, duration: 5.5 },
  { size: 7, x: '85%', y: '45%', delay: 0.8, duration: 4.2 },
  { size: 4, x: '10%', y: '50%', delay: 2, duration: 5 },
  { size: 6, x: '60%', y: '85%', delay: 0.3, duration: 4.8 },
  { size: 8, x: '40%', y: '10%', delay: 1.2, duration: 5.2 }
];

export function HeroSection() {
  return (
    <section className='relative min-h-screen overflow-hidden'>
      {/* Background decorations */}
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute top-20 -left-40 h-[500px] w-[500px] rounded-full bg-lime-500/20 blur-[120px]' />
        <div className='absolute -right-40 bottom-20 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[120px]' />
        <div className='absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-[100px]' />
      </div>

      {/* Floating particles */}
      <div className='pointer-events-none absolute inset-0'>
        {floatingElements.map((el, i) => (
          <motion.div
            key={i}
            className='absolute rounded-full bg-gradient-to-br from-lime-400/40 to-green-500/40'
            style={{
              width: el.size,
              height: el.size,
              left: el.x,
              top: el.y
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
              y: [0, -20, 0]
            }}
            transition={{
              duration: el.duration,
              delay: el.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      <div className='container mx-auto h-full px-4'>
        <div className='flex min-h-screen flex-col items-center justify-center py-20 text-center'>
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
            className='mb-6 max-w-4xl text-5xl leading-[1.1] font-bold tracking-tight md:text-6xl lg:text-8xl'
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
            className='text-muted-foreground mb-10 max-w-2xl text-lg md:text-xl'
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
              className='group h-14 min-w-[200px] bg-gradient-to-r from-lime-500 to-green-500 text-lg font-semibold text-white shadow-lg shadow-green-500/25 hover:from-lime-600 hover:to-green-600 hover:shadow-green-500/40'
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
              className='h-14 min-w-[200px] text-lg font-semibold'
            >
              <Link href='/sign-in'>Já tenho conta</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className='mt-16 flex gap-12 md:gap-16'
          >
            {[
              { value: '10K+', label: 'Usuários ativos' },
              { value: '1M+', label: 'Mensagens enviadas' },
              { value: '<1s', label: 'Tempo de conexão' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className='text-center'
              >
                <div className='bg-gradient-to-r from-lime-400 to-green-500 bg-clip-text text-3xl font-bold text-transparent md:text-4xl'>
                  {stat.value}
                </div>
                <div className='text-muted-foreground mt-1 text-sm'>
                  {stat.label}
                </div>
              </motion.div>
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
