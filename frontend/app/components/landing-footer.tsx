'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "About",    href: "#about"    },
  { label: "Contact",  href: "#contact"  },
  { label: "Sign In",  href: "#signin"   },
];

export function LandingFooter() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".footer-animate",
        { opacity: 0, y: 32, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      style={{
        backgroundColor: "var(--bg-base)",
        borderTop: "1px solid var(--border)",
        padding: "48px max(24px, 10%)",
      }}
    >
      {/* 3-column main grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-3"
        style={{ gap: "40px", marginBottom: "40px" }}
      >
        {/* Left — wordmark + tagline */}
        <div className="footer-animate">
          <span
            className="block tracking-tight mb-2"
            style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1.125rem" }}
          >
            Resumence
          </span>
          <p
            className="text-sm"
            style={{ color: "var(--text-muted)", lineHeight: 1.6 }}
          >
            AI resume tailoring for the modern job search.
          </p>
        </div>

        {/* Center — nav links */}
        <div className="footer-animate flex flex-col" style={{ gap: "12px" }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right — built with */}
        <div className="footer-animate">
          <p
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Built with Amazon Bedrock
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="text-center pt-6"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-disabled)" }}>
          © 2026 Resumence. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
