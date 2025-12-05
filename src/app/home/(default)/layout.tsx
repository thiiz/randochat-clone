import { MobileLayoutWrapper } from '@/components/layout/mobile-layout-wrapper';
import { HeartbeatProvider } from '@/components/heartbeat-provider';
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
  return (
    <HeartbeatProvider>
      <MobileLayoutWrapper>{children}</MobileLayoutWrapper>
    </HeartbeatProvider>
  );
}
