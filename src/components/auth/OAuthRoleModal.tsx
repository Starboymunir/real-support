'use client';

import { useState } from 'react';
import { Car, User, X, Loader2 } from 'lucide-react';

const _raw = process.env.NEXT_PUBLIC_BACKEND_API ?? 'https://backend.real-support.com/api';
const API_BASE = _raw.endsWith('/api') ? _raw : `${_raw.replace(/\/$/, '')}/api`;

interface OAuthRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'google' | 'apple';
}

export default function OAuthRoleModal({ isOpen, onClose, provider }: OAuthRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<'DRIVER' | 'PASSENGER' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (!selectedRole) return;
    setIsLoading(true);
    window.location.href = `${API_BASE}/auth/${provider}?origin=${encodeURIComponent(window.location.origin)}&role=${selectedRole}`;
  };

  const providerName = provider === 'google' ? 'Google' : 'Apple';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="rounded-2xl p-6 w-full max-w-md border border-white/[0.06] shadow-2xl"
          style={{ background: '#0c1220' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Continue with {providerName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/40" />
            </button>
          </div>

          {/* Description */}
          <p className="text-white/40 mb-6">
            How would you like to use RS CAB?
          </p>

          {/* Role Selection */}
          <div className="space-y-3 mb-6">
            {/* Rider Option */}
            <button
              onClick={() => setSelectedRole('PASSENGER')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                selectedRole === 'PASSENGER'
                  ? 'border-secondary bg-secondary/10'
                  : 'border-white/[0.06] hover:border-white/20 bg-white/[0.02]'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedRole === 'PASSENGER' ? 'bg-secondary/20' : 'bg-white/[0.04]'
              }`}>
                <User className={`w-6 h-6 ${selectedRole === 'PASSENGER' ? 'text-secondary' : 'text-white/40'}`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${selectedRole === 'PASSENGER' ? 'text-secondary' : 'text-white'}`}>
                  I&apos;m a Rider
                </h3>
                <p className="text-sm text-white/40">
                  I want to book rides and travel
                </p>
              </div>
              {selectedRole === 'PASSENGER' && (
                <svg className="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              )}
            </button>

            {/* Driver Option */}
            <button
              onClick={() => setSelectedRole('DRIVER')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                selectedRole === 'DRIVER'
                  ? 'border-secondary bg-secondary/10'
                  : 'border-white/[0.06] hover:border-white/20 bg-white/[0.02]'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedRole === 'DRIVER' ? 'bg-secondary/20' : 'bg-white/[0.04]'
              }`}>
                <Car className={`w-6 h-6 ${selectedRole === 'DRIVER' ? 'text-secondary' : 'text-white/40'}`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${selectedRole === 'DRIVER' ? 'text-secondary' : 'text-white'}`}>
                  I&apos;m a Driver
                </h3>
                <p className="text-sm text-white/40">
                  I want to offer rides and earn
                </p>
              </div>
              {selectedRole === 'DRIVER' && (
                <svg className="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              )}
            </button>
          </div>

          {/* Note for existing users */}
          <p className="text-xs text-white/30 mb-6 text-center">
            Already have an account? We&apos;ll sign you in with your existing role.
          </p>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              selectedRole && !isLoading
                ? 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.12)]'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Continue with {providerName}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
