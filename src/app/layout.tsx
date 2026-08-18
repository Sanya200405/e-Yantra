import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'YantraHub | e-Yantra Robotics Team Progress Platform',
  description:
    'A real, cloud-hosted team progress and project management platform for e-Yantra Robotics Competition (eYRC) teams.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full suppressHydrationWarning">
      <body className="h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
