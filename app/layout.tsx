import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://paymenku.com'),
  title: {
    default: 'Paymenku API — Dokumentasi',
    template: '%s — Paymenku API',
  },
  description:
    'Dokumentasi API Paymenku: QRIS, Virtual Account, e-wallet, gerai ritel, payment link, dan webhook untuk payment gateway Indonesia.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
