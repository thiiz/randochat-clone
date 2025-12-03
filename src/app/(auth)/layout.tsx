import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='bg-background relative flex min-h-screen items-center justify-center p-4'>
      <div className='absolute top-4 right-4'>
        <ModeToggle />
      </div>
      <div className='w-full max-w-md'>{children}</div>
    </div>
  );
}
