"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Building2 } from "lucide-react";

export default function CompanyLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen hero-dark line-grid flex">
      {/* Left — Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 -left-10 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-morph pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-morph pointer-events-none" style={{ animationDelay: "4s" }} />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-10 mt-6">
            <Image
              src="https://www.real-support.co.uk/home/header%20logo.png"
              alt="RS CAB"
              width={140}
              height={42}
              className="object-contain max-h-12"
            />
          </div>

          {/* Form card */}
          <div className="glass-dark rounded-3xl p-8 sm:p-10 neon-border">
            {/* Desktop logo */}
            <div className="hidden lg:flex justify-center mb-8">
              <Image
                src="https://www.real-support.co.uk/home/header%20logo.png"
                alt="RS CAB"
                width={100}
                height={30}
                className="object-contain"
              />
            </div>

            {/* Corporate badge */}
            <div className="flex justify-center mb-6">
              <span className="badge-green">
                <Building2 className="w-3.5 h-3.5" />
                Corporate Portal
              </span>
            </div>

            <h2 className="text-3xl font-bold text-white text-center mb-2">
              Company Sign In
            </h2>
            <p className="text-white/40 text-center mb-8">
              Access your corporate account
            </p>

            {/* Form */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              {/* Company Email */}
              <div>
                <label className="block text-white/50 text-sm font-medium mb-2">Company Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-dark pl-12"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-white/50 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-dark pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <Link
                  href="/forget-password"
                  className="text-secondary text-sm font-medium hover:text-secondary-light transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary w-full text-center flex items-center justify-center gap-2 py-4 text-lg"
              >
                <Building2 className="w-5 h-5" />
                Sign In
              </button>
            </form>

            {/* Rider login link */}
            <div className="mt-6 pt-6 border-t border-white/5">
              <Link
                href="/company/dashboard"
                className="block w-full text-center py-2.5 px-3 rounded-lg bg-white/[0.04] text-white/50 text-xs font-medium hover:bg-secondary/10 hover:text-secondary transition-all border border-white/5 mb-4"
              >
                Skip to Company Dashboard →
              </Link>
              <p className="text-white/30 text-sm mb-2 text-center">Not a company account?</p>
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-secondary text-sm font-semibold hover:text-secondary-light transition-colors inline-flex items-center gap-1"
                >
                  ← Back to Rider Login
                </Link>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex justify-center gap-6">
            <div className="flex items-center gap-2 text-white/20 text-xs">
              <div className="w-2 h-2 rounded-full bg-secondary/60" />
              256-bit Encryption
            </div>
            <div className="flex items-center gap-2 text-white/20 text-xs">
              <div className="w-2 h-2 rounded-full bg-secondary/60" />
              GDPR Compliant
            </div>
          </div>
        </div>
      </div>

      {/* Right — Hero Image (hidden on mobile) */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=1600&fit=crop"
          alt="London business district"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#060B14]/60 to-[#060B14] z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060B14] via-transparent to-[#060B14]/50 z-10" />

        {/* Content on image */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-12">
          {/* Top right decorative */}
          <div className="flex justify-end">
            <span className="badge-green">Enterprise Solutions</span>
          </div>

          {/* Tagline */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
              Manage Your<br />
              <span className="gradient-text">Fleet & Team</span>
            </h1>
            <p className="text-white/50 text-lg max-w-md">
              Powerful tools for corporate transportation management. Track rides, manage employees, and optimize costs.
            </p>
          </div>

          {/* Floating stat cards */}
          <div className="absolute top-1/3 right-16 flex flex-col gap-4 z-30">
            <div className="glass-dark rounded-2xl p-5 animate-float glow-green">
              <p className="text-secondary font-bold text-2xl">156</p>
              <p className="text-white/50 text-sm">Partner Companies</p>
            </div>
            <div
              className="glass-dark rounded-2xl p-5 animate-float"
              style={{ animationDelay: "1.5s" }}
            >
              <p className="text-accent font-bold text-2xl">23K</p>
              <p className="text-white/50 text-sm">Business Rides</p>
            </div>
            <div
              className="glass-dark rounded-2xl p-5 animate-float"
              style={{ animationDelay: "3s" }}
            >
              <p className="text-white font-bold text-2xl">99.8%</p>
              <p className="text-white/50 text-sm">Uptime SLA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
