import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FocusLofiPlayer({ dimmed }: { dimmed: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: dimmed ? 0.4 : 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-xl transition-opacity hover:opacity-100"
          >
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2">
              <span className="text-xs font-semibold text-text-secondary">Lofi Radio</span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-text-tertiary hover:bg-muted hover:text-text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="bg-black">
              <iframe
                width="320"
                height="180"
                src="https://www.youtube.com/embed/l-2hOKIrIyI?autoplay=1&mute=0&controls=1"
                title="Lofi Girl - lofi hip hop radio"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ opacity: dimmed && !isOpen ? 0.3 : 1 }}
        transition={{ duration: 0.5 }}
        className="transition-opacity hover:opacity-100"
      >
        <Button
          variant={isOpen ? "primary" : "secondary"}
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <Music className="h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}
