'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function CompanyLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { companyLogin, loading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await companyLogin({ emailAddress: email, password });
      router.push('/company/dashboard');
    } catch {
      // error set in context
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#060B14' }}>
      {/* Left â€” Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute top-20 -left-10 w-64 h-64 bg-secondary/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex justify-center mb-10 mt-6">
            <Image src="/images/brand/logo.png" alt="RS CAB" width={140} height={42} className="object-contain max-h-12" />
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10">
            <div className="hidden lg:flex justify-center mb-8">
              <Image src="/images/brand/logo.png" alt="RS CAB" width={100} height={30} className="object-contain" />
            </div>

            {/* Corporate badge */}
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary bg-secondary/[0.08] px-3 py-1.5 rounded-full">
                <Building2 className="w-3.5 h-3.5" /> Corporate Portal
              </span>
            </div>

            <h2 className="text-3xl font-bold text-white text-center mb-2">Company Sign In</h2>
            <p className="text-white/35 text-center mb-8">Access your corporate account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-white/40 text-sm font-medium mb-2">Company Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                  <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-dark pl-12" />
                </div>
              </div>

              <div>
                <label className="block text-white/40 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-dark pl-12 pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link href="/forget-password" className="text-secondary text-sm font-medium hover:underline underline-offset-4">Forgot password?</Link>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : <><Building2 className="w-5 h-5" /> Sign In</>}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/[0.04]">
              <Link href="/company/dashboard" className="block w-full text-center py-2.5 rounded-lg bg-white/[0.03] text-white/40 text-xs font-medium hover:bg-white/[0.06] hover:text-white/60 transition-all border border-white/[0.04] mb-4">
                Skip to Company Dashboard â†’
              </Link>
              <p className="text-white/25 text-sm mb-2 text-center">Not a company account?</p>
              <div className="text-center">
                <Link href="/login" className="text-secondary text-sm font-semibold hover:underline underline-offset-4">â† Back to Rider Login</Link>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex justify-center gap-6">
            <div className="flex items-center gap-2 text-white/15 text-xs">
              <div className="w-2 h-2 rounded-full bg-secondary/40" />
              256-bit Encryption
            </div>
            <div className="flex items-center gap-2 text-white/15 text-xs">
              <div className="w-2 h-2 rounded-full bg-secondary/40" />
              GDPR Compliant
            </div>
          </div>
        </div>
      </div>

      {/* Right â€” Hero Image */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <Image src="/images/auth/business-district.jpg" alt="London business district" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#060B14]/60 to-[#060B14]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060B14] via-transparent to-[#060B14]/50" />

        <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
          <div className="flex justify-end">
            <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-secondary bg-secondary/[0.08] px-3 py-1.5 rounded-full">Enterprise Solutions</span>
          </div>

          <div className="mb-16">
            <h1 className="text-5xl font-black text-white leading-tight mb-4 tracking-[-0.02em]">
              Manage Your
              <br />
              <span className="text-white/25">Fleet & Team</span>
            </h1>
            <p className="text-white/40 text-lg max-w-md">
              Powerful tools for corporate transportation management. Track rides, manage employees, and optimize costs.
            </p>
          </div>

          {/* Stat cards */}
          <div className="absolute top-1/3 right-16 flex flex-col gap-4">
            {[
              { value: '156', label: 'Partner Companies', color: '#00E676' },
              { value: '23K', label: 'Business Rides', color: '#00B0FF' },
              { value: '99.8%', label: 'Uptime SLA', color: '#fff' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm p-5">
                <p className="font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
                <p className="text-white/40 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
