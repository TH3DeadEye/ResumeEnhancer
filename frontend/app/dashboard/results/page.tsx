'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Check, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { gsap, ScrollTrigger } from '@/app/lib/gsap';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Suggestion {
  original: string;
  improved: string;
  reason: string;
}

interface SectionFeedback {
  section: string;
  score: number;
  suggestions: Suggestion[];
}

interface Enhancement {
  overall_score: number;
  ats_score: number;
  job_match_score: number;
  summary_suggestion: string;
  section_feedback: SectionFeedback[];
  missing_keywords: string[];
  top_wins: string[];
}

interface EnhancementResult {
  user_id: string;
  resume_id: string;
  job_description_provided: boolean;
  enhancement: Enhancement;
  enhanced_at: string;
}

// ── Mock data (replace with real API response) ─────────────────────────────────

const MOCK: EnhancementResult = {
  user_id: 'demo-user',
  resume_id: 'demo-resume-001',
  job_description_provided: true,
  enhancement: {
    overall_score: 75,
    ats_score: 82,
    job_match_score: 88,
    summary_suggestion:
      'Consider leading with a concise professional summary that highlights your 5+ years in cloud infrastructure, key AWS certifications, and measurable impact. Recruiters spend ~6 seconds on a first pass — a strong opening line significantly increases callback rates.',
    section_feedback: [
      {
        section: 'Work Experience',
        score: 85,
        suggestions: [
          {
            original:
              'Worked on backend services and helped improve system performance.',
            improved:
              'Architected and optimized RESTful backend services using Node.js and AWS Lambda, reducing API response time by 38% and cutting infrastructure costs by $12K/year.',
            reason:
              'Quantified impact and specified technologies make this line ATS-friendly and compelling to reviewers.',
          },
          {
            original: 'Led a team of developers.',
            improved:
              'Led a cross-functional team of 6 engineers across 3 time zones, shipping 4 major product milestones on schedule with zero critical post-launch defects.',
            reason:
              'Adding team size, scope, and outcomes transforms a vague claim into verifiable leadership experience.',
          },
        ],
      },
      {
        section: 'Skills',
        score: 70,
        suggestions: [
          {
            original: 'JavaScript, CSS, HTML, some AWS experience',
            improved:
              'TypeScript · React · Node.js · AWS (EC2, Lambda, S3, RDS) · Docker · PostgreSQL · REST APIs · CI/CD (GitHub Actions)',
            reason:
              'ATS parsers favor structured skill lists with specific tool names over vague descriptions like "some experience".',
          },
        ],
      },
      {
        section: 'Summary',
        score: 60,
        suggestions: [
          {
            original: 'Experienced developer looking for new opportunities.',
            improved:
              'Full-stack engineer with 5+ years building scalable cloud-native applications on AWS. Specialized in React, Node.js, and DevOps automation — with a track record of shipping products that serve 100K+ users.',
            reason:
              'A generic summary wastes prime real-estate. Recruiters need to see your level, specialization, and impact in the first two lines.',
          },
        ],
      },
    ],
    missing_keywords: ['AWS', 'TypeScript', 'CI/CD', 'Docker', 'Agile', 'Kubernetes'],
    top_wins: [
      'Strong quantification throughout the Work Experience section',
      'Education section is well-formatted and clearly presented',
      'Projects section demonstrates practical, job-relevant skills',
    ],
  },
  enhanced_at: new Date().toISOString(),
};

// ── ScoreRing sub-component ────────────────────────────────────────────────────

const R = 36;
const CIRCUMFERENCE = 2 * Math.PI * R;

function ScoreRing({
  score,
  label,
  delay = 0,
}: {
  score: number;
  label: string;
  delay?: number;
}) {
  const [display, setDisplay]     = useState(0);
  const circleRef                 = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const anim = gsap.to({}, {
      duration: 1.5,
      delay,
      ease: 'power2.out',
      onUpdate: function () {
        const p   = this.progress();
        const cur = Math.round(p * score);
        setDisplay(cur);
        if (circleRef.current) {
          circleRef.current.style.strokeDashoffset = String(
            CIRCUMFERENCE * (1 - (p * score) / 100)
          );
        }
      },
      onComplete: () => {
        setDisplay(score);
        if (circleRef.current) {
          circleRef.current.style.strokeDashoffset = String(
            CIRCUMFERENCE * (1 - score / 100)
          );
        }
      },
    });
    return () => { anim.kill(); };
  }, [score, delay]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
        <svg viewBox="0 0 100 100" width="120" height="120" aria-label={`${label}: ${score}`}>
          {/* Background track */}
          <circle
            cx="50" cy="50" r={R}
            fill="none"
            stroke="var(--border)"
            strokeWidth="7"
          />
          {/* Progress arc */}
          <circle
            ref={circleRef}
            cx="50" cy="50" r={R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            transform="rotate(-90 50 50)"
            style={{ transition: 'none' }}
          />
        </svg>

        {/* Number overlaid in center */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: '1.625rem',
              fontWeight: 700,
              color: 'var(--accent)',
              lineHeight: 1,
            }}
          >
            {display}
          </span>
        </div>
      </div>

      <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
        {label}
      </span>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const data       = MOCK;
  const { enhancement } = data;

  // Keyword "added" tracking
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set());
  const chipRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Accordion open state
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));

  // Refs for ScrollTrigger section animations
  const scoreRowRef    = useRef<HTMLDivElement>(null);
  const winsRef        = useRef<HTMLDivElement>(null);
  const keywordsRef    = useRef<HTMLDivElement>(null);
  const summaryRef     = useRef<HTMLDivElement>(null);
  const feedbackRef    = useRef<HTMLDivElement>(null);

  // ── Section entrance animations ─────────────────────────────────────────────

  useEffect(() => {
    const sections = [
      scoreRowRef.current,
      winsRef.current,
      keywordsRef.current,
      summaryRef.current,
      feedbackRef.current,
    ].filter(Boolean) as HTMLElement[];

    sections.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 32, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: 'power3.out',
          delay: i * 0.12,
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  // ── Keyword click handler ────────────────────────────────────────────────────

  const handleKeywordClick = useCallback((keyword: string) => {
    if (addedKeywords.has(keyword)) return;

    const el = chipRefs.current.get(keyword);
    if (el) {
      gsap.fromTo(
        el,
        { scale: 0.95, boxShadow: '0 0 0 3px var(--accent)' },
        {
          scale: 1,
          boxShadow: '0 0 0 0px transparent',
          duration: 0.4,
          ease: 'back.out(2)',
        }
      );
    }

    setAddedKeywords(prev => new Set([...prev, keyword]));
  }, [addedKeywords]);

  // ── Accordion toggle ─────────────────────────────────────────────────────────

  const toggleSection = (idx: number) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) { next.delete(idx); } else { next.add(idx); }
      return next;
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 0 64px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
      }}
    >
      {/* Page header */}
      <div>
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '6px',
          }}
        >
          AI Analysis
        </p>
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          Resume Enhancement Results
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          {data.job_description_provided ? 'Tailored to your job description' : 'General enhancement'}{' '}
          · {new Date(data.enhanced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* ── 1. SCORE ROW ── */}
      <div ref={scoreRowRef} style={{ opacity: 0 }}>
        <SectionCard>
          <div
            className="flex flex-col sm:flex-row"
            style={{ justifyContent: 'space-around', alignItems: 'center', gap: '32px', padding: '8px 0' }}
          >
            <ScoreRing score={enhancement.overall_score}  label="Overall Score" delay={0.3} />
            <ScoreRing score={enhancement.ats_score}      label="ATS Score"     delay={0.6} />
            <ScoreRing score={enhancement.job_match_score} label="Job Match"    delay={0.9} />
          </div>
        </SectionCard>
      </div>

      {/* ── 2. TOP WINS ── */}
      <div ref={winsRef} style={{ opacity: 0 }}>
        <SectionHeader label="What's working" />
        <SectionCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {enhancement.top_wins.map((win, i) => (
              <div
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'color-mix(in oklch, var(--success) 12%, transparent)',
                  border: '1px solid var(--success)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 14px',
                  alignSelf: 'flex-start',
                }}
              >
                <Check
                  size={14}
                  style={{ color: 'var(--success)', flexShrink: 0 }}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 500 }}>
                  {win}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── 3. MISSING KEYWORDS ── */}
      <div ref={keywordsRef} style={{ opacity: 0 }}>
        <SectionHeader label="Keywords to add" />
        <SectionCard>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Click a keyword to mark it as added to your resume.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {enhancement.missing_keywords.map((kw) => {
              const isAdded = addedKeywords.has(kw);
              return (
                <div
                  key={kw}
                  ref={(el) => {
                    if (el) chipRefs.current.set(kw, el);
                  }}
                  onClick={() => handleKeywordClick(kw)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '999px',
                    padding: '6px 12px',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: isAdded ? 'default' : 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease',
                    backgroundColor: isAdded
                      ? 'color-mix(in oklch, var(--success) 12%, transparent)'
                      : 'var(--accent-subtle)',
                    border: `1px solid ${isAdded ? 'var(--success)' : 'transparent'}`,
                    color: isAdded ? 'var(--success)' : 'var(--accent-text)',
                  }}
                >
                  {isAdded
                    ? <Check size={12} style={{ flexShrink: 0 }} />
                    : <Plus  size={12} style={{ flexShrink: 0 }} />
                  }
                  {kw}
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* ── 4. SUMMARY SUGGESTION ── */}
      <div ref={summaryRef} style={{ opacity: 0 }}>
        <SectionHeader label="AI Summary" />
        <div
          style={{
            backgroundColor: 'var(--bg-sunken)',
            borderLeft: '3px solid var(--accent)',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            padding: '20px 24px',
          }}
        >
          <p
            style={{
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
              fontSize: '0.9375rem',
              lineHeight: 1.75,
            }}
          >
            &ldquo;{enhancement.summary_suggestion}&rdquo;
          </p>
        </div>
      </div>

      {/* ── 5. SECTION FEEDBACK ACCORDION ── */}
      <div ref={feedbackRef} style={{ opacity: 0 }}>
        <SectionHeader label="Section by Section" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {enhancement.section_feedback.map((section, idx) => {
            const isOpen = openSections.has(idx);
            return (
              <div
                key={section.section}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                }}
              >
                {/* Accordion header */}
                <button
                  onClick={() => toggleSection(idx)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 24px',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {section.section}
                    </span>
                    <ScoreBadge score={section.score} />
                  </div>
                  {isOpen
                    ? <ChevronUp  size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    : <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  }
                </button>

                {/* Accordion body */}
                {isOpen && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border)',
                      padding: '20px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                    }}
                  >
                    {section.suggestions.map((sug, si) => (
                      <div key={si} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Before / After diff cards */}
                        <div className="flex flex-col sm:flex-row" style={{ gap: '8px' }}>
                          {/* Before */}
                          <div
                            style={{
                              flex: 1,
                              backgroundColor: 'var(--bg-sunken)',
                              borderLeft: '3px solid color-mix(in oklch, var(--danger) 55%, transparent)',
                              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                              padding: '14px 16px',
                            }}
                          >
                            <p
                              style={{
                                fontSize: '0.625rem',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: 'var(--text-disabled)',
                                marginBottom: '6px',
                              }}
                            >
                              Before
                            </p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                              {sug.original}
                            </p>
                          </div>

                          {/* After */}
                          <div
                            style={{
                              flex: 1,
                              backgroundColor: 'var(--accent-subtle)',
                              borderLeft: '3px solid var(--accent)',
                              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                              padding: '14px 16px',
                            }}
                          >
                            <p
                              style={{
                                fontSize: '0.625rem',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: 'var(--accent-text)',
                                marginBottom: '6px',
                              }}
                            >
                              After
                            </p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--accent-text)', lineHeight: 1.6 }}>
                              {sug.improved}
                            </p>
                          </div>
                        </div>

                        {/* Why */}
                        <p
                          style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic',
                            paddingLeft: '4px',
                          }}
                        >
                          <span style={{ fontStyle: 'normal', fontWeight: 500 }}>Why: </span>
                          {sug.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ── Shared mini-components ─────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <h2
      style={{
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '12px',
        letterSpacing: '-0.01em',
      }}
    >
      {label}
    </h2>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';
  const bg    = score >= 80
    ? 'color-mix(in oklch, var(--success) 12%, transparent)'
    : score >= 60
    ? 'color-mix(in oklch, var(--warning) 12%, transparent)'
    : 'color-mix(in oklch, var(--danger) 12%, transparent)';

  return (
    <span
      style={{
        fontSize: '0.6875rem',
        fontWeight: 600,
        color,
        backgroundColor: bg,
        border: `1px solid ${color}`,
        borderRadius: '999px',
        padding: '2px 8px',
        lineHeight: 1.5,
      }}
    >
      {score}
    </span>
  );
}
