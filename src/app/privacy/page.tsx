import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const sections = [
  { title: '1. Information We Collect', body: 'We collect information you provide directly including your name, email address, phone number, payment details, and location data when using our ride services. We also collect device information and usage data to improve our platform.' },
  { title: '2. How We Use Your Information', body: 'Your information is used to provide and improve our ride-sharing services, process payments, communicate service updates, ensure safety and security, and comply with legal obligations. We never sell your personal data to third parties.' },
  { title: '3. Data Sharing', body: 'We share limited data with drivers to facilitate rides (pickup/drop-off locations), payment processors to handle transactions, and law enforcement when legally required. All third-party partners are bound by data protection agreements.' },
  { title: '4. Data Security', body: 'We implement industry-standard 256-bit encryption for all data in transit and at rest. Access to personal data is restricted to authorised personnel only. Regular security audits are conducted to maintain the highest protection standards.' },
  { title: '5. Your Rights', body: 'Under GDPR, you have the right to access, correct, delete, or export your personal data. You can also object to processing or restrict how your data is used. Contact us at privacy@real-support.co.uk to exercise these rights.' },
  { title: '6. Cookies', body: 'We use essential cookies to operate the platform and analytics cookies to understand usage patterns. You can manage cookie preferences through your browser settings.' },
  { title: '7. Contact Us', body: 'For privacy-related queries, contact our Data Protection Officer at privacy@real-support.co.uk or write to: Professional Service Support Ltd, London, United Kingdom.' },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #000 0%, #060B14 30%, #0A1628 100%)' }}>
        <div className="mx-auto max-w-3xl px-6 sm:px-8 pt-36 pb-24">
          <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-4">Legal</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.02em] mb-3">Privacy Policy</h1>
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
