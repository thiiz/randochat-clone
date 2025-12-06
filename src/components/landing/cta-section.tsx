'use client';

import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  // Parallax for floating elements
  const floatY1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const floatY2 = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <section
      ref={sectionRef}
      className='bg-background relative z-10 overflow-hidden py-24'
    >
      {/* Background Gradient */}
      <div className='absolute inset-0 -z-10'>
        <div className='absolute inset-0 bg-gradient-to-br from-lime-500/20 via-green-500/10 to-emerald-500/20' />
        <div className='via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent' />
      </div>

      {/* Floating Elements with parallax */}
      <motion.div
        style={{ y: floatY1 }}
        className='absolute top-20 left-10 h-20 w-20 rounded-2xl bg-gradient-to-br from-lime-500 to-green-500 opacity-20 blur-xl'
      />
      <motion.div
        style={{ y: floatY2 }}
        className='absolute right-10 bottom-20 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 opacity-20 blur-xl'
      />

      <div className='container mx-auto px-4'>
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className='relative mx-auto max-w-4xl'
        >
          {/* Card */}
          <div className='border-border bg-card/80 relative overflow-hidden rounded-3xl border p-12 backdrop-blur-sm md:p-16'>
            {/* Decorative gradient */}
            <div className='absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-lime-500 to-green-500 opacity-30 blur-3xl' />
            <div className='absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 opacity-30 blur-3xl' />

            <div className='relative text-center'>
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={
                  isInView
                    ? { scale: 1, rotate: 0 }
                    : { scale: 0, rotate: -180 }
                }
                transition={{
                  duration: 0.5,
                  delay: 0.1,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                className='mx-auto mb-6 inline-flex rounded-2xl bg-gradient-to-br from-lime-500 to-green-500 p-4'
              >
                <Sparkles className='h-8 w-8 text-white' />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{
                  duration: 0.5,
                  delay: 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className='mb-4 text-3xl font-bold md:text-5xl'
              >
                Pronto para conhecer{' '}
                <span className='bg-gradient-to-r from-lime-400 via-green-500 to-emerald-500 bg-clip-text text-transparent'>
                  pessoas incríveis?
                </span>
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className='text-muted-foreground mx-auto mb-8 max-w-xl text-lg'
              >
                Junte-se a milhares de pessoas que já estão fazendo novas
                conexões todos os dias. É grátis, rápido e seguro.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{
                  duration: 0.5,
                  delay: 0.25,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                <Button
                  asChild
                  size='lg'
                  className='group h-14 min-w-[250px] bg-gradient-to-r from-lime-500 to-green-500 text-lg font-semibold text-white hover:from-lime-600 hover:to-green-600'
                >
                  <Link href='/sign-up'>
                    Criar conta grátis
                    <ArrowRight className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
                  </Link>
                </Button>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className='text-muted-foreground mt-8 flex flex-wrap items-center justify-center gap-6 text-sm'
              >
                {['100% Gratuito', 'Sem anúncios', 'Privacidade garantida'].map(
                  (text) => (
                    <span key={text} className='flex items-center gap-2'>
                      <svg
                        className='h-5 w-5 text-green-500'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                      {text}
                    </span>
                  )
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
