import { MobileLayoutWrapper } from '@/components/layout/mobile-layout-wrapper';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RandoChat - Chat Anônimo',
  description: 'Converse com pessoas aleatórias de forma anônima'
};

export default async function DefaultLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <MobileLayoutWrapper>{children}</MobileLayoutWrapper>;
}
