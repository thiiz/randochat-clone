'use client';

import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageCircle, Menu, X } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  const navLinks = [
    { label: 'Recursos', href: '#features' },
    { label: 'Como funciona', href: '#how-it-works' },
    { label: 'Sobre', href: '#about' }
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'border-border/50 bg-background/80 border-b backdrop-blur-lg'
            : 'bg-transparent'
        }`}
      >
        <nav className='container mx-auto flex h-16 items-center justify-between px-4 md:h-20'>
          {/* Logo */}
          <Link href='/' className='flex items-center gap-2'>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-lime-500 to-green-500'
            >
              <MessageCircle className='h-5 w-5 text-white' />
            </motion.div>
            <span
              className={`text-xl font-bold ${isScrolled ? '' : 'text-white'}`}
            >
              RandoChat
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden items-center gap-8 md:flex'>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`hover:text-primary text-sm font-medium transition-colors ${
                  isScrolled
                    ? 'text-muted-foreground'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className='hidden items-center gap-4 md:flex'>
            <Button
              asChild
              variant='ghost'
              className={
                isScrolled
                  ? ''
                  : 'text-white hover:bg-white/10 hover:text-white'
              }
            >
              <Link href='/sign-in'>Entrar</Link>
            </Button>
            <Button
              asChild
              className='bg-gradient-to-r from-lime-500 to-green-500 text-white hover:from-lime-600 hover:to-green-600'
            >
              <Link href='/sign-up'>Criar conta</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden ${isScrolled ? '' : 'text-white'}`}
          >
            {isMobileMenuOpen ? (
              <X className='h-6 w-6' />
            ) : (
              <Menu className='h-6 w-6' />
            )}
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          pointerEvents: isMobileMenuOpen ? 'auto' : 'none'
        }}
        transition={{ duration: 0.2 }}
        className='bg-background/95 fixed inset-0 z-40 backdrop-blur-lg md:hidden'
      >
        <div className='flex h-full flex-col items-center justify-center gap-8'>
          {navLinks.map((link, index) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isMobileMenuOpen ? 1 : 0,
                y: isMobileMenuOpen ? 0 : 20
              }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className='text-2xl font-medium'
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isMobileMenuOpen ? 1 : 0,
              y: isMobileMenuOpen ? 0 : 20
            }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className='flex flex-col gap-4'
          >
            <Button
              asChild
              variant='outline'
              size='lg'
              className='min-w-[200px]'
            >
              <Link href='/sign-in' onClick={() => setIsMobileMenuOpen(false)}>
                Entrar
              </Link>
            </Button>
            <Button
              asChild
              size='lg'
              className='min-w-[200px] bg-gradient-to-r from-lime-500 to-green-500 text-white'
            >
              <Link href='/sign-up' onClick={() => setIsMobileMenuOpen(false)}>
                Criar conta
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
