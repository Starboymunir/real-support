'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen hero-dark dot-grid flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-7xl font-black gradient-text mb-4">Oops!</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
        <p className="text-white/40 mb-8 max-w-md mx-auto">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 bg-secondary text-dark font-bold px-6 sm:px-8 py-3.5 rounded-xl hover:shadow-[0_8px_30px_rgba(0,230,118,0.35)] hover:-translate-y-0.5 transition-all"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-white/20 text-white font-bold px-6 sm:px-8 py-3.5 rounded-xl hover:bg-white/5 transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
