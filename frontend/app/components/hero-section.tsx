'use client';

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  // ── Refs ──────────────────────────────────────────────────────────────────

  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef   = useRef<HTMLDivElement>(null);
  const titleRef   = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef  = useRef<HTMLDivElement>(null);
  const statsRef    = useRef<HTMLDivElement>(null);

  // ── State — animated counters ─────────────────────────────────────────────

  const [stat1, setStat1] = useState(0);  // → 30 s
  const [stat2, setStat2] = useState(0);  // → 99.9 %
  const [stat3, setStat3] = useState(0);  // → 100 %

  // ── Unified animation system ──────────────────────────────────────────────

  useEffect(() => {
    const ctx = gsap.context(() => {
      const elements = [
        badgeRef.current,
        titleRef.current,
        subtitleRef.current,
        buttonsRef.current,
        statsRef.current,
      ].filter(Boolean);

      // badge → headline → subtext → buttons → stats, stagger 0.12
      gsap.fromTo(
        elements,
        { opacity: 0, y: 32, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
        }
      );

      // Counter animation runs alongside entrance
      gsap.to(
        {},
        {
          duration: 2.5,
          delay: 0.6,
          ease: "power2.out",
          onUpdate: function () {
            const p = this.progress();
            setStat1(Math.floor(30 * p));
            setStat2(Number((99.9 * p).toFixed(1)));
            setStat3(Math.floor(100 * p));
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section
      id="home"
      ref={sectionRef}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: "80px",
        paddingBottom: "64px",
        paddingLeft: "max(24px, 10%)",
        paddingRight: "max(24px, 10%)",
        backgroundColor: "var(--bg-base)",
        backgroundImage: [
          "repeating-linear-gradient(to right, var(--border) 0px, var(--border) 1px, transparent 1px, transparent 40px)",
          "repeating-linear-gradient(to bottom, var(--border) 0px, var(--border) 1px, transparent 1px, transparent 40px)",
        ].join(", "),
      }}
    >
      <div style={{ maxWidth: "720px" }}>

        {/* Badge */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 rounded-full mb-10"
          style={{
            backgroundColor: "var(--accent-subtle)",
            border: "1px solid var(--border)",
            color: "var(--accent-text)",
            fontSize: "0.8125rem",
            fontWeight: 500,
            padding: "6px 14px",
          }}
        >
          ✦ Powered by AWS Bedrock AI
        </div>

        {/* Headline */}
        <h1
          ref={titleRef}
          style={{
            fontSize: "clamp(2.75rem, 5.5vw, 5rem)",
            fontWeight: 300,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            maxWidth: "680px",
            marginBottom: "1.5rem",
          }}
        >
          <span style={{ color: "var(--text-primary)" }}>Your resume,</span>
          <br />
          <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
            reimagined.
          </em>
        </h1>

        {/* Subtext */}
        <p
          ref={subtitleRef}
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.125rem",
            lineHeight: 1.7,
            maxWidth: "480px",
            marginBottom: "2.5rem",
          }}
        >
          Upload your resume. Paste a job description.
          <br />
          Get a tailored version in seconds — built to pass ATS filters.
        </p>

        {/* Buttons */}
        <div
          ref={buttonsRef}
          className="flex flex-col sm:flex-row"
          style={{ gap: "12px" }}
        >
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 text-sm font-medium transition-all touch-manipulation"
            style={{
              backgroundColor: "var(--accent)",
              color: "white",
              borderRadius: "var(--radius-md)",
              padding: "12px 28px",
              boxShadow: "var(--shadow-sm)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--accent-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--accent)")
            }
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={scrollToContact}
            className="inline-flex items-center gap-2 text-sm font-medium transition-all touch-manipulation"
            style={{
              backgroundColor: "transparent",
              color: "var(--text-secondary)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              padding: "12px 28px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
          >
            See How It Works
          </button>
        </div>

        {/* Stat row — no borders, just number + label */}
        <div
          ref={statsRef}
          className="flex flex-wrap"
          style={{ gap: "40px", marginTop: "64px" }}
        >
          <div>
            <div
              className="font-semibold"
              style={{
                fontSize: "2.75rem",
                color: "var(--accent)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {stat1}s
            </div>
            <div
              className="text-sm mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              AI Processing Time
            </div>
          </div>

          <div>
            <div
              className="font-semibold"
              style={{
                fontSize: "2.75rem",
                color: "var(--accent)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {stat2}%
            </div>
            <div
              className="text-sm mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              ATS Compatibility
            </div>
          </div>

          <div>
            <div
              className="font-semibold"
              style={{
                fontSize: "2.75rem",
                color: "var(--accent)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {stat3}%
            </div>
            <div
              className="text-sm mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              Secure & Private
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
