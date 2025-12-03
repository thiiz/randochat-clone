import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat - RandoChat',
  description: 'Converse com pessoas aleatórias de forma anônima'
};

export default async function ChatLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
