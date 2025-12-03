import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configurações - RandoChat',
  description: 'Configurações do RandoChat'
};

export default async function SettingsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
