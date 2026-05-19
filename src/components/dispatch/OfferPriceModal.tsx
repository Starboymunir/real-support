'use client';

/* ═══════════════════════════════════════════════════════════
   Offer Your Price — driver bidding modal.

   Mirrors the former RS-CAB app: instead of typing a number,
   the driver picks from preset bids relative to the rider's
   offer — -10%, -5%, the exact offer, +10%, +20%.
   ═══════════════════════════════════════════════════════════ */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Gavel } from 'lucide-react';

interface OfferPriceModalProps {
  open: boolean;
  onClose: () => void;
  /** The rider's offered price (request budget / totalBill). */
  basePrice: number;
  /** The driver's existing bid, if they're updating one. */
  currentBid?: number | null;
  busy?: boolean;
  onSelect: (amount: number) => void;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export default function OfferPriceModal({
  open,
  onClose,
  basePrice,
  currentBid,
  busy = false,
  onSelect,
}: OfferPriceModalProps) {
  const base = basePrice > 0 ? basePrice : 0;
  const exact =
    currentBid != null && currentBid > 0 ? round2(currentBid) : round2(base);

  const presets: { label: string; value: number; tone: 'low' | 'mid' | 'high' }[] = [
    { label: '-10%', value: round2(base * 0.9), tone: 'low' },
    { label: '-5%', value: round2(base * 0.95), tone: 'low' },
    { label: currentBid != null ? 'Your bid' : 'Their offer', value: exact, tone: 'mid' },
    { label: '+10%', value: round2(base * 1.1), tone: 'high' },
    { label: '+20%', value: round2(base * 1.2), tone: 'high' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 8 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl"
          >
            <div className="mb-1 flex items-start justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Gavel size={18} className="text-secondary" />
                Offer Your Price
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-white/40 transition hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mb-5 text-sm text-white/40">
              Rider offered{' '}
              <span className="font-semibold text-white">£{base.toFixed(2)}</span> — pick
              your bid.
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              {presets.map((p) => (
                <button
                  key={p.label}
                  disabled={busy || p.value <= 0}
                  onClick={() => onSelect(p.value)}
                  className={`flex items-center justify-between gap-1 rounded-xl border px-3 py-3 transition disabled:opacity-50 sm:flex-col sm:justify-center ${
                    p.tone === 'mid'
                      ? 'border-secondary/40 bg-secondary/10 hover:bg-secondary/20'
                      : p.tone === 'low'
                        ? 'border-emerald-500/25 bg-emerald-500/[0.06] hover:bg-emerald-500/15'
                        : 'border-amber-400/25 bg-amber-400/[0.06] hover:bg-amber-400/15'
                  }`}
                >
                  <span className="text-[11px] font-medium text-white/50">{p.label}</span>
                  <span className="text-base font-bold text-white">
                    £{p.value.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>

            {busy && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/50">
                <Loader2 size={15} className="animate-spin" />
                Placing your bid…
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
