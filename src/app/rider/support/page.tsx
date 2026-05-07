'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useRequireAuth } from '@/lib/use-require-auth';
import { supportTicketApi } from '@/lib/services/support-ticket';
import { chatApi } from '@/lib/services/chat';
import {
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MessageCircle,
  Send,
  FileText,
  CreditCard,
  Car,
  XCircle,
  Clock,
  Shield,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  FAQ data                                                           */
/* ------------------------------------------------------------------ */

const faqs = [
  {
    question: 'How do I book a ride?',
    answer:
      'Navigate to the "Book a Ride" page from your dashboard or sidebar. Enter your pickup and drop-off locations, select a vehicle type, choose your payment method, and confirm the booking. You\'ll receive a confirmation with driver details shortly.',
    icon: Car,
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'RS Ride accepts cash payments and all major credit/debit cards (Visa, Mastercard, Amex). You can save multiple cards in your Payment Methods page for quick checkout.',
    icon: CreditCard,
  },
  {
    question: 'How do I cancel a ride?',
    answer:
      'You can cancel an upcoming ride from the "My Rides" page by viewing the ride details and selecting "Cancel Ride". Free cancellation is available up to 5 minutes after booking or if the driver hasn\'t been assigned yet.',
    icon: XCircle,
  },
  {
    question: 'What is the cancellation policy?',
    answer:
      'Cancellations made within 5 minutes of booking are free. After that, a small cancellation fee of £3 may apply. If the driver is already en route, the fee may be higher based on the distance covered.',
    icon: FileText,
  },
  {
    question: 'How are fares calculated?',
    answer:
      'Fares consist of a base rate, per-mile distance charge, and per-minute time charge. During peak hours, surge pricing may apply. You can always see the estimated fare before confirming your booking.',
    icon: Clock,
  },
  {
    question: 'Is my payment information secure?',
    answer:
      'Absolutely. All payment information is encrypted with bank-level 256-bit SSL encryption. We are PCI-DSS compliant and never store your full card details on our servers.',
    icon: Shield,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SupportPage() {
  const { user } = useRequireAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const categoryMap: Record<string, string> = {
    booking: 'BOOKING',
    payment: 'PAYMENT',
    driver: 'DRIVER_ISSUE',
    app: 'APP_ISSUE',
    other: 'OTHER',
  };

  const handleSubmitTicket = useCallback(async () => {
    if (!user || !subject || !description) return;
    setSubmitStatus('loading');
    setSubmitError('');
    try {
      await supportTicketApi.create({
        subject,
        description,
        category: categoryMap[category] || 'OTHER',
      });
      setSubmitStatus('success');
      setSubject(''); setCategory(''); setDescription('');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit ticket');
      setSubmitStatus('error');
    }
  }, [user, subject, category, description]);

  const filteredFaqs = faqs.filter(
    (faq) =>
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const contactCards = [
    {
      icon: Mail,
      label: 'Email Us',
      value: 'support@real-support.com',
      desc: 'We typically respond within a few hours',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Phone,
      label: 'Call Us',
      value: '+44 20 7946 0958',
      desc: 'Mon–Fri 8 AM – 8 PM, Sat–Sun 9 AM – 5 PM',
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      icon: MessageCircle,
      label: 'Live Chat',
      value: 'Available 24/7',
      desc: 'Get instant help from our support agents',
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ];

  return (
    <DashboardLayout role="rider" pageTitle="Support">
      {/* ── Header & Search ─────────────────────────────────────── */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={32} className="text-secondary" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          How can we help?
        </h2>
        <p className="text-white/60 mb-6">
          Search our FAQ or get in touch with our dedicated support team.
        </p>
        <Input
          placeholder="Search for help..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-center"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ════════ Left Column (2/3) ════════════════════════════ */}
        <div className="lg:col-span-2 space-y-8">
          {/* ── FAQ Accordion ────────────────────────────────────── */}
          <div className="bg-white/[0.02] rounded-2xl p-6 sm:p-8 border border-white/[0.06] hover:bg-white/[0.04] transition-all">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <HelpCircle size={18} className="text-secondary" />
              </div>
              Frequently Asked Questions
            </h3>

            <div className="space-y-3">
              {filteredFaqs.length === 0 && (
                <div className="text-center py-8">
                  <Search size={32} className="text-white/40 mx-auto mb-3 opacity-40" />
                  <p className="text-white/40 text-sm">No results found for &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}

              {filteredFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                const Icon = faq.icon;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-all duration-200 ${
                      isOpen ? 'border-secondary/20 bg-secondary/[0.04]' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isOpen ? 'bg-secondary/10' : 'bg-white/[0.06]'
                        }`}
                      >
                        <Icon size={16} className={isOpen ? 'text-secondary' : 'text-white/40'} />
                      </div>
                      <span className="flex-1 text-sm font-semibold text-white">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={16} className="text-secondary shrink-0" />
                      ) : (
                        <ChevronDown size={16} className="text-white/40 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pl-16">
                        <p className="text-sm text-white/60 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Submit a Ticket ──────────────────────────────────── */}
          <div className="bg-white/[0.02] rounded-2xl p-6 sm:p-8 border border-white/[0.06] hover:bg-white/[0.04] transition-all">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Send size={18} className="text-secondary" />
              </div>
              Submit a Ticket
            </h3>

            <div className="space-y-5">
              <Input
                label="Subject"
                icon={FileText}
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="">Select a category</option>
                  <option value="booking">Booking Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="driver">Driver Complaint</option>
                  <option value="app">App Problem</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe your issue in detail..."
                  rows={5}
                  className="input-field resize-none"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium">
                  Ticket submitted successfully! We&apos;ll get back to you soon.
                </div>
              )}
              {submitStatus === 'error' && submitError && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">{submitError}</div>
              )}
              <Button variant="green" size="lg" onClick={handleSubmitTicket} disabled={submitStatus === 'loading' || !subject || !description}>
                <Send size={16} /> {submitStatus === 'loading' ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </div>
          </div>
        </div>

        {/* ════════ Right Column (1/3) ═══════════════════════════ */}
        <div className="space-y-6">
          {/* ── Contact Cards ────────────────────────────────────── */}
          {contactCards.map((c) => {
            const Icon = c.icon;
            const isLiveChat = c.label === 'Live Chat';
            return (
              <div
                key={c.label}
                onClick={isLiveChat ? async () => {
                  if (!user?.id || chatLoading) return;
                  setChatLoading(true);
                  try {
                    const chat = await chatApi.getOneOnOneAdmin();
                    const chatId = chat?.id;
                    router.push(chatId ? `/rider/chat?chatId=${chatId}` : '/rider/chat');
                  } catch {
                    router.push('/rider/chat');
                  } finally {
                    setChatLoading(false);
                  }
                } : undefined}
                className={`bg-white/[0.02] rounded-2xl p-6 border border-white/[0.06] hover:bg-white/[0.04] transition-all ${isLiveChat ? 'cursor-pointer hover:border-accent/30' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={c.color} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.label}</p>
                    <p className={`text-sm font-bold mt-0.5 ${c.color}`}>{c.value}</p>
                    <p className="text-xs text-white/40 mt-1 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── Response Time ────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-secondary/[0.12] via-dark-surface to-accent/[0.06] rounded-2xl p-6 text-white border border-secondary/20">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-4">
              <Clock size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold mb-1">Typical Response Time</h3>
            <p className="text-3xl font-extrabold gradient-text mt-2">Under 2 Hours</p>
            <p className="text-sm text-white/50 mt-2 leading-relaxed">
              Our support team aims to respond to all tickets within 2 hours during business hours.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
