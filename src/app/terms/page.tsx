import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const sections = [
  { title: '1. Acceptance of Terms', body: 'By accessing or using the RS CAB platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. RS CAB is operated by Professional Service Support Ltd.' },
  { title: '2. Service Description', body: 'RS CAB provides a technology platform connecting riders with licensed private hire drivers. We are a ride-sharing marketplace and do not provide transportation services directly. All drivers are independent contractors.' },
  { title: '3. User Accounts', body: 'You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and all activities under your account. Notify us immediately of any unauthorised access.' },
  { title: '4. Rides & Payments', body: 'Fares are calculated based on distance, time, and demand. You agree to pay the fare displayed at booking confirmation. Additional charges may apply for waiting time, tolls, or cleaning fees. Payments are processed securely through our platform.' },
  { title: '5. Cancellation Policy', body: 'You may cancel a ride free of charge within 2 minutes of booking. After this period, a cancellation fee may apply. Repeated cancellations may result in account restrictions.' },
  { title: '6. User Conduct', body: 'Users must treat drivers with respect, refrain from illegal activities during rides, and comply with applicable laws. RS CAB reserves the right to suspend or terminate accounts that violate these terms.' },
  { title: '7. Driver Requirements', body: 'All drivers must hold a valid private hire licence, pass background checks, maintain proper vehicle insurance, and meet our vehicle standards. Drivers are responsible for their own tax obligations as independent contractors.' },
  { title: '8. Limitation of Liability', body: 'RS CAB provides the platform "as is" and does not guarantee uninterrupted service. Our liability is limited to the fare paid for the relevant ride. We are not liable for indirect or consequential damages.' },
  { title: '9. Changes to Terms', body: 'We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the revised terms. Material changes will be communicated via email or in-app notification.' },
  { title: '10. Contact', body: 'For questions about these terms, contact us at legal@real-support.co.uk or write to: Professional Service Support Ltd, London, United Kingdom.' },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #000 0%, #060B14 30%, #0A1628 100%)' }}>
        <div className="mx-auto max-w-3xl px-6 sm:px-8 pt-36 pb-24">
          <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-4">Legal</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.02em] mb-3">Terms of Service</h1>
          <p className="text-white/30 text-sm mb-12">Last updated: January 1, 2026</p>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10">
            <div className="space-y-10 text-white/45 text-sm leading-relaxed">
              {sections.map((s) => (
                <section key={s.title} className="border-l-2 border-white/[0.06] pl-6 hover:border-secondary/30 transition-colors">
                  <h2 className="text-lg font-bold text-white mb-3">{s.title}</h2>
                  <p>{s.body}</p>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
