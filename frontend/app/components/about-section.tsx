'use client';

import { useEffect, useRef } from "react";
import { AlertCircle, Zap, CheckCircle } from "lucide-react";

import { gsap, ScrollTrigger } from "@/app/lib/gsap";


// ── Card data ─────────────────────────────────────────────────────────────────

const CARDS = [
  {
    Icon: AlertCircle,
    title: "The Problem",
    description:
      "Most resumes fail before a human ever reads them. ATS filters reject qualified candidates daily.",
  },
  {
    Icon: Zap,
    title: "Our Approach",
    description:
      "We use large language models to understand job descriptions the same way a recruiter does — then rewrite your resume to match.",
  },
  {
    Icon: CheckCircle,
    title: "The Result",
    description:
      "Resumes that pass filters, impress recruiters, and accurately reflect your actual skills.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left column entrance
      gsap.fromTo(
        ".about-left",
        { opacity: 0, y: 32, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-left",
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Right column cards — stagger 0.12
      gsap.fromTo(
        ".about-card",
        { opacity: 0, y: 32, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ".about-cards",
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        backgroundColor: "var(--bg-base)",
        padding: "120px max(24px, 10%)",
      }}
    >
      <div
        className="grid grid-cols-1 lg:grid-cols-5 items-start"
        style={{ gap: "80px", maxWidth: "1040px", margin: "0 auto" }}
      >
        {/* ── LEFT — sticky heading (40%) ────────────────────────────────── */}
        <div
          className="about-left lg:col-span-2 lg:sticky"
          style={{ top: "96px", alignSelf: "flex-start" }}
        >
          <span
            className="block text-xs font-medium uppercase tracking-widest mb-6"
            style={{ color: "var(--text-muted)" }}
          >
            About
          </span>

          <h2
            style={{
              fontWeight: 300,
              fontSize: "clamp(2rem, 3vw, 3rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.18,
              color: "var(--text-primary)",
              marginBottom: "1.25rem",
            }}
          >
            Built differently,
            <br />
            on purpose.
          </h2>

          <p
            style={{
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              fontSize: "1rem",
            }}
          >
            Resumence was built because the job application process is broken.
            We&apos;re fixing the one part that loses most candidates before
            they&apos;re ever seen — the resume.
          </p>
        </div>

        {/* ── RIGHT — 3 stacked cards (60%) ─────────────────────────────── */}
        <div
          className="about-cards lg:col-span-3 flex flex-col"
          style={{ gap: "16px" }}
        >
          {CARDS.map(({ Icon, title, description }, i) => (
            <div
              key={i}
              className="about-card"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "28px",
              }}
            >
              <div
                className="flex items-center justify-center rounded-lg mb-4"
                style={{
                  backgroundColor: "var(--accent-subtle)",
                  width: "40px",
                  height: "40px",
                }}
              >
                <Icon
                  style={{ color: "var(--accent)", width: "18px", height: "18px" }}
                />
              </div>

              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {title}
              </h3>

              <p
                className="text-sm"
                style={{ color: "var(--text-muted)", lineHeight: 1.65 }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
