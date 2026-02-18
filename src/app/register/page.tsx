'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '',
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen flex" style={{ background: '#060B14' }}>
      {/* Left â€” Register Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-secondary/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-lg relative z-10">
          <div className="lg:hidden flex justify-center mb-8 mt-6">
            <Image src="/images/brand/logo.png" alt="RS CAB" width={140} height={42} className="object-contain max-h-12" />
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10">
            <div className="hidden lg:flex justify-center mb-6">
              <Image src="/images/brand/logo.png" alt="RS CAB" width={100} height={30} className="object-contain" />
            </div>

            <h2 className="text-3xl font-bold text-white text-center mb-2">Create Account</h2>
            <p className="text-white/35 text-center mb-7">Join the premium ride experience</p>

            {/* Social signup */}
            <div className="flex gap-3 mb-5">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1877F2] text-white font-semibold text-sm hover:bg-[#166FE5] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-white/25 text-sm">OR</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                  <input type="text" placeholder="First Name" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="input-dark pl-12" />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                  <input type="text" placeholder="Last Name" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="input-dark pl-12" />
                </div>
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                <span className="absolute left-12 top-1/2 -translate-y-1/2 text-xs text-white/30 font-medium bg-white/[0.06] px-2 py-0.5 rounded">+44</span>
                <input type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-dark pl-24" />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                <input type="email" placeholder="Email address" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-dark pl-12" />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={(e) => update('password', e.target.value)} className="input-dark pl-12 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm Password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} className="input-dark pl-12 pr-12" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only peer" />
                  <div className="w-5 h-5 rounded-md border-2 border-white/15 peer-checked:border-secondary peer-checked:bg-secondary transition-all flex items-center justify-center">
                    {agreed && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-white/35 text-sm leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-secondary hover:underline underline-offset-4">Terms of Service</Link>{' '}and{' '}
                  <Link href="/privacy" className="text-secondary hover:underline underline-offset-4">Privacy Policy</Link>
                </span>
              </label>

              <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all">
                Create Account
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/rider/dashboard" className="text-white/20 text-xs hover:text-white/40 transition-colors">Skip to Rider Dashboard â†’</Link>
            </div>

            <p className="text-center text-white/35 mt-6 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-secondary font-semibold hover:underline underline-offset-4">Sign In</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right â€” Hero Image */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <Image src="/images/auth/mountain.jpg" alt="Mountain landscape" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-l from-[#060B14] via-[#060B14]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060B14] via-transparent to-[#060B14]/40" />

        <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
          <div className="flex justify-end">
            <Image src="/images/brand/logo.png" alt="RS CAB" width={140} height={42} className="object-contain" />
          </div>

          <div className="mb-16 text-right">
            <h1 className="text-5xl font-black text-white leading-tight mb-4 tracking-[-0.02em]">
              Start Your
              <br />
              <span className="text-white/25">Journey Today</span>
            </h1>
            <p className="text-white/40 text-lg max-w-md ml-auto">
              Join thousands of riders who trust RS CAB for safe, reliable, and premium transportation.
            </p>
          </div>

          {/* Stat cards */}
          <div className="absolute top-1/3 left-12 flex flex-col gap-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm p-5">
              <p className="text-secondary font-bold text-2xl">50K+</p>
              <p className="text-white/40 text-sm">Happy Riders</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm p-5">
              <p className="text-[#00B0FF] font-bold text-2xl">200+</p>
              <p className="text-white/40 text-sm">Professional Drivers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
