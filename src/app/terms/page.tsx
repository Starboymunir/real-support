'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="hero-dark min-h-screen relative">
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-secondary/[0.04] rounded-full blur-[140px] pointer-events-none" />
        <div className="mx-auto max-w-3xl px-5 sm:px-8 pt-36 pb-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="pill mb-6 inline-block">Legal</span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-8">Terms of Service</h1>
            <p className="text-white/40 text-sm mb-12">Last updated: January 1, 2026</p>
          </motion.div>

          <div className="glass-dark rounded-2xl p-8 sm:p-10">
            <div className="space-y-10 text-white/60 text-sm leading-relaxed">
              <RevealSection delay={0}>
                <section className="border-l-2 border-white/[0.06] pl-6 hover:border-secondary/40 transition-colors">
                  <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                  <p>By accessing or using the RS CAB platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. RS CAB is operated by Professional Service Support Ltd.</p>
                </section>
              </RevealSection>

              <RevealSection delay={0.05}>
                <section className="border-l-2 border-white/[0.06] pl-6 hover:border-secondary/40 transition-colors">
                  <h2 className="text-xl font-bold text-white mb-4">2. Service Description</h2>
                  <p>RS CAB provides a technology platform connecting riders with licensed private hire drivers. We are a ride-sharing marketplace and do not provide transportation services directly. All drivers are independent contractors.</p>
                </section>
              </RevealSection>

              <RevealSection delay={0.1}>
                <section className="border-l-2 border-white/[0.06] pl-6 hover:border-secondary/40 transition-colors">
                  <h2 className="text-xl font-bold text-white mb-4">3. User Accounts</h2>
                  <p>You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and all activities under your account. Notify us immediately of any unauthorised access.</p>
                </section>
              </RevealSection>

              <RevealSection delay={0.15}>
                <section className="border-l-2 border-white/[0.06] pl-6 hover:border-secondary/40 transition-colors">
                  <h2 className="text-xl font-bold text-white mb-4">4. Rides & Payments</h2>
                  <p>Fares are calculated based on distance, time, and demand. You agree to pay the fare displayed at booking confirmation. Additional charges may apply for waiting time, tolls, or cleaning fees. Payments are processed securely through our platform.</p>
                </section>
              </RevealSection>

              <RevealSection delay={0.2}>
                <section className="border-l-2 border-white/[0.06] pl-6 hover:border-secondary/40 transition-colors">
                  <h2 className="text-xl font-bold text-white mb-4">5. Cancellation Policy</h2>
                  <p>You may cancel a ride free of charge within 2 minutes of booking. After this period, a cancellation fee may apply. Repeated cancellations may result in account restrictions.</p>
                </section>
              </RevealSection>

              <RevealSection delay={0.25}>
                <section className="border-l-2 border-white/[0.06] pl-6 hover:border-secondary/40 transition-colors">
                  <h2 className="text-xl font-bold text-white mb-4">6. User Conduct</h2>
                  <p>Users must treat drivers with respect, refrain from illegal activities during rides, and comply with applicable laws. RS CAB reserves the right to suspend or terminate accounts that violate these terms.</p>
                </section>
              </RevealSection>

              <RevealSection delay={0.3}>
                <section className="border-l-2 border-white/[0.06] pl-6 hover:border-secondary/40 transition-colors">
                  <h2 className="text-xl font-bold text-white mb-4">7. Driver Requirements</h2>
                  <p>All drivers must hold a valid private hire licence, pass background checks, maintain proper vehicle insurance, and meet our vehicle standards. Drivers are responsible for their own tax obligations as independent contractors.</p>
                </section>
              </RevealSection>

              <RevealSection delay={0.35}>
                <section className="border-l-2 border-white/[0.06] pl-6 hover:border-secondary/40 transition-colors">
                  <h2 className="text-xl font-bold text-white mb-4">8. Limitation of Liability</h2>
                  <p>RS CAB provides the platform &quot;as is&quot; and does not guarantee uninterrupted service. Our liability is limited to the fare paid for the relevant ride. We are not liable for indirect or consequential damages.</p>
                </section>
              </RevealSection>

              <RevealSection delay={0.4}>
                <section className="border-l-2 border-white/[0.06] pl-6 hover:border-secondary/40 transition-colors">
                  <h2 className="text-xl font-bold text-white mb-4">9. Changes to Terms</h2>
                  <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the revised terms. Material changes will be communicated via email or in-app notification.</p>
                </section>
              </RevealSection>

              <RevealSection delay={0.45}>
                <section className="border-l-2 border-white/[0.06] pl-6 hover:border-secondary/40 transition-colors">
                  <h2 className="text-xl font-bold text-white mb-4">10. Contact</h2>
                  <p>For questions about these terms, contact us at legal@real-support.co.uk or write to: Professional Service Support Ltd, London, United Kingdom.</p>
                </section>
              </RevealSection>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
