'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, SplitText, ScrambleTextPlugin } from "@/app/lib/gsap";

// ── Score milestones indexed by hoveredChips.size ────────────────────────────
const MILESTONES = [47, 71, 88, 100];

// ── Resting widths for each experience bar ───────────────────────────────────
const LINE_ORIGINAL_WIDTHS = ["85%", "70%", "60%"] as const;

// ── Label text per chip ───────────────────────────────────────────────────────
const CHIP_LABELS = ["AWS", "React", "TypeScript"] as const;

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

  // Card refs
  const cardRef    = useRef<HTMLDivElement>(null); // entrance + 3D tilt
  const badgeRef   = useRef<HTMLDivElement>(null); // ATS badge parallax
  const nameBarRef = useRef<HTMLDivElement>(null); // decorative name bar

  // Chip refs
  const chip0Ref = useRef<HTMLDivElement>(null);
  const chip1Ref = useRef<HTMLDivElement>(null);
  const chip2Ref = useRef<HTMLDivElement>(null);

  // Experience bar refs
  const line0Ref = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);

  // Floating label refs (one per bar)
  const label0Ref = useRef<HTMLSpanElement>(null);
  const label1Ref = useRef<HTMLSpanElement>(null);
  const label2Ref = useRef<HTMLSpanElement>(null);

  // Internal trackers
  const atsScoreRef        = useRef(0);
  const hoverScoreRef      = useRef<gsap.core.Tween | null>(null);
  const hoveredChipsSetRef = useRef<Set<number>>(new Set());
  // Shared leave debounce — prevents score dropping on fast chip-to-chip slides
  const leaveTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── State ─────────────────────────────────────────────────────────────────

  const [stat1, setStat1] = useState(0);
  const [stat2, setStat2] = useState(0);
  const [stat3, setStat3] = useState(0);
  const [atsScore, setAtsScore] = useState(0);

  // ── Entrance & counter animations ─────────────────────────────────────────

  useEffect(() => {
    const ctx = gsap.context(() => {

      // 0. Hard-reset bars to default gray state (handles hot-reload / remount
      //    after a hover session that left bars blue)
      const bars = [line0Ref.current, line1Ref.current, line2Ref.current].filter(Boolean);
      gsap.set(bars, {
        backgroundColor: "var(--bg-sunken)",
        width: (i: number) => LINE_ORIGINAL_WIDTHS[i],
      });

      // 1. Peripheral entrance
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
          } as unknown as gsap.TweenVars, 0);
          tl.to(secondLine, { opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out" }, 1.5);
        }
      } catch {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 32, filter: "blur(8px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out", delay: 0.12 }
        );
      }

      // 3. Stat counters
      gsap.to({}, {
        duration: 2.5, delay: 0.6, ease: "power2.out",
        onUpdate: function () {
          const p = this.progress();
          setStat1(Math.floor(30 * p));
          setStat2(Number((99.9 * p).toFixed(1)));
          setStat3(Math.floor(100 * p));
        },
      });

      // 4. Card entrance
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, x: 60, filter: "blur(8px)" },
          { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", delay: 1 }
        );
      }

      // 5. Chip stagger
      const chips = [chip0Ref.current, chip1Ref.current, chip2Ref.current].filter(Boolean);
      gsap.fromTo(
        chips,
        { opacity: 0, scale: 0.8, y: 6 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.5)", stagger: 0.3, delay: 2.2 }
      );

      // 6. ATS score counter — settles at MILESTONES[0] = 47
      const scoreProxy = { v: 0 };
      gsap.to(scoreProxy, {
        v: MILESTONES[0],
        duration: 1.5,
        delay: 1.3,
        ease: "power2.out",
        onUpdate: () => {
          const val = Math.round(scoreProxy.v);
          setAtsScore(val);
          atsScoreRef.current = val;
        },
        onComplete: () => {
          setAtsScore(MILESTONES[0]);
          atsScoreRef.current = MILESTONES[0];
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ── 3D tilt handlers ─────────────────────────────────────────────────────

  const handleCardTilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const cardEl  = cardRef.current;
    const badgeEl = badgeRef.current;
    if (!cardEl || !badgeEl) return;

    const rect = cardEl.getBoundingClientRect();
    const rotX  = ((e.clientY - rect.top  - rect.height / 2) / rect.height) * -12;
    const rotY  = ((e.clientX - rect.left - rect.width  / 2) / rect.width ) *  12;

    gsap.to(cardEl, {
      rotateX: rotX,
      rotateY: rotY,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 800,
      transformOrigin: "center center",
    });

    gsap.to(badgeEl, {
      x: rotY * -1.5,
      y: rotX *  1.5,
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  // Full cleanup when mouse leaves the card container — prevents stuck state
  // when the debounce timer is still pending as cursor exits the card.
  const handleCardLeave = useCallback(() => {
    const cardEl  = cardRef.current;
    const badgeEl = badgeRef.current;
    if (cardEl && badgeEl) {
      gsap.to([cardEl, badgeEl], { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.6, ease: "power3.out" });
    }

    // Cancel any pending leave debounce
    if (leaveTimerRef.current !== null) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }

    // Reset all chip states if any are still hovered
    if (hoveredChipsSetRef.current.size > 0) {
      hoveredChipsSetRef.current.clear();

      const lineRefs  = [line0Ref, line1Ref, line2Ref];
      const labelRefs = [label0Ref, label1Ref, label2Ref];
      const chipRefs  = [chip0Ref, chip1Ref, chip2Ref];

      lineRefs.forEach((ref, i) => {
        if (ref.current) {
          gsap.to(ref.current, { width: LINE_ORIGINAL_WIDTHS[i], backgroundColor: "var(--bg-sunken)", duration: 0.3 });
        }
      });
      labelRefs.forEach(ref => {
        if (ref.current) gsap.to(ref.current, { opacity: 0, duration: 0.15 });
      });
      chipRefs.forEach(ref => {
        if (ref.current) gsap.to(ref.current, { scale: 1, duration: 0.2, ease: "power2.out" });
      });

      animateToMilestone(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Animated dot ─────────────────────────────────────────────────────────

  const fireDot = useCallback((chipEl: HTMLElement, targetEl: HTMLElement) => {
    const chipRect   = chipEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const dot = document.createElement("div");
    dot.style.cssText = [
      "position:fixed",
      "width:6px",
      "height:6px",
      "border-radius:50%",
      "background-color:var(--accent)",
      "pointer-events:none",
      "z-index:9999",
      `left:${chipRect.left + chipRect.width / 2 - 3}px`,
      `top:${chipRect.top  + chipRect.height / 2 - 3}px`,
      "box-shadow:0 0 8px var(--accent)",
    ].join(";");
    document.body.appendChild(dot);

    gsap.to(dot, {
      left: targetRect.left + targetRect.width * 0.25 - 3,
      top:  targetRect.top  + targetRect.height / 2 - 3,
      opacity: 0,
      duration: 0.55,
      ease: "power2.out",
      onComplete: () => { if (dot.parentNode) dot.parentNode.removeChild(dot); },
    });
  }, []);

  // ── Score milestone animation ─────────────────────────────────────────────

  const animateToMilestone = useCallback((numHovered: number) => {
    const target = MILESTONES[Math.min(numHovered, MILESTONES.length - 1)];
    hoverScoreRef.current?.kill();
    const proxy = { v: atsScoreRef.current };
    hoverScoreRef.current = gsap.to(proxy, {
      v: target,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        const val = Math.round(proxy.v);
        setAtsScore(val);
        atsScoreRef.current = val;
      },
      onComplete: () => { atsScoreRef.current = target; },
    });
  }, []);

  // ── Chip interaction ──────────────────────────────────────────────────────
  //
  // Enter: cancel any pending leave timer (prevents score drop on fast slides),
  //        add chip to Set, fill bar, show label, animate score.
  // Leave: debounce 60ms — if another chip's enter fires within the window,
  //        the timer is cancelled and the chip stays in the Set.
  //        If the cursor genuinely leaves, cleanup runs after 60ms.
  //
  // Chip → bar mapping:
  //   AWS (0)        → line0Ref  resting 85%
  //   React (1)      → line1Ref  resting 70%
  //   TypeScript (2) → line2Ref  resting 60%

  const onChipEnter = useCallback((chipIdx: number) => {
    // Cancel pending leave so the Set stays populated during chip-to-chip slides
    if (leaveTimerRef.current !== null) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }

    hoveredChipsSetRef.current.add(chipIdx);

    const chipEl = [chip0Ref, chip1Ref, chip2Ref][chipIdx]?.current;
    if (chipEl) gsap.to(chipEl, { scale: 1.08, duration: 0.2, ease: "back.out(2)" });

    const lineEl = [line0Ref, line1Ref, line2Ref][chipIdx]?.current;
    if (lineEl) {
      gsap.to(lineEl, {
        width: "97%",
        backgroundColor: "var(--accent-subtle)",
        duration: 0.4,
        ease: "power2.out",
      });
      if (chipEl) fireDot(chipEl, lineEl);
    }

    // Hide labels for other chips (user slid here — clean up stale labels)
    [label0Ref, label1Ref, label2Ref].forEach((ref, i) => {
      if (i !== chipIdx && ref.current) gsap.to(ref.current, { opacity: 0, duration: 0.1 });
    });
    // Show this chip's label
    const labelEl = [label0Ref, label1Ref, label2Ref][chipIdx]?.current;
    if (labelEl) {
      gsap.fromTo(labelEl, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.2 });
    }

    animateToMilestone(hoveredChipsSetRef.current.size);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fireDot, animateToMilestone]);

  const onChipLeave = useCallback((chipIdx: number) => {
    if (leaveTimerRef.current !== null) clearTimeout(leaveTimerRef.current);

    leaveTimerRef.current = setTimeout(() => {
      leaveTimerRef.current = null;
      hoveredChipsSetRef.current.delete(chipIdx);

      const chipEl = [chip0Ref, chip1Ref, chip2Ref][chipIdx]?.current;
      if (chipEl) gsap.to(chipEl, { scale: 1, duration: 0.2, ease: "power2.out" });

      const lineEl = [line0Ref, line1Ref, line2Ref][chipIdx]?.current;
      if (lineEl) {
        gsap.to(lineEl, {
          width: LINE_ORIGINAL_WIDTHS[chipIdx],
          backgroundColor: "var(--bg-sunken)",
          duration: 0.3,
        });
      }

      const labelEl = [label0Ref, label1Ref, label2Ref][chipIdx]?.current;
      if (labelEl) gsap.to(labelEl, { opacity: 0, duration: 0.15 });

      animateToMilestone(hoveredChipsSetRef.current.size);
    }, 60);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateToMilestone]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const lineStyle = (): React.CSSProperties => ({
    height: "10px",
    borderRadius: "var(--radius-sm)",
    backgroundColor: "var(--bg-sunken)",
    pointerEvents: "none",
  });

  const isMaxScore = atsScore >= 100;

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

          {/* CTA buttons */}
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
        <div
          className="hidden lg:flex"
          style={{
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            perspective: "800px",
          }}
          onMouseMove={handleCardTilt}
          onMouseLeave={handleCardLeave}
        >
          {/* GSAP entrance + 3D tilt target */}
          <div
            ref={cardRef}
            style={{ position: "relative", opacity: 0, transformStyle: "preserve-3d" }}
          >
            {/* Float wrapper — CSS animation isolated from GSAP transforms */}
            <div style={{ animation: "float 3s ease-in-out infinite", position: "relative" }}>

              {/* ATS Score badge — parallax via badgeRef */}
              <div
                ref={badgeRef}
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
                  pointerEvents: "none",
                }}
              >
                <span style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1 }}>
                  {atsScore}
                </span>
                <span style={{
                  fontSize: "0.5rem",
                  fontWeight: 500,
                  opacity: 0.85,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginTop: "2px",
                }}>
                  {isMaxScore ? "ATS ✓" : "ATS"}
                </span>
              </div>

              {/* Resume card */}
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
                <div
                  ref={nameBarRef}
                  style={{
                    height: "14px",
                    width: "60%",
                    backgroundColor: "var(--bg-sunken)",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "10px",
                    pointerEvents: "none",
                  }}
                />
                {/* Title bar */}
                <div style={{
                  height: "10px",
                  width: "40%",
                  backgroundColor: "var(--bg-sunken)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "20px",
                  pointerEvents: "none",
                }} />

                <div style={{ height: "1px", backgroundColor: "var(--border)", marginBottom: "16px" }} />

                <div style={{
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "14px",
                }}>
                  Experience
                </div>

                {/* Experience bars — each has a floating label above it */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                  {CHIP_LABELS.map((label, i) => {
                    const lineRef  = [line0Ref,  line1Ref,  line2Ref ][i];
                    const labelRef = [label0Ref, label1Ref, label2Ref][i];
                    return (
                      <div key={label} style={{ position: "relative", paddingTop: "18px" }}>
                        {/* Floating keyword label — hidden by default, shown on chip hover */}
                        <span
                          ref={labelRef}
                          style={{
                            position: "absolute",
                            top: "0px",
                            left: 0,
                            fontSize: "9px",
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            color: "var(--accent-text)",
                            textTransform: "uppercase",
                            opacity: 0,
                            pointerEvents: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </span>
                        {/* The bar itself — GSAP animates width + backgroundColor */}
                        <div
                          ref={lineRef}
                          style={{
                            ...lineStyle(),
                            width: LINE_ORIGINAL_WIDTHS[i],
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div style={{ height: "1px", backgroundColor: "var(--border)", marginBottom: "16px" }} />

                <div style={{
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "14px",
                }}>
                  Skills
                </div>

                {/* Keyword chips — interactive, cumulative score */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {CHIP_LABELS.map((label, i) => (
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
