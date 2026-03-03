'use client';

import { Github, Linkedin, Mail } from "lucide-react";

/**
 * LANDING FOOTER COMPONENT
 * 
 * Footer with:
 * - Company branding and description
 * - Social media links
 * - Navigation links (Product and Legal sections)
 * - Copyright information
 * - Tech stack mention
 * 
 * CUSTOMIZATION:
 * - Update social media URLs in the <a> tags
 * - Add/remove navigation links in the Product/Legal sections
 * - Modify copyright year and team name
 */

export function LandingFooter() {
  return (
    <footer
      className="py-12"
      style={{ backgroundColor: "var(--bg-dark)", color: "var(--text-muted)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================ */}
        {/* MAIN FOOTER CONTENT - 4 Column Grid */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* ──────────────────────────────────────────────────────── */}
          {/* COLUMN 1-2: Brand and Social Media (spans 2 columns) */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="md:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(to bottom right, var(--primary), var(--secondary))" }}
              >
                <span className="font-bold text-lg" style={{ color: "var(--bg-light)" }}>AI</span>
              </div>
              <span className="text-xl font-bold" style={{ color: "var(--text)" }}>Resume Enhancer</span>
            </div>
            
            {/* Company Description */}
            <p className="max-w-md mb-4" style={{ color: "var(--text-muted)" }}>
              Revolutionizing the job application process with AI-powered resume optimization.
              Built on AWS serverless architecture for students and professionals.
            </p>
            
            {/* Social Media Links */}
            <div className="flex gap-4">
              {/* GitHub - UPDATE href with your GitHub URL */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <Github className="h-5 w-5" />
              </a>
              
              {/* LinkedIn - UPDATE href with your LinkedIn URL */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <Linkedin className="h-5 w-5" />
              </a>
              
              {/* Email - UPDATE href with your support email */}
              <a
                href="mailto:support@airesume.com"
                className="transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* COLUMN 3: Product Links */}
          {/* ──────────────────────────────────────────────────────── */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>Product</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* COLUMN 4: Legal Links */}
          {/* ──────────────────────────────────────────────────────── */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>Legal</h3>
            <ul className="space-y-2">
              {/* NOTE: placeholder links — replace with real policy pages when ready */}
              <li>
                <a
                  href="#"
                  className="transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BOTTOM BAR - Copyright and Tech Stack */}
        {/* ============================================================ */}
        <div className="pt-8" style={{ borderTop: "1px solid var(--border-muted)" }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              © 2026 AI Resume Enhancer - Team KMR. COMP 2154 Project.
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Built with React, TypeScript, AWS & Amazon Bedrock
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
