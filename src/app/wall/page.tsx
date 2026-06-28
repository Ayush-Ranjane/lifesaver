'use client';
// ─── Public Shipped Wall ───────────────────────────────────────────────────────
// Real-time Firestore listener. No auth required to view.

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { auth } from '@/lib/firebase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Ship, Heart, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ShippedItem {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  goalTitle: string;
  goalDuration: string;
  shippedAt: Date;
  emoji: string;
  message: string | null;
  likes: number;
  likedBy: string[];
  isPublic: boolean;
}

export default function WallPage() {
  const [ships, setShips] = useState<ShippedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(
      collection(db, 'shippedWall'),
      where('isPublic', '==', true),
      orderBy('shippedAt', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        shippedAt: d.data().shippedAt?.toDate?.() ?? new Date(),
      })) as ShippedItem[];
      setShips(items);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleLike = async (ship: ShippedItem) => {
    if (!currentUser) return;
    if (ship.likedBy.includes(currentUser.uid)) return;

    const ref = doc(db, 'shippedWall', ship.id);
    await updateDoc(ref, {
      likes: increment(1),
      likedBy: arrayUnion(currentUser.uid),
    });
  };

  return (
    <div className="min-h-screen bg-void bg-hero-glow text-foreground">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-40 h-16 apple-glass-strong border-b border-[var(--glass-border)] flex items-center justify-between px-6 md:px-12 shadow-apple-md">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-accent-gradient flex items-center justify-center shadow-apple-sm transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold gradient-text">LifeSaver</span>
        </Link>
        <Link href="/auth" className="btn-primary text-sm py-2">Start Shipping</Link>
      </nav>

      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-apple text-sm text-text-secondary mb-2 shadow-apple-sm">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Live updates
          </div>
          <h1 className="text-4xl md:text-5xl font-black gradient-text">Shipped 🚢</h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Real people. Real goals. Real wins. This is what shipping looks like.
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
          </div>
        ) : ships.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <Ship className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold">No ships yet</p>
            <p className="text-muted-foreground mt-2">Be the first to ship a goal 🚢</p>
            <Link href="/auth" className="btn-primary mt-6 inline-flex">Get Started</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {ships.map((ship) => {
                const liked = currentUser && ship.likedBy.includes(currentUser.uid);
                return (
                  <motion.div
                    key={ship.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-card p-5 space-y-3 hover:-translate-y-1 transition-all duration-300 group"
                  >
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3">
                      {ship.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ship.avatarUrl} alt={ship.displayName} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {(ship.displayName || 'A')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{ship.displayName}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(ship.shippedAt, { addSuffix: true })}</p>
                      </div>
                      <div className="ml-auto">
                        <Link href={`/wall/${ship.id}`} className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Goal */}
                    <div className="space-y-1">
                      <p className="text-2xl">{ship.emoji}</p>
                      <p className="font-bold text-base leading-snug">{ship.goalTitle}</p>
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        Shipped in {ship.goalDuration}
                      </span>
                    </div>

                    {/* Message */}
                    {ship.message && (
                      <p className="text-sm text-muted-foreground italic">&quot;{ship.message}&quot;</p>
                    )}

                    {/* Like */}
                    <button
                      onClick={() => handleLike(ship)}
                      disabled={!currentUser || !!liked}
                      className={cn(
                        'flex items-center gap-1.5 text-sm transition-all',
                        liked ? 'text-red-400' : 'text-muted-foreground hover:text-red-400',
                        !currentUser && 'cursor-default'
                      )}
                    >
                      <Heart className={cn('w-4 h-4', liked && 'fill-red-400')} />
                      {ship.likes}
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Non-auth CTA */}
        {!currentUser && (
          <div className="mt-12 glass-card p-10 text-center hover-lift">
            <p className="text-xl font-bold mb-2">Ready to ship your goals?</p>
            <p className="text-muted-foreground mb-6">Join thousands of people tracking goals with AI-powered productivity.</p>
            <Link href="/auth" className="btn-primary text-lg py-3 px-8">
              Start for Free → 
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
