'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[AppError]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-void bg-hero-glow flex flex-col items-center justify-center text-center p-6">
      <div className="glass-card p-10 max-w-md w-full space-y-6">
        <span className="text-5xl">⚠️</span>
        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-text-secondary max-w-sm mx-auto">
          An unexpected error occurred. We&apos;ve been notified and are looking into it.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">Try Again</button>
          <Link href="/dashboard" className="btn-secondary">Go Home</Link>
        </div>
      </div>
    </div>
  );
}
