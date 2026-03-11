'use client';

/**
 * FillButton — directional wipe fill on hover.
 *
 * On mouseenter: detect which side the cursor enters from, sweep a fill
 * overlay from that side. On mouseleave: sweep it back out from the exit side.
 *
 * Props:
 *   fillColor      — background of the fill overlay
 *   fillOpacity    — max opacity of overlay (0.22 for solid/accent, 0.12 for outlined)
 *   hoverTextColor — optional: if set, transitions button text to this color on hover
 */

import { useRef } from "react";
import { gsap } from "@/app/lib/gsap";

// ── Direction helper (0-1 coordinate space, 4-triangle method) ───────────────

function getSideOffset(
  e: React.MouseEvent,
  el: HTMLElement
): { x: string; y: string } {
  const rect = el.getBoundingClientRect();
  const relX  = (e.clientX - rect.left)  / rect.width;
  const relY  = (e.clientY - rect.top)   / rect.height;

  if (relX > relY && relX > 1 - relY) return { x: "100%",  y: "0%"    }; // right
  if (relX < relY && relX < 1 - relY) return { x: "-100%", y: "0%"    }; // left
  if (relY < relX && relY < 1 - relX) return { x: "0%",    y: "-100%" }; // top
  return                                      { x: "0%",    y: "100%"  }; // bottom
}

// ── Types ────────────────────────────────────────────────────────────────────

interface FillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fillColor?:      string;
  fillOpacity?:    number;
  hoverTextColor?: string;
  children:        React.ReactNode;
}

interface FillLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  fillColor?:      string;
  fillOpacity?:    number;
  hoverTextColor?: string;
  children:        React.ReactNode;
}

// ── FillButton ────────────────────────────────────────────────────────────────

export function FillButton({
  fillColor      = "white",
  fillOpacity    = 0.22,
  hoverTextColor,
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
        { x, y, opacity: 0 },
        { x: "0%", y: "0%", opacity: fillOpacity, duration: 0.25, ease: "power2.out" }
      );
    }
    if (hoverTextColor) {
      e.currentTarget.style.color = hoverTextColor;
    }
  };

  const onLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { x, y } = getSideOffset(e, e.currentTarget);
    if (fillRef.current) {
      gsap.to(fillRef.current, {
        x, y, opacity: 0, duration: 0.25, ease: "power2.in",
        onComplete: () => {
          if (fillRef.current) gsap.set(fillRef.current, { x: "0%", y: "0%", opacity: 0 });
        },
      });
    }
    if (hoverTextColor) {
      // Restore to the inline style color, or clear to fall back to cascade
      e.currentTarget.style.color = (style as React.CSSProperties)?.color ?? '';
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
    </button>
  );
}

// ── FillLink ──────────────────────────────────────────────────────────────────

export function FillLink({
  fillColor      = "var(--accent)",
  fillOpacity    = 0.12,
  hoverTextColor,
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
        { x, y, opacity: 0 },
        { x: "0%", y: "0%", opacity: fillOpacity, duration: 0.25, ease: "power2.out" }
      );
    }
    if (hoverTextColor) {
      e.currentTarget.style.color = hoverTextColor;
    }
  };

  const onLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { x, y } = getSideOffset(e, e.currentTarget);
    if (fillRef.current) {
      gsap.to(fillRef.current, {
        x, y, opacity: 0, duration: 0.25, ease: "power2.in",
        onComplete: () => {
          if (fillRef.current) gsap.set(fillRef.current, { x: "0%", y: "0%", opacity: 0 });
        },
      });
    }
    if (hoverTextColor) {
      e.currentTarget.style.color = (style as React.CSSProperties)?.color ?? '';
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
