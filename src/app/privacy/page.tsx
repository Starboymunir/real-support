import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy — RS CAB",
  description: "RS CAB privacy policy. How we collect, use, and protect your personal data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="hero-dark min-h-screen">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 pt-36 pb-24">
          <span className="badge-green mb-6 inline-block">Legal</span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-8">Privacy Policy</h1>
          <p className="text-white/40 text-sm mb-12">Last updated: January 1, 2026</p>

          <div className="space-y-10 text-white/60 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">1. Information We Collect</h2>
              <p>We collect information you provide directly including your name, email address, phone number, payment details, and location data when using our ride services. We also collect device information and usage data to improve our platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">2. How We Use Your Information</h2>
              <p>Your information is used to provide and improve our ride-sharing services, process payments, communicate service updates, ensure safety and security, and comply with legal obligations. We never sell your personal data to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">3. Data Sharing</h2>
              <p>We share limited data with drivers to facilitate rides (pickup/drop-off locations), payment processors to handle transactions, and law enforcement when legally required. All third-party partners are bound by data protection agreements.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">4. Data Security</h2>
              <p>We implement industry-standard 256-bit encryption for all data in transit and at rest. Access to personal data is restricted to authorised personnel only. Regular security audits are conducted to maintain the highest protection standards.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">5. Your Rights</h2>
              <p>Under GDPR, you have the right to access, correct, delete, or export your personal data. You can also object to processing or restrict how your data is used. Contact us at privacy@real-support.co.uk to exercise these rights.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">6. Cookies</h2>
              <p>We use essential cookies to operate the platform and analytics cookies to understand usage patterns. You can manage cookie preferences through your browser settings.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">7. Contact Us</h2>
              <p>For privacy-related queries, contact our Data Protection Officer at privacy@real-support.co.uk or write to: Professional Service Support Ltd, London, United Kingdom.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
