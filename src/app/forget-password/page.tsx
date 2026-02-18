'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#060B14' }}>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image src="/images/brand/logo.png" alt="RS CAB" width={120} height={36} className="object-contain" />
          </div>

          {/* Lock icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-secondary/[0.08] flex items-center justify-center">
              <Lock className="w-7 h-7 text-secondary" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-3xl font-bold text-white text-center mb-2">Forgot Password?</h2>
                <p className="text-white/35 text-center mb-8 text-sm leading-relaxed">
                  No worries! Enter your email and we&apos;ll send you a reset link.
                </p>

                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                    <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-dark pl-12" required />
                  </div>
                  <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all">
                    Send Reset Link
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-secondary/[0.12] flex items-center justify-center">
                    <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-2">Check Your Email</h2>
                <p className="text-white/35 text-center mb-6 text-sm leading-relaxed">
                  We&apos;ve sent a reset link to{' '}
                  <span className="text-secondary font-medium">{email}</span>.
                </p>
                <button onClick={() => setSubmitted(false)} className="w-full py-3 border border-white/[0.08] text-white/50 font-medium rounded-xl hover:border-white/15 hover:bg-white/[0.03] transition-all text-sm">
                  Didn&apos;t receive? Resend
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center">
            <Link href="/login" className="text-white/35 text-sm hover:text-white/50 transition-colors inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
