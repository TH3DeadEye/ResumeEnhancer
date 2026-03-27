'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Plus, ChevronDown, ChevronUp, AlertCircle, Pencil } from 'lucide-react';
import { gsap, ScrollTrigger } from '@/app/lib/gsap';
import { downloadEnhancement, type DownloadResult, type SectionFeedback } from '@/lib/api';

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
  const [display, setDisplay] = useState(0);
  const circleRef             = useRef<SVGCircleElement>(null);

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
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--border)" strokeWidth="7" />
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
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
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
  const searchParams = useSearchParams();
  const router       = useRouter();
  const resumeId     = searchParams.get('resumeId');

  const [data,    setData   ] = useState<DownloadResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState<string | null>(null);

  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set());
  const chipRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));

  const scoreRowRef = useRef<HTMLDivElement>(null);
  const winsRef     = useRef<HTMLDivElement>(null);
  const keywordsRef = useRef<HTMLDivElement>(null);
  const summaryRef  = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // ── Fetch real data ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!resumeId) {
      setError('No resume ID provided. Please go back and enhance a resume first.');
      setLoading(false);
      return;
    }

    downloadEnhancement(resumeId)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load enhancement results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load enhancement results.');
        setLoading(false);
      });
  }, [resumeId]);

  // ── Section entrance animations ─────────────────────────────────────────────

  useEffect(() => {
    if (!data) return;

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
  }, [data]);

  // ── Keyword click handler ────────────────────────────────────────────────────

  const handleKeywordClick = useCallback((keyword: string) => {
    if (addedKeywords.has(keyword)) return;

    const el = chipRefs.current.get(keyword);
    if (el) {
      gsap.fromTo(
        el,
        { scale: 0.95, boxShadow: '0 0 0 3px var(--accent)' },
        { scale: 1, boxShadow: '0 0 0 0px transparent', duration: 0.4, ease: 'back.out(2)' }
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

  // ── Loading state ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Loading your enhancement results…
        </p>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────

  if (error || !data) {
    return (
      <div style={{ maxWidth: '600px', margin: '64px auto', padding: '32px', backgroundColor: 'var(--bg-surface)', border: '1px solid color-mix(in oklch, var(--danger) 40%, transparent)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <AlertCircle style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} size={20} />
        <div>
          <p style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '6px' }}>Unable to load results</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {error ?? 'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const enhancement = data.enhancement;

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
        <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
          AI Analysis
        </p>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Resume Enhancement Results
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          {data.job_description_provided ? 'Tailored to your job description' : 'General enhancement'}
          {data.enhanced_at && (
            <>{' '}· {new Date(data.enhanced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
          )}
        </p>
      </div>

      {/* ── 1. SCORE ROW ── */}
      <div ref={scoreRowRef} style={{ opacity: 0 }}>
        <SectionCard>
          <div
            className="flex flex-col sm:flex-row"
            style={{ justifyContent: 'space-around', alignItems: 'center', gap: '32px', padding: '8px 0' }}
          >
            <ScoreRing score={enhancement.overall_score}   label="Overall Score" delay={0.3} />
            <ScoreRing score={enhancement.ats_score}       label="ATS Score"     delay={0.6} />
            <ScoreRing score={enhancement.job_match_score} label="Job Match"     delay={0.9} />
          </div>
        </SectionCard>
      </div>

      {/* ── 2. TOP WINS ── */}
      {enhancement.top_wins.length > 0 && (
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
                  <Check size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 500 }}>{win}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── 3. MISSING KEYWORDS ── */}
      {enhancement.missing_keywords.length > 0 && (
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
                    ref={(el) => { if (el) chipRefs.current.set(kw, el); }}
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
                      backgroundColor: isAdded ? 'color-mix(in oklch, var(--success) 12%, transparent)' : 'var(--accent-subtle)',
                      border: `1px solid ${isAdded ? 'var(--success)' : 'transparent'}`,
                      color: isAdded ? 'var(--success)' : 'var(--accent-text)',
                    }}
                  >
                    {isAdded ? <Check size={12} style={{ flexShrink: 0 }} /> : <Plus size={12} style={{ flexShrink: 0 }} />}
                    {kw}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── 4. SUMMARY SUGGESTION ── */}
      {enhancement.summary_suggestion && (
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
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9375rem', lineHeight: 1.75 }}>
              &ldquo;{enhancement.summary_suggestion}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* ── 5. SECTION FEEDBACK ACCORDION ── */}
      {enhancement.section_feedback.length > 0 && (
        <div ref={feedbackRef} style={{ opacity: 0 }}>
          <SectionHeader label="Section by Section" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {enhancement.section_feedback.map((section: SectionFeedback, idx: number) => {
              const isOpen = openSections.has(idx);
              return (
                <div
                  key={section.section}
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
                >
                  {/* Accordion header */}
                  <button
                    onClick={() => toggleSection(idx)}
                    aria-expanded={isOpen}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', backgroundColor: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-subtle)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {section.section}
                      </span>
                      {section.score !== undefined && <ScoreBadge score={section.score} />}
                    </div>
                    {isOpen
                      ? <ChevronUp  size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      : <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    }
                  </button>

                  {/* Accordion body */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {section.feedback && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          {section.feedback}
                        </p>
                      )}
                      {section.suggestions.map((sug, si) => (
                        <div key={si} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                              <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-disabled)', marginBottom: '6px' }}>
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
                              <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-text)', marginBottom: '6px' }}>
                                After
                              </p>
                              <p style={{ fontSize: '0.8125rem', color: 'var(--accent-text)', lineHeight: 1.6 }}>
                                {sug.improved}
                              </p>
                            </div>
                          </div>

                          {/* Why */}
                          {sug.reason && (
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>
                              <span style={{ fontStyle: 'normal', fontWeight: 500 }}>Why: </span>
                              {sug.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 6. OPEN IN EDITOR CTA ── */}
      {resumeId && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '32px 24px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
            Ready to apply these suggestions?
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Open the editor to apply AI suggestions and insert missing keywords directly into your resume.
          </p>
          <button
            onClick={() => router.push(`/dashboard/editor?resumeId=${resumeId}`)}
            style={{
              marginTop: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--accent)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '11px 24px',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)'; }}
          >
            <Pencil size={15} />
            Open in Editor
          </button>
        </div>
      )}
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
