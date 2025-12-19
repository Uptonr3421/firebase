import type { Metadata, Viewport } from "next";
import "./globals.css";

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import './globals.css';
export const metadata: Metadata = {
  title: 'Prometheus AI',
  description: 'Autonomous AI Executive Prosthetic',
  manifest: '/manifest.json',
  icons: {
    apple: [{ url: '/icons/icon-192.png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Prometheus',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="bg-black text-white antialiased font-sans">
        {children}
      </body>
      <body className="bg-black font-sans text-white antialiased">{children}</body>
    </html>
  );
}
