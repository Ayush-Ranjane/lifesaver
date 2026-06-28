'use client';
// ─── Individual Shipped Goal Page — OG-ready for sharing ──────────────────────
import { useEffect, useState, use } from 'react';
import { db } from '@/lib/firebase/client';
import { doc, onSnapshot, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { auth } from '@/lib/firebase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';
import { Ship, Heart, ArrowLeft, Share2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
}

export default function ShipDetailPage({ params }: { params: Promise<{ shipId: string }> }) {
  const resolvedParams = use(params);
  const shipId = resolvedParams.shipId;
  const [ship, setShip] = useState<ShippedItem | null>(null);
  const [copied, setCopied] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'shippedWall', shipId), (snap) => {
      if (snap.exists()) {
        setShip({
          id: snap.id,
          ...snap.data(),
          shippedAt: snap.data().shippedAt?.toDate?.() ?? new Date(),
        } as ShippedItem);
      }
    });
    return () => unsub();
  }, [shipId]);

  const handleLike = async () => {
    if (!currentUser || !ship) return;
    if (ship.likedBy.includes(currentUser.uid)) return;
    await updateDoc(doc(db, 'shippedWall', shipId), {
      likes: increment(1),
      likedBy: arrayUnion(currentUser.uid),
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!ship) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="skeleton w-96 h-64 rounded-3xl" />
      </div>
    );
  }

  const liked = currentUser && ship.likedBy.includes(currentUser.uid);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <Link href="/wall" className="btn-ghost text-sm inline-flex mb-8">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Wall
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 space-y-6 border border-border"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            {ship.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ship.avatarUrl} alt={ship.displayName} className="w-12 h-12 rounded-full ring-2 ring-border" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-base font-bold text-primary">
                {(ship.displayName || 'A')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-bold">{ship.displayName}</p>
              <p className="text-xs text-muted-foreground">{formatDistanceToNow(ship.shippedAt, { addSuffix: true })}</p>
            </div>
          </div>

          {/* Main goal */}
          <div className="text-center py-4 space-y-3">
            <p className="text-5xl">{ship.emoji}</p>
            <h1 className="text-2xl font-black leading-tight">{ship.goalTitle}</h1>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">Shipped in {ship.goalDuration}</span>
            </div>
            <p className="text-xs text-muted-foreground">{format(ship.shippedAt, 'MMMM d, yyyy')}</p>
          </div>

          {/* Message */}
          {ship.message && (
            <div className="bg-secondary/40 rounded-2xl p-4 border border-border">
              <p className="text-sm italic text-muted-foreground">&quot;{ship.message}&quot;</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleLike}
              disabled={!currentUser || !!liked}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium',
                liked
                  ? 'bg-red-500/15 border-red-500/30 text-red-400'
                  : 'border-border hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-muted-foreground'
              )}
            >
              <Heart className={cn('w-4 h-4', liked && 'fill-red-400')} />
              {ship.likes} {ship.likes === 1 ? 'like' : 'likes'}
            </button>

            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-secondary transition-all text-sm font-medium text-muted-foreground ml-auto">
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>

          {/* CTA */}
          {!currentUser && (
            <div className="pt-2 border-t border-border text-center">
              <p className="text-xs text-muted-foreground mb-3">Track your own goals with AI-powered productivity</p>
              <Link href="/auth" className="btn-primary w-full">
                <Ship className="w-4 h-4" /> Start Shipping Your Goals
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
