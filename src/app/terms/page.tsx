import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service — RS CAB",
  description: "RS CAB terms of service. Rules and regulations for using our ride-sharing platform.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="hero-dark min-h-screen">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 pt-36 pb-24">
          <span className="badge-green mb-6 inline-block">Legal</span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-8">Terms of Service</h1>
          <p className="text-white/40 text-sm mb-12">Last updated: January 1, 2026</p>

          <div className="space-y-10 text-white/60 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p>By accessing or using the RS CAB platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. RS CAB is operated by Professional Service Support Ltd.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">2. Service Description</h2>
              <p>RS CAB provides a technology platform connecting riders with licensed private hire drivers. We are a ride-sharing marketplace and do not provide transportation services directly. All drivers are independent contractors.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">3. User Accounts</h2>
              <p>You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and all activities under your account. Notify us immediately of any unauthorised access.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">4. Rides & Payments</h2>
              <p>Fares are calculated based on distance, time, and demand. You agree to pay the fare displayed at booking confirmation. Additional charges may apply for waiting time, tolls, or cleaning fees. Payments are processed securely through our platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">5. Cancellation Policy</h2>
              <p>You may cancel a ride free of charge within 2 minutes of booking. After this period, a cancellation fee may apply. Repeated cancellations may result in account restrictions.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">6. User Conduct</h2>
              <p>Users must treat drivers with respect, refrain from illegal activities during rides, and comply with applicable laws. RS CAB reserves the right to suspend or terminate accounts that violate these terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">7. Driver Requirements</h2>
              <p>All drivers must hold a valid private hire licence, pass background checks, maintain proper vehicle insurance, and meet our vehicle standards. Drivers are responsible for their own tax obligations as independent contractors.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">8. Limitation of Liability</h2>
              <p>RS CAB provides the platform &quot;as is&quot; and does not guarantee uninterrupted service. Our liability is limited to the fare paid for the relevant ride. We are not liable for indirect or consequential damages.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">9. Changes to Terms</h2>
              <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the revised terms. Material changes will be communicated via email or in-app notification.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">10. Contact</h2>
              <p>For questions about these terms, contact us at legal@real-support.co.uk or write to: Professional Service Support Ltd, London, United Kingdom.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
