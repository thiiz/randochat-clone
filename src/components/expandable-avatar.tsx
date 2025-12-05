'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExpandableAvatarProps {
  src?: string | null;
  fallback: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  avatarClassName?: string;
  showExpandIcon?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12'
};

const fallbackTextSizes = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm'
};

export function ExpandableAvatar({
  src,
  fallback,
  name,
  size = 'md',
  className,
  avatarClassName,
  showExpandIcon = false
}: ExpandableAvatarProps) {
  const [open, setOpen] = React.useState(false);

  // Don't make expandable if there's no image
  if (!src) {
    return (
      <Avatar className={cn(sizeClasses[size], avatarClassName, className)}>
        <AvatarFallback className={cn(fallbackTextSizes[size], 'bg-muted')}>
          {fallback}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          className={cn(
            'group focus-visible:ring-primary relative cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            className
          )}
          aria-label={`Ver foto de ${name}`}
        >
          <Avatar
            className={cn(
              sizeClasses[size],
              'transition-transform duration-200 group-hover:scale-105',
              avatarClassName
            )}
          >
            <AvatarImage src={src} alt={name} />
            <AvatarFallback className={cn(fallbackTextSizes[size], 'bg-muted')}>
              {fallback}
            </AvatarFallback>
          </Avatar>

          {showExpandIcon && (
            <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100'>
              <ZoomIn className='h-4 w-4 text-white' />
            </div>
          )}
        </button>
      </DialogPrimitive.Trigger>

      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm'
                onClick={() => setOpen(false)}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
                className='fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none'
                onClick={() => setOpen(false)}
              >
                <div
                  className='relative flex flex-col items-center gap-4'
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Expanded Image */}
                  <motion.div
                    layoutId={`avatar-${src}`}
                    className='overflow-hidden rounded-full ring-4 ring-white/20'
                  >
                    <img
                      src={src}
                      alt={name}
                      className='h-64 w-64 object-cover sm:h-80 sm:w-80'
                    />
                  </motion.div>

                  {/* User name */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className='text-lg font-semibold text-white'
                  >
                    {name}
                  </motion.p>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
