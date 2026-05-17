'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Wallet,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Minus,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  PieChart,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { walletApi } from '@/lib/services/wallet';
import {
  sharesApi,
  type CompanyShare,
  type UserShareHolding,
  type ShareTransaction,
} from '@/lib/services/shares';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

/* ── Animated counter ── */
function useCounter(end: number, dur = 1000) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let s = 0;
    const step = end / (dur / 16);
    const id = setInterval(() => {
      s += step;
      if (s >= end) { setN(end); clearInterval(id); } else setN(Math.floor(s * 100) / 100);
    }, 16);
    return () => clearInterval(id);
  }, [end, dur]);
  return n;
}

export default function SharesPage() {
  const { user } = useRequireAuth();
  const [share, setShare] = useState<CompanyShare | null>(null);
  const [holding, setHolding] = useState<UserShareHolding | null>(null);
  const [transactions, setTransactions] = useState<ShareTransaction[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Trade state
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(50);
  const [trading, setTrading] = useState(false);
  const [tradeResult, setTradeResult] = useState<{ success: boolean; message: string } | null>(null);

  const holdingQty = holding?.quantity ?? 0;
  const buyPrice = share?.buyPrice ?? 0;
  const sellPrice = share?.sellPrice ?? 0;
  const totalCost = tradeMode === 'buy' ? buyPrice * quantity : sellPrice * quantity;
  const holdingValue = holdingQty * (share?.price ?? 0);

  const animatedBalance = useCounter(walletBalance);
  const animatedHolding = useCounter(holdingQty);
  const animatedValue = useCounter(holdingValue);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [shareInfo, holdingData, wallet] = await Promise.all([
        sharesApi.getShareInfo(),
        sharesApi.getUserHolding(user.id).catch(() => ({ holding: null, transactions: [] })),
        walletApi.getUserWallet(user.id),
      ]);
      setShare(shareInfo);
      setHolding(holdingData.holding);
      setTransactions(holdingData.transactions ?? []);
      setWalletBalance(wallet.balance ?? 0);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTrade = async () => {
    if (!user?.id || !share) return;
    setTrading(true);
    setTradeResult(null);
    try {
      const result = tradeMode === 'buy'
        ? await sharesApi.buyShares(user.id, quantity)
        : await sharesApi.sellShares(user.id, quantity);
      setTradeResult({ success: true, message: result.message });
      setQuantity(50);
      await fetchData(); // refresh data
    } catch (err: any) {
      setTradeResult({ success: false, message: err?.message || 'Transaction failed. Please try again.' });
    } finally {
      setTrading(false);
    }
  };

  const canBuy = walletBalance >= totalCost && quantity > 0;
  const canSell = holdingQty >= quantity && quantity > 0;
  const canTrade = tradeMode === 'buy' ? canBuy : canSell;

  if (loading) {
    return (
      <DashboardLayout role="rider" pageTitle="Shares">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-secondary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="rider" pageTitle="Shares">
      <div className="space-y-6">

        {/* ═══════ BACK + HEADER ═══════ */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/rider/wallet"
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all"
            >
              <ArrowLeft size={20} className="text-white/60" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">One App Shares</h1>
              <p className="text-white/40 text-sm">Invest in the platform you ride with</p>
            </div>
          </div>
        </motion.div>

        {/* ═══════ SHARE PRICE HERO ═══════ */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-purple-500/[0.08] via-white/[0.02] to-blue-500/[0.06]">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/[0.06] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-16 left-1/3 w-56 h-56 bg-blue-500/[0.04] rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-blue-400 to-purple-500" />

            <div className="relative p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Price */}
                <div className="md:col-span-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center gap-1.5">
                      <Activity size={12} className="text-purple-400" />
                      <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Live Price</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-4xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                      £{share?.price?.toFixed(2) ?? '0.00'}
                    </p>
                    <p className="text-white/30 text-xs mt-1">per share</p>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div>
                      <p className="text-secondary text-lg font-bold tabular-nums">£{share?.buyPrice?.toFixed(2) ?? '0.00'}</p>
                      <p className="text-white/25 text-[10px] uppercase tracking-wider font-semibold">Buy Price</p>
                    </div>
                    <div className="w-px h-8 bg-white/[0.06]" />
                    <div>
                      <p className="text-accent text-lg font-bold tabular-nums">£{share?.sellPrice?.toFixed(2) ?? '0.00'}</p>
                      <p className="text-white/25 text-[10px] uppercase tracking-wider font-semibold">Sell Price</p>
                    </div>
                  </div>
                </div>

                {/* Portfolio Summary */}
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
                      <BarChart3 size={18} className="text-purple-400" />
                    </div>
                    <p className="text-2xl font-black text-white tabular-nums">{animatedHolding}</p>
                    <p className="text-white/30 text-xs mt-0.5">Shares Held</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                      <DollarSign size={18} className="text-blue-400" />
                    </div>
                    <p className="text-2xl font-black text-white tabular-nums">£{animatedValue.toFixed(2)}</p>
                    <p className="text-white/30 text-xs mt-0.5">Portfolio Value</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                    <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center mb-2">
                      <Wallet size={18} className="text-secondary" />
                    </div>
                    <p className="text-2xl font-black text-white tabular-nums">£{animatedBalance.toFixed(2)}</p>
                    <p className="text-white/30 text-xs mt-0.5">Wallet Balance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════ VALUATION BREAKDOWN ═══════ */}
        <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Asset Value', value: share?.assetValue ?? 0, icon: PieChart, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Earnings Value', value: share?.earningsValue ?? 0, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Future Value', value: share?.futureValue ?? 0, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all group">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={20} className={item.color} />
                  </div>
                  <p className="text-2xl font-black text-white tabular-nums">£{item.value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-white/30 text-xs font-medium mt-1">{item.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ═══════ TRADE PANEL + HISTORY ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Trade Panel */}
          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] h-full">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary via-purple-500 to-accent" />
              <div className="p-6">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <ShoppingCart size={18} className="text-purple-400" /> Trade Shares
                </h2>

                {/* Buy / Sell Toggle */}
                <div className="flex rounded-xl bg-white/[0.04] border border-white/[0.06] p-1 mb-6">
                  <button
                    onClick={() => { setTradeMode('buy'); setTradeResult(null); setQuantity(50); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      tradeMode === 'buy'
                        ? 'bg-secondary/20 text-secondary border border-secondary/30 shadow-lg shadow-secondary/5'
                        : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    Buy Shares
                  </button>
                  {holdingQty > 0 && (
                    <button
                      onClick={() => { setTradeMode('sell'); setTradeResult(null); setQuantity(50); }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        tradeMode === 'sell'
                          ? 'bg-accent/20 text-accent border border-accent/30 shadow-lg shadow-accent/5'
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      Sell Shares
                    </button>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="mb-4">
                  <label className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(50, quantity - 1))}
                      className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 hover:bg-white/[0.10] hover:text-white flex items-center justify-center transition-all"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      min={50}
                      max={tradeMode === 'sell' ? holdingQty : 99999}
                      value={quantity}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 50;
                        setQuantity(Math.max(50, tradeMode === 'sell' ? Math.min(v, holdingQty) : v));
                      }}
                      className="flex-1 text-center text-2xl font-black text-white bg-white/[0.04] border border-white/[0.08] rounded-xl py-2 focus:outline-none focus:border-purple-500/40 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => setQuantity(tradeMode === 'sell' ? Math.min(quantity + 1, holdingQty) : quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 hover:bg-white/[0.10] hover:text-white flex items-center justify-center transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {/* Quick amounts */}
                  <div className="flex gap-2 mt-3">
                    {[50, 100, 500, 1000, 5000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setQuantity(tradeMode === 'sell' ? Math.min(amt, holdingQty) : amt)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          quantity === amt
                            ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                            : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:bg-white/[0.06]'
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Price per share</span>
                    <span className="text-white font-bold tabular-nums">
                      £{(tradeMode === 'buy' ? buyPrice : sellPrice).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Quantity</span>
                    <span className="text-white font-bold tabular-nums">×{quantity}</span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-2 flex justify-between">
                    <span className="text-white/60 font-semibold text-sm">
                      {tradeMode === 'buy' ? 'Total Cost' : 'You Receive'}
                    </span>
                    <span className={`text-lg font-black tabular-nums ${tradeMode === 'buy' ? 'text-secondary' : 'text-accent'}`}>
                      £{totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Warnings */}
                {tradeMode === 'buy' && !canBuy && quantity > 0 && (
                  <div className="flex items-center gap-2 mb-4 text-xs text-red-400">
                    <AlertCircle size={14} />
                    <span>Insufficient wallet balance (£{walletBalance.toFixed(2)} available)</span>
                  </div>
                )}
                {tradeMode === 'sell' && holdingQty === 0 && (
                  <div className="flex items-center gap-2 mb-4 text-xs text-white/30">
                    <AlertCircle size={14} />
                    <span>You don&apos;t own any shares yet</span>
                  </div>
                )}
                {tradeMode === 'sell' && holdingQty > 0 && !canSell && (
                  <div className="flex items-center gap-2 mb-4 text-xs text-red-400">
                    <AlertCircle size={14} />
                    <span>You only hold {holdingQty} share{holdingQty !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Trade Result */}
                <AnimatePresence>
                  {tradeResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={`flex items-center gap-2 mb-4 text-sm font-semibold p-3 rounded-xl ${
                        tradeResult.success
                          ? 'bg-secondary/10 border border-secondary/20 text-secondary'
                          : 'bg-red-500/10 border border-red-500/20 text-red-400'
                      }`}
                    >
                      {tradeResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {tradeResult.message}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Trade Button */}
                <button
                  onClick={handleTrade}
                  disabled={!canTrade || trading}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    tradeMode === 'buy'
                      ? canTrade
                        ? 'bg-gradient-to-r from-secondary to-secondary-light text-white hover:shadow-lg hover:shadow-secondary/20 hover:-translate-y-0.5'
                        : 'bg-white/[0.06] text-white/20 cursor-not-allowed'
                      : canTrade
                        ? 'bg-gradient-to-r from-accent to-red-400 text-white hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5'
                        : 'bg-white/[0.06] text-white/20 cursor-not-allowed'
                  }`}
                >
                  {trading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : tradeMode === 'buy' ? (
                    <>
                      <ShoppingCart size={16} />
                      Buy {quantity} Share{quantity !== 1 ? 's' : ''} for £{totalCost.toFixed(2)}
                    </>
                  ) : (
                    <>
                      <DollarSign size={16} />
                      Sell {quantity} Share{quantity !== 1 ? 's' : ''} for £{totalCost.toFixed(2)}
                    </>
                  )}
                </button>

                <p className="text-center text-white/20 text-[10px] mt-3">
                  Sell price is 10% below market price to encourage long-term holding
                </p>
              </div>
            </div>
          </motion.div>

          {/* Transaction History */}
          <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp} className="lg:col-span-3">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] h-full">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="p-6">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <Activity size={18} className="text-blue-400" /> Share Transactions
                </h2>

                {transactions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                      <BarChart3 size={28} className="text-purple-400/40" />
                    </div>
                    <p className="text-white/40 text-sm font-medium">No share transactions yet</p>
                    <p className="text-white/20 text-xs mt-1">Buy your first shares to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((tx) => {
                      const isBuy = tx.type === 'BUY';
                      const d = new Date(tx.createdAt);
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBuy ? 'bg-secondary/10' : 'bg-accent/10'}`}>
                              {isBuy
                                ? <ArrowDownLeft size={18} className="text-secondary" />
                                : <ArrowUpRight size={18} className="text-accent" />
                              }
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {isBuy ? 'Bought' : 'Sold'} {tx.quantity} share{tx.quantity !== 1 ? 's' : ''}
                              </p>
                              <p className="text-xs text-white/30 mt-0.5">
                                @ £{tx.price.toFixed(2)} each &middot; {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold tabular-nums ${isBuy ? 'text-white' : 'text-secondary'}`}>
                              {isBuy ? '-' : '+'}£{tx.total.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-white/25 mt-0.5">
                              {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══════ INFO SECTION ═══════ */}
        <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-purple-400" /> How One App Shares Work
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: 'Buy Shares',
                  desc: 'Purchase shares using your wallet balance. Share prices are recalculated hourly based on company valuation.',
                  icon: ShoppingCart,
                  color: 'text-secondary',
                  bg: 'bg-secondary/10',
                },
                {
                  title: 'Hold & Grow',
                  desc: 'As the platform grows, asset and earnings values increase — driving up your share price over time.',
                  icon: TrendingUp,
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/10',
                },
                {
                  title: 'Sell Anytime',
                  desc: 'Sell your shares back at the sell price (10% below market) and the proceeds go straight to your wallet.',
                  icon: DollarSign,
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                      <Icon size={20} className={item.color} />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-white/30 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
