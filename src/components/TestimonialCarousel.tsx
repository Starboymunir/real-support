'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Business Traveller',
    text: 'RS CAB has transformed my airport commute. The driver was already waiting when I landed. Impeccable service, every single time.',
    rating: 5,
    image: '/images/testimonials/sarah.jpg',
  },
  {
    name: 'James Cooper',
    role: 'Daily Commuter',
    text: 'I switched from Uber to RS CAB six months ago. Fixed pricing, no surge â€” I save about Â£200 a month. The drivers are genuinely friendly.',
    rating: 5,
    image: '/images/testimonials/marcus.jpg',
  },
  {
    name: 'Priya Sharma',
    role: 'University Student',
    text: 'As a student, I need affordable rides at odd hours. RS CAB is reliable at 3am just like 3pm. The app tracking gives my parents peace of mind too.',
    rating: 5,
    image: '/images/testimonials/emily.jpg',
  },
  {
    name: 'Tom Williams',
    role: 'Corporate Manager',
    text: 'Our company switched all employee travel to RS CAB. The corporate dashboard is brilliant for tracking expenses and managing bookings.',
    rating: 5,
    image: '/images/testimonials/david.jpg',
  },
  {
    name: 'Emily Chen',
    role: 'Healthcare Worker',
    text: 'Working night shifts, I need a service I can trust at 4am. RS CAB drivers are professional, punctual, and make me feel completely safe.',
    rating: 5,
    image: '/images/testimonials/rachel.jpg',
  },
];

export default function TestimonialCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const t = testimonials[active];

  return (
    <div className="relative max-w-2xl mx-auto overflow-hidden">
      <div className="absolute -top-6 -left-4 text-secondary/10 hidden sm:block">
        <Quote size={80} />
      </div>

      <div className="relative card-premium !p-6 sm:!p-10 !rounded-3xl text-center">
        <div className="flex justify-center gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
          ))}
        </div>

        <p className="text-text-primary text-lg leading-relaxed font-medium mb-8 min-h-[60px]">
          &ldquo;{t.text}&rdquo;
        </p>

        <div className="flex items-center justify-center gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-secondary/20">
            <Image src={t.image} alt={t.name} fill className="object-cover" sizes="56px" />
          </div>
          <div className="text-left">
            <p className="font-bold text-text-primary">{t.name}</p>
            <p className="text-text-muted text-sm">{t.role}</p>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === active ? 'w-8 bg-secondary' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
