import type { Metadata, Viewport } from 'next';
import { SessionProvider } from '@/components/SessionProvider';
import PublicLayout from '@/components/layout/PublicLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sauna e Espaço da Janice',
  description:
    'Sauna, piscina e aluguel de espaço para festas e eventos. Faça suas reservas, confira disponibilidade e muito mais.',
  keywords: 'sauna, piscina, aluguel, reserva, espaço, festa, lazer, janice',
  authors: [{ name: 'Sauna e Espaço da Janice' }],
  openGraph: {
    title: 'Sauna e Espaço da Janice',
    description:
      'Sauna, piscina e aluguel de espaço para festas e eventos.',
    locale: 'pt_BR',
    type: 'website',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#ea580c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-white text-dark-900 antialiased">
        <SessionProvider>
          <PublicLayout>{children}</PublicLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
