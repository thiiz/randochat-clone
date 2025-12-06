'use client';

import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { UserPlus, Search, MessageCircle, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Crie sua conta',
    description:
      'Cadastre-se em segundos com seu email ou redes sociais. É rápido e gratuito.'
  },
  {
    icon: Search,
    step: '02',
    title: 'Encontre alguém',
    description:
      'Clique em "Buscar" e nosso algoritmo encontrará alguém online para você conversar.'
  },
  {
    icon: MessageCircle,
    step: '03',
    title: 'Comece a conversar',
    description:
      'Envie mensagens, compartilhe imagens e conheça pessoas incríveis de todo o mundo.'
  },
  {
    icon: Sparkles,
    step: '04',
    title: 'Faça conexões',
    description:
      'Favorite conversas interessantes e construa amizades que podem durar para sempre.'
  }
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.5 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  // Parallax for background
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <section
      ref={sectionRef}
      className='bg-muted/30 relative z-10 overflow-hidden py-24'
    >
      {/* Background Pattern with parallax */}
      <motion.div
        style={{ y: bgY }}
        className='absolute inset-0 -z-10 opacity-50'
      >
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern
              id='grid'
              width='40'
              height='40'
              patternUnits='userSpaceOnUse'
            >
              <path
                d='M 40 0 L 0 0 0 40'
                fill='none'
                stroke='currentColor'
                strokeWidth='0.5'
                className='text-border'
              />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#grid)' />
        </svg>
      </motion.div>

      <div className='container mx-auto px-4'>
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={
            isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
          }
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className='mx-auto mb-16 max-w-2xl text-center'
        >
          <span className='bg-primary/10 text-primary mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium'>
            Como funciona
          </span>
          <h2 className='mb-4 text-4xl font-bold md:text-5xl'>
            Simples como{' '}
            <span className='bg-gradient-to-r from-lime-400 to-green-500 bg-clip-text text-transparent'>
              1, 2, 3, 4
            </span>
          </h2>
          <p className='text-muted-foreground text-lg'>
            Em poucos passos você já estará conversando com pessoas novas.
          </p>
        </motion.div>

        {/* Steps */}
        <div className='relative'>
          {/* Connection Line */}
          <div className='via-border absolute top-0 left-1/2 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-transparent lg:block' />

          <div className='grid gap-8 lg:grid-cols-2 lg:gap-16'>
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;

              return (
                <StepCard
                  key={step.step}
                  step={step}
                  index={index}
                  isEven={isEven}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
  isEven
}: {
  step: (typeof steps)[0];
  index: number;
  isEven: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -40 : 40 }}
      animate={
        isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? -40 : 40 }
      }
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={`relative ${isEven ? 'lg:pr-16' : 'lg:col-start-2 lg:pl-16'}`}
    >
      {/* Step Card */}
      <div className='group border-border bg-card/80 hover:border-primary/50 relative rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
        {/* Step Number */}
        <div className='bg-primary text-primary-foreground absolute -top-4 left-8 rounded-full px-4 py-1 text-sm font-bold'>
          {step.step}
        </div>

        {/* Icon */}
        <div className='bg-primary/10 text-primary mb-4 inline-flex rounded-xl p-3'>
          <step.icon className='h-6 w-6' />
        </div>

        {/* Content */}
        <h3 className='mb-2 text-xl font-semibold'>{step.title}</h3>
        <p className='text-muted-foreground'>{step.description}</p>
      </div>

      {/* Connection Dot */}
      <div
        className={`border-background bg-primary absolute top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full border-4 lg:block ${isEven ? '-right-2' : '-left-2'}`}
      />
    </motion.div>
  );
}
