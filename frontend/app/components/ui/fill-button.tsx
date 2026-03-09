'use client';

/**
 * FillButton — directional wipe fill on hover.
 *
 * On mouseenter: detect which side the cursor enters from, then use GSAP to
 * sweep a fill div from that side across the button.
 * On mouseleave: sweep the fill div back out from the exit side.
 *
 * Props:
 *   fillColor   — background of the fill overlay (defaults to var(--accent-hover))
 *   as          — render as "button" (default) or "a"
 *   All standard HTMLButtonElement / HTMLAnchorElement attributes are forwarded.
 */

import { useRef } from "react";
import { gsap } from "@/app/lib/gsap";

// ── Direction helper ─────────────────────────────────────────────────────────

function getSideOffset(
  e: React.MouseEvent,
  el: HTMLElement
): { x: string; y: string } {
  const rect = el.getBoundingClientRect();
  const relX  = (e.clientX - rect.left)  / rect.width  - 0.5; // −0.5 … +0.5
  const relY  = (e.clientY - rect.top)   / rect.height - 0.5; // −0.5 … +0.5

  if (Math.abs(relX) >= Math.abs(relY)) {
    return relX >= 0 ? { x: "100%", y: "0%" } : { x: "-100%", y: "0%" };
  }
  return relY >= 0 ? { x: "0%", y: "100%" } : { x: "0%", y: "-100%" };
}

// ── Types ────────────────────────────────────────────────────────────────────

interface FillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fillColor?: string;
  children: React.ReactNode;
}

interface FillLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  fillColor?: string;
  children: React.ReactNode;
}

// ── FillButton ────────────────────────────────────────────────────────────────

export function FillButton({
  fillColor = "var(--accent-hover)",
  style,
  className,
  children,
  ...rest
}: FillButtonProps) {
  const fillRef = useRef<HTMLDivElement>(null);

  const onEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { x, y } = getSideOffset(e, e.currentTarget);
    if (fillRef.current) {
      gsap.fromTo(
        fillRef.current,
        { x, y, opacity: 1 },
        { x: "0%", y: "0%", duration: 0.3, ease: "power2.out" }
      );
    }
  };

  const onLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { x, y } = getSideOffset(e, e.currentTarget);
    if (fillRef.current) {
      gsap.to(fillRef.current, {
        x,
        y,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          if (fillRef.current) gsap.set(fillRef.current, { x: "0%", y: "0%", opacity: 0 });
        },
      });
    }
  };

  return (
    <button
      {...rest}
      className={className}
      style={{ ...style, position: "relative", overflow: "hidden" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Fill overlay */}
      <div
        ref={fillRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: fillColor,
          opacity: 0,
          pointerEvents: "none",
          zIndex: 0,
          transform: "translateX(100%)",
        }}
      />
      {/* Content sits above fill */}
      <span
        style={{
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          gap: "inherit",
        }}
      >
        {children}
      </span>
    </button>
  );
}

// ── FillLink ──────────────────────────────────────────────────────────────────

export function FillLink({
  fillColor = "var(--accent-subtle)",
  style,
  className,
  children,
  ...rest
}: FillLinkProps) {
  const fillRef = useRef<HTMLDivElement>(null);

  const onEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { x, y } = getSideOffset(e, e.currentTarget);
    if (fillRef.current) {
      gsap.fromTo(
        fillRef.current,
        { x, y, opacity: 1 },
        { x: "0%", y: "0%", duration: 0.3, ease: "power2.out" }
      );
    }
  };

  const onLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { x, y } = getSideOffset(e, e.currentTarget);
    if (fillRef.current) {
      gsap.to(fillRef.current, {
        x,
        y,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          if (fillRef.current) gsap.set(fillRef.current, { x: "0%", y: "0%", opacity: 0 });
        },
      });
    }
  };

  return (
    <a
      {...rest}
      className={className}
      style={{ ...style, position: "relative", overflow: "hidden" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div
        ref={fillRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: fillColor,
          opacity: 0,
          pointerEvents: "none",
          zIndex: 0,
          transform: "translateX(100%)",
        }}
      />
      <span
        style={{
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          gap: "inherit",
        }}
      >
        {children}
      </span>
    </a>
  );
}
