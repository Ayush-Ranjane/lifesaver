'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeUp } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type AuthMode = 'signin' | 'signup';

export function AuthFormPanel() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      const msg = (err as { code?: string }).code ?? '';
      setError(
        msg === 'auth/email-already-in-use'
          ? 'Email already in use'
          : msg === 'auth/invalid-credential'
            ? 'Invalid email or password'
            : msg === 'auth/wrong-password'
              ? 'Incorrect password'
              : msg === 'auth/user-not-found'
                ? 'No account with that email'
                : msg === 'auth/weak-password'
                  ? 'Password must be at least 6 characters'
                  : `Authentication failed: ${msg || (err as Error).message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError('');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-void bg-hero-glow px-6 py-12 lg:px-16">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[420px] glass-card p-8 lg:p-10"
      >
        {/* Mobile brand */}
        <div className="mb-10 flex items-center justify-center gap-2.5 lg:hidden">
          <span className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_rgba(0,217,255,0.9)]" />
          <Link href="/" className="font-display text-lg font-bold text-text-primary">
            LifeSaver
          </Link>
        </div>

        <div className="mb-8 text-center lg:text-left">
          <h1 className="type-heading-1 text-text-primary">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="type-body-m mt-2 text-text-secondary">
            {mode === 'signin'
              ? 'Sign in to pick up where you left off.'
              : 'Start managing your life with calm intelligence.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mb-8 flex rounded-full bg-[var(--glass-mid)] p-1 backdrop-blur-apple">
          {(
            [
              { id: 'signup' as const, label: 'Create Account' },
              { id: 'signin' as const, label: 'Sign In' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchMode(tab.id)}
              className={cn(
                'flex-1 rounded-full py-2.5 text-body-m font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                mode === tab.id
                  ? 'bg-[var(--glass-bg-strong)] text-text-primary shadow-apple-md scale-[1.02]'
                  : 'text-text-secondary hover:text-text-primary hover:scale-[1.01]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-caption text-text-tertiary">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              autoComplete="email"
              leftIcon={<Mail />}
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              leftIcon={<Lock />}
            />

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="rounded-sm border border-critical/20 bg-critical/10 px-3 py-2 text-body-m text-critical"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-caption text-text-tertiary lg:text-left">
          By continuing you agree to our{' '}
          <span className="cursor-pointer text-text-secondary underline-offset-2 hover:text-text-primary hover:underline">
            Terms
          </span>{' '}
          and{' '}
          <span className="cursor-pointer text-text-secondary underline-offset-2 hover:text-text-primary hover:underline">
            Privacy Policy
          </span>
        </p>

        <p className="mt-4 text-center text-body-m text-text-tertiary lg:text-left">
          <Link href="/" className="text-cyan hover:underline">
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
