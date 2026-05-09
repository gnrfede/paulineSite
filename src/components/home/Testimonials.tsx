"use client";

import { useState, useEffect } from "react";

const testimonials = [
  {
    quote: "Paula tiene manos mágicas. Después de tres sesiones mi piel cambió completamente. La atención personalizada hace toda la diferencia.",
    author: "Valentina M.",
  },
  {
    quote: "Por fin encontré una profesional que realmente escucha y diseña el tratamiento para mi tipo de piel. Los resultados son increíbles.",
    author: "Sofía R.",
  },
  {
    quote: "El studio es un espacio de cuidado real. Paula es detallista, profesional y muy dedicada. Lo recomiendo al 100%.",
    author: "Luciana B.",
  },
  {
    quote: "13 años de experiencia se notan en cada tratamiento. Mi piel nunca estuvo tan saludable y luminosa.",
    author: "Camila F.",
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [current]);

  function goTo(idx: number) {
    if (animating || idx === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 250);
  }

  return (
    <section className="py-24 bg-teal-50">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="section-label justify-center mb-6">Lo que dicen</p>

        {/* Stars */}
        <div className="flex justify-center gap-1 mb-8">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-4 h-4 text-teal-400 fill-teal-400" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>

        <div
          className="transition-opacity duration-250"
          style={{ opacity: animating ? 0 : 1 }}
        >
          <blockquote className="font-serif text-2xl md:text-3xl font-normal italic text-gray-700 leading-relaxed mb-6">
            &ldquo;{testimonials[current].quote}&rdquo;
          </blockquote>
          <cite className="font-sans text-xs tracking-[0.22em] uppercase text-teal-500 not-italic">
            — {testimonials[current].author}
          </cite>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Testimonio ${i + 1}`}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? "w-6 h-2 bg-teal-400"
                  : "w-2 h-2 bg-teal-200 hover:bg-teal-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
