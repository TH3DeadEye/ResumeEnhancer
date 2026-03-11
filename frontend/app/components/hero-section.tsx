'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, SplitText, ScrambleTextPlugin } from "@/app/lib/gsap";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  // ── Refs ──────────────────────────────────────────────────────────────────

  const sectionRef    = useRef<HTMLElement>(null);
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

  // Content line refs (for interactive dot target + width animation)
  const line0Ref = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);

  // ── State ─────────────────────────────────────────────────────────────────

  const [stat1, setStat1] = useState(0);
  const [stat2, setStat2] = useState(0);
  const [stat3, setStat3] = useState(0);
  const [atsScore, setAtsScore]             = useState(0);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  // Line widths — can expand on chip hover
  const [lineWidths, setLineWidths]         = useState(['90%', '75%', '82%']);

  // ── Internal trackers (not state — avoids stale closure issues) ────────────
  const atsScoreRef      = useRef(0);
  const hoverScoreRef    = useRef<gsap.core.Tween | null>(null);

  // ── Entrance & counter animations ─────────────────────────────────────────

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Peripheral elements
      const peripheralElements = [
        subtitleRef.current,
        buttonsRef.current,
        statsRef.current,
      ].filter(Boolean);

      gsap.fromTo(
        peripheralElements,
        { opacity: 0, y: 32, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out", stagger: 0.12 }
      );

      // 2. ScrambleText headline
      try {
        const firstLine  = firstLineRef.current;
        const secondLine = secondLineRef.current;
        if (firstLine && secondLine) {
          gsap.set(secondLine, { opacity: 0, filter: "blur(12px)" });
          const tl    = gsap.timeline({ delay: 0.3 });
          const split = new SplitText(firstLine, { type: "chars" });
          tl.from(split.chars, {
            duration: 1.2,
            ease: "power2.out",
            stagger: 0.04,
            scrambleText: { chars: "upperCase", speed: 0.4 },
          }, 0);
          tl.to(secondLine, { opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out" }, 1.5);
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
        duration: 2.5, delay: 0.6, ease: "power2.out",
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

      // 6. ATS score counter
      const scoreProxy = { v: 0 };
      gsap.to(scoreProxy, {
        v: 94, duration: 1.5, delay: 1.3, ease: "power2.out",
        onUpdate: () => {
          const val = Math.round(scoreProxy.v);
          setAtsScore(val);
          atsScoreRef.current = val;
        },
        onComplete: () => {
          setAtsScore(94);
          atsScoreRef.current = 94;
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ── Line highlight interval ───────────────────────────────────────────────

  useEffect(() => {
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        const idx = Math.floor(Math.random() * 3);
        setHighlightedLine(idx);
        setTimeout(() => setHighlightedLine(null), 500);
      }, 1500);
      return () => clearInterval(interval);
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  // ── Animated dot helper ───────────────────────────────────────────────────

  const fireDot = useCallback((chipEl: HTMLElement, lineEl: HTMLElement) => {
    const chipRect = chipEl.getBoundingClientRect();
    const lineRect = lineEl.getBoundingClientRect();

    const dot = document.createElement('div');
    dot.style.cssText = [
      'position:fixed',
      'width:6px',
      'height:6px',
      'border-radius:50%',
      'background-color:var(--accent)',
      'pointer-events:none',
      'z-index:9999',
      `left:${chipRect.left + chipRect.width / 2 - 3}px`,
      `top:${chipRect.top + chipRect.height / 2 - 3}px`,
      'box-shadow:0 0 8px var(--accent)',
    ].join(';');
    document.body.appendChild(dot);

    gsap.to(dot, {
      left: lineRect.left + lineRect.width * 0.25 - 3,
      top:  lineRect.top  + lineRect.height / 2 - 3,
      opacity: 0,
      duration: 0.55,
      ease: 'power2.out',
      onComplete: () => { if (dot.parentNode) dot.parentNode.removeChild(dot); },
    });
  }, []);

  // ── Interactive chip handlers ─────────────────────────────────────────────

  const chipRefs = [chip0Ref, chip1Ref, chip2Ref];

  const onChipEnter = useCallback((chipIdx: number) => {
    const chipEl = chipRefs[chipIdx]?.current;
    if (!chipEl) return;

    const lineIdx  = chipIdx; // each chip targets the matching line
    const lineEl   = [line0Ref, line1Ref, line2Ref][lineIdx]?.current;

    // 1. Scale chip
    gsap.to(chipEl, { scale: 1.08, duration: 0.2, ease: 'back.out(2)' });

    // 2. Highlight target line
    setHighlightedLine(lineIdx);

    // 3. Expand that line's width
    setLineWidths(prev => prev.map((w, i) => i === lineIdx ? '97%' : w));

    // 4. Dot animation
    if (lineEl) fireDot(chipEl, lineEl);

    // 5. ATS score tick up
    hoverScoreRef.current?.kill();
    const scoreProxy = { v: atsScoreRef.current };
    hoverScoreRef.current = gsap.to(scoreProxy, {
      v: Math.min(99, atsScoreRef.current + 2),
      duration: 0.4,
      ease: 'power2.out',
      onUpdate: () => {
        const val = Math.round(scoreProxy.v);
        setAtsScore(val);
        atsScoreRef.current = val;
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fireDot]);

  const onChipLeave = useCallback((chipIdx: number) => {
    const chipEl = chipRefs[chipIdx]?.current;
    if (chipEl) gsap.to(chipEl, { scale: 1, duration: 0.2, ease: 'power2.out' });

    setHighlightedLine(null);
    setLineWidths(['90%', '75%', '82%']);

    // Score tick back down
    hoverScoreRef.current?.kill();
    const scoreProxy = { v: atsScoreRef.current };
    hoverScoreRef.current = gsap.to(scoreProxy, {
      v: 94,
      duration: 0.6,
      ease: 'power2.in',
      onUpdate: () => {
        const val = Math.round(scoreProxy.v);
        setAtsScore(val);
        atsScoreRef.current = val;
      },
      onComplete: () => { atsScoreRef.current = 94; },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const lineStyle = (idx: number): React.CSSProperties => ({
    height: "10px",
    borderRadius: highlightedLine === idx ? "0 var(--radius-sm) var(--radius-sm) 0" : "var(--radius-sm)",
    backgroundColor: highlightedLine === idx ? "var(--accent-subtle)" : "var(--bg-sunken)",
    borderLeft: `3px solid ${highlightedLine === idx ? "var(--accent)" : "transparent"}`,
    width: lineWidths[idx],
    transition: "background-color 0.35s ease, border-color 0.35s ease, width 0.4s ease, border-radius 0.2s ease",
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
      <div
        className="flex flex-col lg:flex-row"
        style={{ alignItems: "center", gap: "clamp(40px, 6vw, 80px)", width: "100%" }}
      >

        {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Hero wordmark — scroll-morphs into navbar */}
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
            <span ref={firstLineRef} style={{ color: "var(--text-primary)", display: "block" }}>
              Your resume,
            </span>
            <em ref={secondLineRef} style={{ color: "var(--accent)", fontStyle: "italic", display: "block" }}>
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
          <div ref={buttonsRef} className="flex flex-col sm:flex-row" style={{ gap: "12px" }}>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 text-sm font-medium touch-manipulation"
              style={{
                backgroundColor: "var(--accent)",
                color: "white",
                borderRadius: "var(--radius-md)",
                padding: "12px 28px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={scrollToContact}
              className="inline-flex items-center gap-2 text-sm font-medium touch-manipulation"
              style={{
                backgroundColor: "transparent",
                color: "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                padding: "12px 28px",
              }}
            >
              See How It Works
            </button>
          </div>

          {/* Stat row */}
          <div ref={statsRef} className="flex flex-wrap" style={{ gap: "40px", marginTop: "64px" }}>
            <div>
              <div className="font-semibold" style={{ fontSize: "2.75rem", color: "var(--accent)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {stat1}s
              </div>
              <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>AI Processing Time</div>
            </div>
            <div>
              <div className="font-semibold" style={{ fontSize: "2.75rem", color: "var(--accent)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {stat2}%
              </div>
              <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>ATS Compatibility</div>
            </div>
            <div>
              <div className="font-semibold" style={{ fontSize: "2.75rem", color: "var(--accent)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {stat3}%
              </div>
              <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Secure & Private</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — animated resume preview (desktop only) ────── */}
        <div className="hidden lg:flex" style={{ flexShrink: 0, alignItems: "center", justifyContent: "center" }}>

          {/* GSAP entrance target */}
          <div ref={cardRef} style={{ position: "relative", opacity: 0 }}>

            {/* Float wrapper */}
            <div style={{ animation: "float 3s ease-in-out infinite", position: "relative" }}>

              {/* ATS Score badge */}
              <div
                style={{
                  position: "absolute",
                  top: "-18px", right: "-18px",
                  width: "68px", height: "68px",
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
                <span style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1 }}>{atsScore}</span>
                <span style={{ fontSize: "0.5rem", fontWeight: 500, opacity: 0.85, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "2px" }}>ATS</span>
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
                {/* Name bar */}
                <div style={{ height: "14px", width: "60%", backgroundColor: "var(--bg-sunken)", borderRadius: "var(--radius-sm)", marginBottom: "10px" }} />
                {/* Title bar */}
                <div style={{ height: "10px", width: "40%", backgroundColor: "var(--bg-sunken)", borderRadius: "var(--radius-sm)", marginBottom: "20px" }} />

                <div style={{ height: "1px", backgroundColor: "var(--border)", marginBottom: "16px" }} />

                <div style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "14px" }}>
                  Experience
                </div>

                {/* Content lines — interactive */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                  <div ref={line0Ref} style={lineStyle(0)} />
                  <div ref={line1Ref} style={lineStyle(1)} />
                  <div ref={line2Ref} style={lineStyle(2)} />
                </div>

                <div style={{ height: "1px", backgroundColor: "var(--border)", marginBottom: "16px" }} />

                <div style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "14px" }}>
                  Skills
                </div>

                {/* Keyword chips — interactive */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(["AWS", "React", "TypeScript"] as const).map((label, i) => (
                    <div
                      key={label}
                      ref={i === 0 ? chip0Ref : i === 1 ? chip1Ref : chip2Ref}
                      onMouseEnter={() => onChipEnter(i)}
                      onMouseLeave={() => onChipLeave(i)}
                      style={{
                        backgroundColor: "var(--accent-subtle)",
                        color: "var(--accent-text)",
                        borderRadius: "999px",
                        padding: "4px 10px",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        opacity: 0,
                        cursor: "default",
                        userSelect: "none",
                        transition: "background-color 0.2s ease",
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
