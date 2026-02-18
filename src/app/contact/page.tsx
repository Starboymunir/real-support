"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  ArrowRight,
  HelpCircle,
  Headphones,
  Building2,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const contactCards = [
  {
    icon: MapPin,
    label: "Head Office",
    value: "71-75 Shelton Street, Covent Garden, London WC2H 9JQ",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+44 20 7946 0958",
    href: "tel:+442079460958",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@rscab.co.uk",
    href: "mailto:support@rscab.co.uk",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "Mon – Sun, 24 / 7",
    gradient: "from-amber-500 to-orange-600",
  },
];

const supportLinks = [
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Answers to common questions about rides, payments, and more.",
    href: "/rider/support",
  },
  {
    icon: Headphones,
    title: "Driver Support",
    description: "Resources and help for RS CAB drivers.",
    href: "/driver",
  },
  {
    icon: Building2,
    title: "Company Portal",
    description: "Manage corporate accounts and bookings.",
    href: "/company/company-login",
  },
];

const subjects = [
  "General Inquiry",
  "Ride Issue",
  "Driver Application",
  "Corporate Partnership",
  "Press & Media",
  "Other",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Simulate submission
    setSubmitted(true);
  }

  return (
    <>
      <Navbar />

      {/* ═══════ HERO ═══════ */}
      <section className="hero-dark relative overflow-hidden">
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-secondary/[0.06] rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/[0.04] rounded-full blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-36 pb-24 lg:pt-44 lg:pb-28 text-center">
          <span className="badge-green mb-6 inline-block">Get In Touch</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
            We&apos;d love to{" "}
            <span className="gradient-text">hear from you.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            Whether it&apos;s a question, feedback, or partnership opportunity —
            our team is here to help.
          </p>
        </div>
      </section>

      {/* ═══════ CONTACT FORM + INFO ═══════ */}
      <section className="bg-light py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* ── Form (3 cols) ── */}
            <div className="lg:col-span-3">
              <div className="card-premium">
                {submitted ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10 mb-6">
                      <CheckCircle2
                        className="text-secondary"
                        size={40}
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary">
                      Message Sent!
                    </h3>
                    <p className="mt-3 text-text-secondary max-w-md mx-auto">
                      Thank you for reaching out. Our team will get back to you
                      within 24 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          subject: "",
                          message: "",
                        });
                      }}
                      className="btn-outline-green mt-8 inline-flex items-center gap-2"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-text-primary mb-1">
                      Send us a message
                    </h2>
                    <p className="text-text-secondary text-sm mb-8">
                      Fill in the form below and we&apos;ll respond as soon as
                      possible.
                    </p>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1.5">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1.5">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="john@example.com"
                            className="input-field"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1.5">
                            Phone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+44 7700 900000"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1.5">
                            Subject
                          </label>
                          <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="input-field"
                          >
                            <option value="" disabled>
                              Select a subject
                            </option>
                            {subjects.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                          Message
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          placeholder="Tell us how we can help..."
                          className="input-field resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn-green w-full sm:w-auto inline-flex items-center justify-center gap-2"
                      >
                        <Send size={18} />
                        Send Message
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* ── Contact Info (2 cols) ── */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {contactCards.map((c) => (
                <div
                  key={c.label}
                  className="card-premium flex items-start gap-4 border-l-4 border-l-secondary/60 hover:border-l-secondary transition-colors"
                >
                  <div
                    className={`shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} shadow-lg`}
                  >
                    <c.icon className="text-white" size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      {c.label}
                    </p>
                    {c.href ? (
                      <a
                        href={c.href}
                        className="text-text-primary font-semibold hover:text-secondary-dark transition-colors"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <p className="text-text-primary font-semibold text-sm leading-relaxed">
                        {c.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FIND US ═══════ */}
      <section className="hero-dark relative py-24 lg:py-32 overflow-hidden">
        <div className="line-grid absolute inset-0 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-12">
            <span className="badge-green mb-4 inline-block">Find Us</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Visit our{" "}
              <span className="gradient-text">headquarters.</span>
            </h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden max-w-5xl mx-auto shadow-2xl shadow-black/30">
            <Image
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=400&fit=crop"
              alt="Map view of RS CAB HQ location"
              width={1200}
              height={400}
              className="w-full h-[340px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/30 to-transparent" />
            {/* Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shadow-lg animate-pulse-glow">
                <MapPin className="text-dark" size={20} />
              </div>
              <div className="w-0.5 h-6 bg-secondary/50" />
            </div>
            {/* Address overlay */}
            <div className="absolute bottom-6 left-6 right-6 sm:left-8">
              <p className="text-white font-bold text-lg">RS CAB HQ</p>
              <p className="text-white/50 text-sm">
                71-75 Shelton Street, Covent Garden, London WC2H 9JQ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SUPPORT LINKS ═══════ */}
      <section className="bg-light py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-14">
            <span className="badge-green mb-4 inline-block">
              Quick Links
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary leading-[1.15]">
              Need something else?
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 stagger-children">
            {supportLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="card-premium group flex items-start gap-4"
              >
                <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <item.icon className="text-secondary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary group-hover:text-secondary-dark transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-text-secondary text-sm leading-relaxed">
                    {item.description}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-secondary-dark">
                    Visit <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
