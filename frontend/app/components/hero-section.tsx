'use client';

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, SplitText, ScrambleTextPlugin } from "@/app/lib/gsap";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  // ── Refs ──────────────────────────────────────────────────────────────────

  const sectionRef    = useRef<HTMLElement>(null);
  const badgeRef      = useRef<HTMLDivElement>(null);
  const titleRef      = useRef<HTMLHeadingElement>(null);
  const firstLineRef  = useRef<HTMLSpanElement>(null);
  const secondLineRef = useRef<HTMLElement>(null);
  const subtitleRef   = useRef<HTMLParagraphElement>(null);
  const buttonsRef    = useRef<HTMLDivElement>(null);
  const statsRef      = useRef<HTMLDivElement>(null);

  // Resume preview card refs
  const cardRef  = useRef<HTMLDivElement>(null);
  const chip0Ref = useRef<HTMLDivElement>(null);
  const chip1Ref = useRef<HTMLDivElement>(null);
  const chip2Ref = useRef<HTMLDivElement>(null);

  // ── State ─────────────────────────────────────────────────────────────────

  const [stat1, setStat1] = useState(0);   // → 30 s
  const [stat2, setStat2] = useState(0);   // → 99.9 %
  const [stat3, setStat3] = useState(0);   // → 100 %
  const [atsScore, setAtsScore]         = useState(0);          // → 94
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  // ── Entrance & counter animations ─────────────────────────────────────────

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Standard entrance for badge, subtext, buttons, stats
      const peripheralElements = [
        badgeRef.current,
        subtitleRef.current,
        buttonsRef.current,
        statsRef.current,
      ].filter(Boolean);

      gsap.fromTo(
        peripheralElements,
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

      // 2. ScrambleText headline (requires Club plugins)
      try {
        const firstLine  = firstLineRef.current;
        const secondLine = secondLineRef.current;

        if (firstLine && secondLine) {
          gsap.set(secondLine, { opacity: 0, filter: "blur(12px)" });

          const tl = gsap.timeline({ delay: 0.3 });
          const split = new SplitText(firstLine, { type: "chars" });

          tl.from(split.chars, {
            duration: 1.2,
            ease: "power2.out",
            stagger: 0.04,
            scrambleText: { chars: "upperCase", speed: 0.4 },
          }, 0);

          tl.to(secondLine, {
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power3.out",
          }, 1.5);
        }
      } catch {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 32, filter: "blur(8px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out", delay: 0.12 }
        );
      }

      // 3. Hero stat counters
      gsap.to({}, {
        duration: 2.5,
        delay: 0.6,
        ease: "power2.out",
        onUpdate: function () {
          const p = this.progress();
          setStat1(Math.floor(30 * p));
          setStat2(Number((99.9 * p).toFixed(1)));
          setStat3(Math.floor(100 * p));
        },
      });

      // 4. Resume card entrance
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, x: 60, filter: "blur(8px)" },
          { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", delay: 1 }
        );
      }

      // 5. Keyword chip stagger
      const chips = [chip0Ref.current, chip1Ref.current, chip2Ref.current].filter(Boolean);
      gsap.fromTo(
        chips,
        { opacity: 0, scale: 0.8, y: 6 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.5)", stagger: 0.3, delay: 2.2 }
      );

      // 6. ATS score counter (runs while card appears)
      gsap.to({}, {
        duration: 1.5,
        delay: 1.3,
        ease: "power2.out",
        onUpdate: function () {
          setAtsScore(Math.round(94 * this.progress()));
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ── Line highlight loop ───────────────────────────────────────────────────

  useEffect(() => {
    // Start after card has loaded (~2s)
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        const idx = Math.floor(Math.random() * 3);
        setHighlightedLine(idx);
        setTimeout(() => setHighlightedLine(null), 500);
      }, 1500);
      return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(startTimeout);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const lineStyle = (idx: number): React.CSSProperties => ({
    height: "10px",
    borderRadius: highlightedLine === idx
      ? "0 var(--radius-sm) var(--radius-sm) 0"
      : "var(--radius-sm)",
    backgroundColor: highlightedLine === idx
      ? "var(--accent-subtle)"
      : "var(--bg-sunken)",
    borderLeft: `3px solid ${highlightedLine === idx ? "var(--accent)" : "transparent"}`,
    paddingLeft: highlightedLine === idx ? "6px" : "0px",
    transition: "background-color 0.35s ease, border-color 0.35s ease, padding-left 0.35s ease, border-radius 0.2s ease",
  });

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
      {/* Two-column layout — single column on mobile */}
      <div
        className="flex flex-col lg:flex-row"
        style={{ alignItems: "center", gap: "clamp(40px, 6vw, 80px)", width: "100%" }}
      >

        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Hero wordmark — fades out into navbar as user scrolls */}
          <div
            id="hero-wordmark"
            style={{
              fontSize: "clamp(48px, 8vw, 96px)",
              fontWeight: 600,
              color: "var(--accent)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginBottom: "clamp(24px, 3vw, 40px)",
            }}
          >
            Resumence
          </div>

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
            <span
              ref={firstLineRef}
              style={{ color: "var(--text-primary)", display: "block" }}
            >
              Your resume,
            </span>
            <em
              ref={secondLineRef}
              style={{
                color: "var(--accent)",
                fontStyle: "italic",
                display: "block",
              }}
            >
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
              className="btn-fill inline-flex items-center gap-2 text-sm font-medium touch-manipulation"
              style={{
                backgroundColor: "var(--accent)",
                color: "white",
                borderRadius: "var(--radius-md)",
                padding: "12px 28px",
                boxShadow: "var(--shadow-sm)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={scrollToContact}
              className="btn-fill inline-flex items-center gap-2 text-sm font-medium touch-manipulation"
              style={{
                backgroundColor: "transparent",
                color: "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                padding: "12px 28px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              See How It Works
            </button>
          </div>

          {/* Stat row */}
          <div
            ref={statsRef}
            className="flex flex-wrap"
            style={{ gap: "40px", marginTop: "64px" }}
          >
            <div>
              <div
                className="font-semibold"
                style={{ fontSize: "2.75rem", color: "var(--accent)", letterSpacing: "-0.03em", lineHeight: 1 }}
              >
                {stat1}s
              </div>
              <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>AI Processing Time</div>
            </div>
            <div>
              <div
                className="font-semibold"
                style={{ fontSize: "2.75rem", color: "var(--accent)", letterSpacing: "-0.03em", lineHeight: 1 }}
              >
                {stat2}%
              </div>
              <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>ATS Compatibility</div>
            </div>
            <div>
              <div
                className="font-semibold"
                style={{ fontSize: "2.75rem", color: "var(--accent)", letterSpacing: "-0.03em", lineHeight: 1 }}
              >
                {stat3}%
              </div>
              <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Secure & Private</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — animated resume preview card (desktop only) ── */}
        <div className="hidden lg:flex" style={{ flexShrink: 0, alignItems: "center", justifyContent: "center" }}>

          {/* GSAP entrance wrapper */}
          <div ref={cardRef} style={{ position: "relative", opacity: 0 }}>

            {/* Float wrapper — continuous CSS float animation */}
            <div style={{ animation: "float 3s ease-in-out infinite", position: "relative" }}>

              {/* ATS Score badge — top-right, overlapping the card */}
              <div
                style={{
                  position: "absolute",
                  top: "-18px",
                  right: "-18px",
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  backgroundColor: "var(--accent)",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <span style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1 }}>
                  {atsScore}
                </span>
                <span style={{ fontSize: "0.5rem", fontWeight: 500, opacity: 0.85, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "2px" }}>
                  ATS
                </span>
              </div>

              {/* Card */}
              <div
                style={{
                  width: "340px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)",
                  boxShadow: "var(--shadow-lg)",
                  padding: "32px",
                }}
              >
                {/* Name placeholder bar */}
                <div
                  style={{
                    height: "14px",
                    width: "60%",
                    backgroundColor: "var(--bg-sunken)",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "10px",
                  }}
                />
                {/* Title placeholder bar */}
                <div
                  style={{
                    height: "10px",
                    width: "40%",
                    backgroundColor: "var(--bg-sunken)",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "20px",
                  }}
                />

                {/* Divider */}
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "var(--border)",
                    marginBottom: "16px",
                  }}
                />

                {/* Experience section label */}
                <div
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: "14px",
                  }}
                >
                  Experience
                </div>

                {/* Content lines — random one highlights on interval */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                  <div style={{ ...lineStyle(0), width: "90%" }} />
                  <div style={{ ...lineStyle(1), width: "75%" }} />
                  <div style={{ ...lineStyle(2), width: "82%" }} />
                </div>

                {/* Second divider */}
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "var(--border)",
                    marginBottom: "16px",
                  }}
                />

                {/* Skills section label */}
                <div
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: "14px",
                  }}
                >
                  Skills
                </div>

                {/* Keyword chips */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(["AWS", "React", "TypeScript"] as const).map((label, i) => (
                    <div
                      key={label}
                      ref={i === 0 ? chip0Ref : i === 1 ? chip1Ref : chip2Ref}
                      style={{
                        backgroundColor: "var(--accent-subtle)",
                        color: "var(--accent-text)",
                        borderRadius: "999px",
                        padding: "4px 10px",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        opacity: 0,
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
