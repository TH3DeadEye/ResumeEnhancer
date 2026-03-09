'use client';

import { useEffect, useRef } from "react";
import { Bot, TrendingUp, Search, FileText } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Feature data ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    Icon: Bot,
    title: "AI-Powered Tailoring",
    description:
      "Amazon Bedrock analyzes the job description and rewrites your resume to match — naturally, not robotically.",
  },
  {
    Icon: TrendingUp,
    title: "ATS Score in Seconds",
    description:
      "Know exactly how your resume performs against applicant tracking systems before you apply.",
  },
  {
    Icon: Search,
    title: "Keyword Intelligence",
    description:
      "Surface missing keywords recruiters are scanning for and see exactly where to add them.",
  },
  {
    Icon: FileText,
    title: "Instant PDF Export",
    description:
      "Download your tailored resume immediately. No accounts needed for preview — just results.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Unified animation: each row enters when it crosses 82% of viewport
  useEffect(() => {
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>(".feature-row");

      rows.forEach((row) => {
        gsap.fromTo(
          row,
          { opacity: 0, y: 32, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // Section header animates in independently
      gsap.fromTo(
        ".features-header",
        { opacity: 0, y: 32, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".features-header",
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      style={{
        backgroundColor: "var(--bg-subtle)",
        padding: "120px max(24px, 10%)",
      }}
    >
      {/* Section header */}
      <div className="features-header text-center mb-24">
        <h2
          style={{
            color: "var(--text-primary)",
            fontWeight: 500,
            fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
            letterSpacing: "-0.02em",
            marginBottom: "0.875rem",
          }}
        >
          What Resumence does
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "1.0625rem",
            maxWidth: "540px",
            margin: "0 auto",
            lineHeight: 1.65,
          }}
        >
          Built around one idea: your resume should work for the job, not the
          other way around.
        </p>
      </div>

      {/* Alternating rows */}
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div className="flex flex-col" style={{ gap: "80px" }}>
          {FEATURES.map(({ Icon, title, description }, i) => {
            const isEven = i % 2 === 0;

            return (
              <div
                key={i}
                className="feature-row grid grid-cols-1 lg:grid-cols-2 items-center"
                style={{ gap: "64px" }}
              >
                {/* Text content */}
                <div
                  style={{
                    order: isEven ? 1 : 2,
                  }}
                  className="lg:order-[unset]"
                >
                  <div
                    className="flex items-center justify-center rounded-xl mb-6"
                    style={{
                      backgroundColor: "var(--accent-subtle)",
                      width: "48px",
                      height: "48px",
                    }}
                  >
                    <Icon
                      style={{ color: "var(--accent)", width: "22px", height: "22px" }}
                    />
                  </div>

                  <h3
                    style={{
                      color: "var(--text-primary)",
                      fontWeight: 600,
                      fontSize: "1.375rem",
                      letterSpacing: "-0.01em",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {title}
                  </h3>

                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "1rem",
                      lineHeight: 1.7,
                    }}
                  >
                    {description}
                  </p>
                </div>

                {/* Abstract visual placeholder */}
                <div
                  className="hidden lg:flex items-center justify-center"
                  style={{
                    order: isEven ? 2 : 1,
                    backgroundColor: "var(--accent-subtle)",
                    borderRadius: "var(--radius-xl)",
                    height: "280px",
                  }}
                >
                  <Icon
                    style={{
                      color: "var(--accent)",
                      width: "80px",
                      height: "80px",
                      opacity: 0.55,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
