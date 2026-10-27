"use client";

/* eslint-disable @next/next/no-img-element -- gambar slide disajikan dari /uploads */
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";

export type Slide = {
  id: number;
  eyebrow: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  primaryLabel: string | null;
  primaryUrl: string | null;
  secondaryLabel: string | null;
  secondaryUrl: string | null;
};

const INTERVAL_MS = 6000;

/** "Rayakan dengan *Aqiqah Penuh Berkah*" → bagian di antara bintang jadi emas miring. */
function Title({ text, first }: { text: string; first: boolean }) {
  const parts = text.split(/\*([^*]+)\*/g).map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part));
  return first ? <h1>{parts}</h1> : <h2 className="hero-title">{parts}</h2>;
}

function SlideLink({ href, label, primary }: { href: string | null; label: string | null; primary: boolean }) {
  if (!href || !label) return null;
  const className = `btn ${primary ? "btn-gold" : "btn-line"}`;
  return /^https?:\/\//.test(href) ? (
    <a className={className} href={href} target="_blank" rel="noopener">
      {label}
    </a>
  ) : (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}

export function HeroSlider({ slides, decor }: { slides: Slide[]; decor: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  const current = slides[index];

  return (
    <header
      className={`hero${current?.imageUrl ? " has-image" : ""}`}
      aria-roledescription="carousel"
      aria-label="Sorotan Utsmani Aqiqah"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map((s, i) =>
        s.imageUrl ? (
          <div key={s.id} className={`hero-bg${i === index ? " is-active" : ""}`} aria-hidden="true">
            <img src={s.imageUrl} alt="" loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "low"} />
          </div>
        ) : null,
      )}
      {decor}

      <div className="container">
        <div className="hero-slides">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`hero-content${i === index ? " is-active" : ""}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} dari ${count}`}
              aria-hidden={i !== index}
              inert={i !== index}
            >
              {s.eyebrow && <span className="eyebrow">☾ {s.eyebrow}</span>}
              <Title text={s.title} first={i === 0} />
              {s.subtitle && <p>{s.subtitle}</p>}
              <div className="actions">
                <SlideLink href={s.primaryUrl} label={s.primaryLabel} primary />
                <SlideLink href={s.secondaryUrl} label={s.secondaryLabel} primary={false} />
              </div>
            </div>
          ))}
        </div>

        {count > 1 && (
          <div className="hero-controls">
            <button type="button" className="hero-arrow" onClick={() => go(index - 1)} aria-label="Slide sebelumnya">
              ‹
            </button>
            <div className="hero-dots">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={i === index ? "is-active" : undefined}
                  onClick={() => go(i)}
                  aria-label={`Tampilkan slide ${i + 1}`}
                  aria-current={i === index}
                />
              ))}
            </div>
            <button type="button" className="hero-arrow" onClick={() => go(index + 1)} aria-label="Slide berikutnya">
              ›
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
