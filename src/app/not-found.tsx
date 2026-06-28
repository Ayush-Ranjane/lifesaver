import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void bg-hero-glow flex flex-col items-center justify-center text-center p-6">
      <div className="glass-card p-10 max-w-md w-full space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-apple-gradient-soft flex items-center justify-center mx-auto shadow-apple-md">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-7xl font-black gradient-text opacity-40">404</h1>
        <h2 className="text-2xl font-bold tracking-tight">Page not found</h2>
        <p className="text-text-secondary max-w-sm mx-auto">
          This page doesn&apos;t exist or was moved. Head back to your dashboard.
        </p>
        <Link href="/dashboard" className="btn-primary gap-2 mx-auto">
          <Sparkles className="w-4 h-4" /> Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
