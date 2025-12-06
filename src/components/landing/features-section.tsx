'use client';

import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import {
  MessageSquare,
  Shield,
  Zap,
  Globe,
  Heart,
  Image as ImageIcon
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Conexão Instantânea',
    description:
      'Encontre alguém para conversar em menos de 1 segundo. Nosso algoritmo inteligente conecta você rapidamente.',
    gradient: 'from-lime-500 to-green-500'
  },
  {
    icon: Shield,
    title: 'Privacidade Garantida',
    description:
      'Suas conversas são privadas e seguras. Você controla o que compartilha e com quem.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: MessageSquare,
    title: 'Chat em Tempo Real',
    description:
      'Mensagens instantâneas com indicador de digitação e confirmação de leitura.',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: ImageIcon,
    title: 'Compartilhe Imagens',
    description:
      'Envie fotos e imagens durante suas conversas. Compressão automática para envio rápido.',
    gradient: 'from-teal-500 to-cyan-500'
  },
  {
    icon: Globe,
    title: 'Pessoas do Mundo Todo',
    description:
      'Conecte-se com pessoas de diferentes países e culturas. Expanda seus horizontes.',
    gradient: 'from-cyan-500 to-sky-500'
  },
  {
    icon: Heart,
    title: 'Favoritos',
    description:
      'Salve suas conversas favoritas e reconecte-se com pessoas interessantes quando quiser.',
    gradient: 'from-green-500 to-lime-500'
  }
];

function FeatureCard({
  feature,
  index
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className='group relative'
    >
      <div className='border-border bg-card/80 hover:border-primary/50 relative overflow-hidden rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
        {/* Gradient background on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
        />

        {/* Icon */}
        <div
          className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3`}
        >
          <feature.icon className='h-6 w-6 text-white' />
        </div>

        {/* Content */}
        <h3 className='mb-2 text-xl font-semibold'>{feature.title}</h3>
        <p className='text-muted-foreground'>{feature.description}</p>

        {/* Decorative corner */}
        <div
          className={`absolute -top-12 -right-12 h-24 w-24 rounded-full bg-gradient-to-br ${feature.gradient} opacity-10 blur-2xl transition-all duration-300 group-hover:opacity-20`}
        />
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.5 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  // Parallax for background decorations
  const bgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <section
      ref={sectionRef}
      className='bg-background relative z-10 overflow-hidden py-24'
    >
      {/* Background decoration with parallax */}
      <motion.div
        style={{ y: bgY }}
        className='absolute inset-0 -z-10 overflow-hidden'
      >
        <div className='absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-lime-500/10 blur-3xl' />
        <div className='absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl' />
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
            Recursos
          </span>
          <h2 className='mb-4 text-4xl font-bold md:text-5xl'>
            Tudo que você precisa para{' '}
            <span className='bg-gradient-to-r from-lime-400 to-green-500 bg-clip-text text-transparent'>
              conectar
            </span>
          </h2>
          <p className='text-muted-foreground text-lg'>
            Uma plataforma completa para conhecer pessoas novas de forma segura
            e divertida.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
