import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'CareSync — Smart Elderly Care & Medication Management Platform',
  description: 'AI-assisted, 4-role medication management ecosystem for elderly independence, family peace of mind, and clinical oversight. ABDM Ready.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
