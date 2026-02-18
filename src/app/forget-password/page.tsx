"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen hero-dark dot-grid flex items-center justify-center relative overflow-hidden">
      {/* Floating decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/5 animate-morph blur-3xl pointer-events-none" />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 animate-morph blur-3xl pointer-events-none"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute top-1/2 left-2/3 w-64 h-64 bg-secondary/3 animate-morph blur-3xl pointer-events-none"
        style={{ animationDelay: "2s" }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-dark rounded-3xl p-8 sm:p-10 neon-border">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="https://www.real-support.co.uk/home/header%20logo.png"
              alt="RS CAB"
              width={120}
              height={36}
              className="object-contain"
            />
          </div>

          {/* Lock icon in glowing circle */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center glow-green animate-pulse-glow">
              <Lock className="w-9 h-9 text-secondary" />
            </div>
          </div>

          {!submitted ? (
            <>
              <h2 className="text-3xl font-bold text-white text-center mb-2">
                Forgot Password?
              </h2>
              <p className="text-white/40 text-center mb-8 text-sm leading-relaxed">
                No worries! Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-5"
              >
                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-dark pl-12"
                    required
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-4 bg-secondary text-dark font-bold rounded-xl text-lg hover:shadow-[0_8px_30px_rgba(0,230,118,0.35)] hover:-translate-y-0.5 transition-all"
                >
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Check Your Email
              </h2>
              <p className="text-white/40 text-center mb-6 text-sm leading-relaxed">
                We&apos;ve sent a password reset link to{" "}
                <span className="text-secondary font-medium">{email}</span>.
                Please check your inbox.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="w-full py-3 border border-white/10 text-white/60 font-medium rounded-xl hover:bg-white/5 transition-all text-sm"
              >
                Didn&apos;t receive? Resend
              </button>
            </>
          )}

          {/* Back to login */}
          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="text-white/40 text-sm hover:text-white/60 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
