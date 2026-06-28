import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { InboxReviewPanel } from '@/components/InboxReviewPanel';
import { FutureLetterModal } from '@/components/FutureLetterModal';
import { GitHubImportPanel } from '@/components/GitHubImportPanel';
import { CommandPalette } from '@/components/CommandPalette';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['700', '800'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | LifeSaver',
    default: 'LifeSaver — AI-Powered Task Management',
  },
  description:
    'Stop forgetting deadlines. LifeSaver uses Gemini AI to parse your tasks, schedule your day, and keep you on track with smart reminders.',
  keywords: ['task management', 'AI productivity', 'deadline tracker', 'Gemini AI', 'smart reminders'],
  openGraph: {
    title: 'LifeSaver — AI-Powered Task Management',
    description: 'Your AI productivity co-pilot. Parse tasks with voice or text, get smart reminders, and never miss a deadline.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#08080F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${display.variable} ${mono.variable}`}
    >
      <body className={`${inter.className} antialiased bg-void text-text-primary overflow-x-hidden`}>
        {/* Premium SVG Noise Overlay */}
        <div className="pointer-events-none fixed inset-0 z-[100] h-full w-full opacity-[0.03]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.25 0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>

        {/* Apple-style ambient background */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-opacity duration-700 bg-void">
          <div className="absolute -top-[25%] left-[5%] w-[70vw] h-[70vw] rounded-full bg-blue-500/[0.08] dark:bg-blue-500/[0.12] blur-[120px] animate-glow-drift" />
          <div className="absolute -bottom-[15%] right-[5%] w-[55vw] h-[55vw] rounded-full bg-purple-500/[0.06] dark:bg-purple-500/[0.1] blur-[100px] animate-glow-drift opacity-70" style={{ animationDelay: '4s', animationDuration: '28s' }} />
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[40vw] h-[40vw] rounded-full bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08] blur-[80px] animate-glow-drift opacity-50" style={{ animationDelay: '8s', animationDuration: '32s' }} />
        </div>
        <Providers>
          {children}
          <InboxReviewPanel />
          <FutureLetterModal />
          <GitHubImportPanel />
          <CommandPalette />
        </Providers>
      </body>
    </html>
  );
}
