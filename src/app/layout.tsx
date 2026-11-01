import type { Metadata, Viewport } from 'next';

import './globals.css';

const description =
  'Enterprise Compliance Department KRA & KPI Management System featuring hierarchical calculation engine, operational registers, SLA tracking, and audit workflows.';

export const metadata: Metadata = {
  title: 'Compliance Department Dashboard',
  description,
  icons: { icon: { url: '/logo.png', type: 'image/png' } },
  openGraph: {
    title: 'Compliance Department Dashboard',
    description,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
