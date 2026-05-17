'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Mail, ShieldCheck } from 'lucide-react';

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent('One App — Account deletion request');
    const body = encodeURIComponent(
      `I would like to delete my One App account and the personal data associated with it.\n\n` +
        `Account email: ${email}\n` +
        `Reason (optional): ${reason || '—'}\n\n` +
        `Please confirm deletion within 30 days.`,
    );
    window.location.href = `mailto:support@real-support.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a2540] px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white/[0.04] p-8 ring-1 ring-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
            <Trash2 size={20} />
          </div>
          <h1 className="text-2xl font-bold">Delete your One App account</h1>
        </div>

        <p className="mt-4 text-white/70">
          You can request deletion of your One App account and personal data here. You do not need to be signed
          in. Once we receive your request we will permanently remove your data within 30 days.
        </p>

        <div className="mt-6 rounded-xl bg-white/[0.03] p-5 text-sm text-white/70 ring-1 ring-white/5">
          <h2 className="flex items-center gap-2 font-semibold text-white">
            <ShieldCheck size={16} className="text-yellow-400" /> What will be deleted
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Your profile (name, email, phone, photo)</li>
            <li>Saved addresses, ride history visible in-app, and chat messages</li>
            <li>Saved payment methods and login credentials</li>
            <li>Driver documents and vehicle data (if you are a driver)</li>
          </ul>
          <h2 className="mt-4 font-semibold text-white">What we keep</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Ride and payment records that we are legally required to retain (UK tax & accounting law,
              typically 6 years).
            </li>
            <li>Anonymised analytics that cannot be linked back to you.</li>
          </ul>
        </div>

        {submitted ? (
          <div className="mt-8 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-emerald-200">
            <p className="font-semibold">Email opened</p>
            <p className="mt-1 text-sm">
              We&apos;ve opened your email client with a pre-filled deletion request. Please send it from the
              address registered on your One App account so we can verify ownership.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email address on your account
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-white">
                Reason (optional)
              </label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
                placeholder="Help us improve…"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              <Mail size={16} /> Send deletion request
            </button>
          </form>
        )}

        <div className="mt-8 border-t border-white/10 pt-6 text-sm text-white/60">
          <p>
            Prefer to delete from inside the app? Open One App and go to{' '}
            <strong className="text-white">Profile → Danger Zone → Delete Account</strong>.
          </p>
          <p className="mt-3">
            Need help? Contact{' '}
            <a className="text-yellow-400 underline" href="mailto:support@real-support.com">
              support@real-support.com
            </a>
            .
          </p>
          <p className="mt-3">
            <Link href="/privacy" className="text-yellow-400 underline">
              Privacy policy
            </Link>{' '}
            ·{' '}
            <Link href="/" className="text-yellow-400 underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
