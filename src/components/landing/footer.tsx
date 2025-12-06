'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { MessageCircle, Github, Twitter } from 'lucide-react';

const footerLinks = {
  produto: [
    { label: 'Recursos', href: '#features' },
    { label: 'Como funciona', href: '#how-it-works' },
    { label: 'Preços', href: '#pricing' }
  ],
  empresa: [
    { label: 'Sobre nós', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Carreiras', href: '/careers' }
  ],
  legal: [
    { label: 'Privacidade', href: '/privacy' },
    { label: 'Termos de uso', href: '/terms' },
    { label: 'Cookies', href: '/cookies' }
  ],
  suporte: [
    { label: 'Central de ajuda', href: '/help' },
    { label: 'Contato', href: '/contact' },
    { label: 'Status', href: '/status' }
  ]
};

export function Footer() {
  return (
    <footer className='border-border bg-muted/30 relative z-10 border-t'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-6'>
          {/* Brand */}
          <div className='lg:col-span-2'>
            <Link href='/' className='mb-4 inline-flex items-center gap-2'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500'>
                <MessageCircle className='h-5 w-5 text-white' />
              </div>
              <span className='text-xl font-bold'>RandoChat</span>
            </Link>
            <p className='text-muted-foreground mb-6 max-w-xs'>
              Conectando pessoas de todo o mundo através de conversas aleatórias
              e significativas.
            </p>
            <div className='flex gap-4'>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href='https://github.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors'
              >
                <Github className='h-5 w-5' />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors'
              >
                <Twitter className='h-5 w-5' />
              </motion.a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className='mb-4 font-semibold capitalize'>{category}</h4>
              <ul className='space-y-3'>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className='text-muted-foreground hover:text-foreground transition-colors'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className='border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row'>
          <p className='text-muted-foreground text-sm'>
            © {new Date().getFullYear()} RandoChat. Todos os direitos
            reservados.
          </p>
          <p className='text-muted-foreground text-sm'>
            Feito com ❤️ para conectar pessoas
          </p>
        </div>
      </div>
    </footer>
  );
}
