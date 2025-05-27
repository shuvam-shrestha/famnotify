import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Using Geist Sans
import './globals.css';
import { AppProviders } from '@/context/AppProviders';
import { Toaster } from '@/components/ui/toaster';
import { SiteHeader } from '@/components/site/SiteHeader';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Family Hub',
  description: 'Stay connected with your family.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <AppProviders>
          <SiteHeader />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
