import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';
import { NoiseBackground } from '@/components/ui/noise-background';
import { GridBackground } from '@/components/ui/grid-background';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4'>
      <NoiseBackground />
      <GridBackground />

      {/* Emerald Glow */}
      <div
        className='pointer-events-none absolute z-0'
        style={{
          backgroundImage: 'url("/grain-blur.svg")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          width: '800px',
          height: '800px',
          opacity: 0.4
        }}
      />

      <div className='absolute top-4 right-4 z-10'>
        <ModeToggle />
      </div>
      <div className='relative z-10 w-full max-w-md'>{children}</div>
    </div>
  );
}
