'use client';

import { useState } from 'react';
import { useFutureLetterStore } from '@/store/futureLetterStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Calendar, Loader2, Sparkles, X } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import { toast } from 'sonner';

export function FutureLetterModal() {
  const { isOpen, close } = useFutureLetterStore();
  const [theme, setTheme] = useState('Career Success');
  const [prompt, setPrompt] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isPending, setIsPending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!targetDate || !prompt) return;
    setIsPending(true);
    try {
      await apiFetch('/api/ai/future-self-letter', {
        method: 'POST',
        body: JSON.stringify({ theme, prompt, targetDate })
      });
      toast.success('Letter sealed and scheduled!', {
        description: `Your future self will receive it on ${targetDate}.`
      });
      close();
      setPrompt('');
      setTheme('Career Success');
    } catch {
      toast.error('Failed to schedule letter');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={close}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg glass rounded-3xl p-6 shadow-2xl border border-border"
        >
          <button onClick={close} className="absolute top-4 right-4 p-2 btn-ghost rounded-xl">
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Write to Your Future Self</h2>
              <p className="text-sm text-muted-foreground">AI will transform your thoughts into an inspiring letter.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Theme</label>
              <select className="input-base w-full" value={theme} onChange={e => setTheme(e.target.value)}>
                <option>Career Success</option>
                <option>Health & Fitness</option>
                <option>Personal Growth</option>
                <option>Financial Freedom</option>
                <option>Relationships</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Current Thoughts</label>
              <textarea
                className="input-base w-full h-32 resize-none"
                placeholder="I am working so hard right now on..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-2"><Calendar className="w-4 h-4" /> Delivery Date</label>
              <input
                type="date"
                className="input-base w-full"
                value={targetDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setTargetDate(e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isPending || !prompt || !targetDate}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Seal Letter</>}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
