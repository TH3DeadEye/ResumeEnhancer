'use client';

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Bot, TrendingUp, Search, FileText } from "lucide-react";

import { gsap, ScrollTrigger } from "@/app/lib/gsap";


// ── Feature data ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    Icon: Bot,
    title: "AI-Powered Tailoring",
    description:
      "Amazon Bedrock analyzes the job description and rewrites your resume to match — naturally, not robotically.",
    image: "/images/features/feature-ai-tailoring.png",
  },
  {
    Icon: TrendingUp,
    title: "ATS Score in Seconds",
    description:
      "Know exactly how your resume performs against applicant tracking systems before you apply.",
    image: "/images/features/feature-ats-score.png",
  },
  {
    Icon: Search,
    title: "Keyword Intelligence",
    description:
      "Surface missing keywords recruiters are scanning for and see exactly where to add them.",
    image: "/images/features/feature-keywords.png",
  },
  {
    Icon: FileText,
    title: "Instant PDF Export",
    description:
      "Download your tailored resume immediately. No accounts needed for preview — just results.",
    image: "/images/features/feature-pdf-export.png",
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
              toggleActions: "play none none reverse",
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
            toggleActions: "play none none reverse",
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
          {FEATURES.map(({ Icon, title, description, image }, i) => {
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

                {/* Feature image */}
                <div
                  className="hidden lg:block"
                  style={{
                    order: isEven ? 2 : 1,
                    borderRadius: "var(--radius-xl)",
                    overflow: "hidden",
                    height: "280px",
                    position: "relative",
                  }}
                >
                  <Image
                    src={image}
                    alt={title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 1024px) 100vw, 50vw"
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
