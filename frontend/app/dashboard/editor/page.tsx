'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Check, Plus, Download, ChevronRight } from 'lucide-react';
import { gsap } from '@/app/lib/gsap';

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

// ── Mock data — replace with real API / router state ──────────────────────────

const MOCK_ENHANCEMENT: Enhancement = {
  overall_score: 75,
  ats_score: 82,
  job_match_score: 88,
  summary_suggestion:
    'Consider leading with a concise professional summary that highlights your 5+ years in cloud infrastructure, key AWS certifications, and measurable impact.',
  section_feedback: [
    {
      section: 'Summary',
      score: 60,
      suggestions: [
        {
          original: 'Experienced developer looking for new opportunities.',
          improved:
            'Full-stack engineer with 5+ years building scalable cloud-native applications on AWS. Specialized in React, Node.js, and DevOps automation — with a track record of shipping products that serve 100K+ users.',
          reason: 'A generic summary wastes prime real-estate. Recruiters need level, specialization, and impact.',
        },
      ],
    },
    {
      section: 'Work Experience',
      score: 85,
      suggestions: [
        {
          original: 'Worked on backend services and helped improve system performance.',
          improved:
            'Architected and optimized RESTful backend services using Node.js and AWS Lambda, reducing API response time by 38% and cutting infrastructure costs by $12K/year.',
          reason: 'Quantified impact and specified technologies make this ATS-friendly.',
        },
        {
          original: 'Led a team of developers.',
          improved:
            'Led a cross-functional team of 6 engineers across 3 time zones, shipping 4 major product milestones on schedule with zero critical post-launch defects.',
          reason: 'Adding team size, scope, and outcomes verifies leadership experience.',
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
          reason: 'ATS parsers favor structured skill lists with specific tool names.',
        },
      ],
    },
  ],
  missing_keywords: ['AWS', 'TypeScript', 'CI/CD', 'Docker', 'Agile', 'Kubernetes'],
  top_wins: [
    'Strong quantification throughout Work Experience',
    'Education section is well-formatted',
  ],
};

// Initial resume content — matches the `original` text from suggestions
const INITIAL_CONTENT: Record<string, string> = {
  Summary: 'Experienced developer looking for new opportunities.',
  'Work Experience':
    'Worked on backend services and helped improve system performance.\n\nLed a team of developers.',
  Education:
    'Bachelor of Science in Computer Science\nUniversity of Technology, 2019',
  Skills: 'JavaScript, CSS, HTML, some AWS experience',
};

// Ordered sections displayed in the left panel
const SECTIONS = ['Summary', 'Work Experience', 'Education', 'Skills'] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Flash an element's background using CSS transition (respects CSS vars). */
function flashElement(el: HTMLElement) {
  el.style.transition = '';
  el.style.backgroundColor = 'var(--accent-subtle)';
  requestAnimationFrame(() => {
    el.style.transition = 'background-color 1s ease';
    setTimeout(() => {
      el.style.backgroundColor = 'transparent';
      setTimeout(() => { el.style.transition = ''; }, 1000);
    }, 600);
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EditorPage() {
  const [usedKeywords, setUsedKeywords]             = useState<Set<string>>(new Set());
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  // Section content refs — contentEditable divs
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Panel refs for entrance animation
  const leftPanelRef  = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // ── Entrance animation ───────────────────────────────────────────────────────

  useEffect(() => {
    const els = [leftPanelRef.current, rightPanelRef.current].filter(Boolean);
    gsap.fromTo(
      els,
      { opacity: 0, y: 32, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', stagger: 0.12 }
    );
  }, []);

  // ── Keyword insertion ────────────────────────────────────────────────────────

  const insertKeyword = useCallback((keyword: string) => {
    if (usedKeywords.has(keyword)) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    // Verify cursor is inside one of our editable sections
    let insideEditor = false;
    sectionRefs.current.forEach((el) => {
      if (el && el.contains(range.commonAncestorContainer)) insideEditor = true;
    });
    if (!insideEditor) return;

    // Build highlighted span
    const span = document.createElement('span');
    span.textContent = keyword;
    span.style.backgroundColor  = 'var(--accent-subtle)';
    span.style.color             = 'var(--accent-text)';
    span.style.borderRadius      = '4px';
    span.style.padding           = '0 4px';
    span.style.display           = 'inline';
    span.style.opacity           = '0';
    span.style.transition        = 'background-color 0.5s ease, color 0.5s ease';

    range.deleteContents();
    range.insertNode(span);
    range.setStartAfter(span);
    range.setEndAfter(span);
    sel.removeAllRanges();
    sel.addRange(range);

    // GSAP fromTo opacity 0 → 1
    gsap.fromTo(span, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });

    // After 2s: fade background back to normal text
    setTimeout(() => {
      span.style.backgroundColor = 'transparent';
      span.style.color           = 'inherit';
      // After transition completes, unwrap span → plain text node
      setTimeout(() => {
        if (span.parentNode) {
          const text = document.createTextNode(span.textContent ?? keyword);
          span.parentNode.replaceChild(text, span);
        }
      }, 500);
    }, 2000);

    setUsedKeywords((prev) => new Set([...prev, keyword]));
  }, [usedKeywords]);

  // ── Apply AI suggestion ──────────────────────────────────────────────────────

  const applySuggestion = useCallback(
    (sectionName: string, improved: string, id: string) => {
      if (appliedSuggestions.has(id)) return;

      const el = sectionRefs.current.get(sectionName);
      if (!el) return;

      const current = el.innerText ?? '';
      // Try to find and replace the matching line; fall back to full replace
      const original = MOCK_ENHANCEMENT.section_feedback
        .flatMap((s) => s.suggestions)
        .find((s) => s.improved === improved)?.original ?? '';

      if (original && current.includes(original)) {
        el.innerText = current.replace(original, improved);
      } else {
        el.innerText = improved;
      }

      flashElement(el);
      setAppliedSuggestions((prev) => new Set([...prev, id]));
    },
    [appliedSuggestions]
  );

  // ── PDF download ─────────────────────────────────────────────────────────────

  const handleDownload = useCallback(() => {
    if (typeof window !== 'undefined') window.print();
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-start',
        minHeight: '100%',
      }}
    >
      {/* ── LEFT PANEL — editable resume ── */}
      <div
        ref={leftPanelRef}
        style={{
          flex: '0 0 60%',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          opacity: 0,
        }}
        className="resume-left-panel"
      >
        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Resume Editor
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Click any section to edit · Keywords insert at cursor
            </p>
          </div>

          <button
            onClick={handleDownload}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--accent)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '9px 18px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)';
            }}
          >
            <Download size={14} />
            Download PDF
          </button>
        </div>

        {/* Editable sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {SECTIONS.map((name) => (
            <div key={name}>
              {/* Section label */}
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: '8px',
                }}
              >
                {name}
              </div>

              {/* Section divider */}
              <div style={{ height: '1px', backgroundColor: 'var(--border)', marginBottom: '10px' }} />

              {/* ContentEditable section */}
              <div
                ref={(el) => {
                  if (el) sectionRefs.current.set(name, el);
                }}
                contentEditable
                suppressContentEditableWarning
                spellCheck
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  outline: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px',
                  minHeight: '2.5em',
                  whiteSpace: 'pre-wrap',
                  transition: 'background-color 0.2s ease',
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-subtle)';
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                }}
                dangerouslySetInnerHTML={{ __html: INITIAL_CONTENT[name] ?? '' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — keywords + suggestions ── */}
      <div
        ref={rightPanelRef}
        style={{
          flex: '0 0 calc(40% - 24px)',
          position: 'sticky',
          top: '80px',
          maxHeight: 'calc(100vh - 96px)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          opacity: 0,
        }}
      >
        {/* ── Keywords panel ── */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '4px',
              letterSpacing: '-0.01em',
            }}
          >
            Suggested Keywords
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Click to insert at cursor position
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {MOCK_ENHANCEMENT.missing_keywords.map((kw) => {
              const used = usedKeywords.has(kw);
              return (
                <div
                  key={kw}
                  // onMouseDown with preventDefault keeps contentEditable focused
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertKeyword(kw)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    borderRadius: '999px',
                    padding: '5px 11px',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: used ? 'default' : 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
                    backgroundColor: used
                      ? 'color-mix(in oklch, var(--success) 12%, transparent)'
                      : 'var(--accent-subtle)',
                    border: `1px solid ${used ? 'var(--success)' : 'transparent'}`,
                    color: used ? 'var(--success)' : 'var(--accent-text)',
                  }}
                >
                  {used ? <Check size={11} /> : <Plus size={11} />}
                  {kw}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── AI Suggestions panel ── */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '4px',
              letterSpacing: '-0.01em',
            }}
          >
            AI Suggestions
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Apply improvements directly to each section
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {MOCK_ENHANCEMENT.section_feedback.map((sec, si) =>
              sec.suggestions.map((sug, sgi) => {
                const id      = `${si}-${sgi}`;
                const applied = appliedSuggestions.has(id);

                return (
                  <div
                    key={id}
                    style={{
                      backgroundColor: applied
                        ? 'color-mix(in oklch, var(--success) 8%, transparent)'
                        : 'var(--bg-subtle)',
                      border: `1px solid ${applied ? 'var(--success)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      transition: 'border-color 0.3s ease, background-color 0.3s ease',
                    }}
                  >
                    {/* Section badge */}
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--accent-text)',
                        backgroundColor: 'var(--accent-subtle)',
                        borderRadius: '999px',
                        padding: '2px 8px',
                        marginBottom: '8px',
                      }}
                    >
                      {sec.section}
                    </span>

                    {/* Improved text preview */}
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        marginBottom: '10px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {sug.improved}
                    </p>

                    {/* Reason hint */}
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                        marginBottom: '12px',
                        lineHeight: 1.5,
                      }}
                    >
                      {sug.reason}
                    </p>

                    {/* Apply button */}
                    <button
                      onClick={() => applySuggestion(sec.section, sug.improved, id)}
                      disabled={applied}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-md)',
                        padding: '6px 14px',
                        cursor: applied ? 'default' : 'pointer',
                        transition: 'background-color 0.2s ease, color 0.2s ease',
                        backgroundColor: applied
                          ? 'color-mix(in oklch, var(--success) 12%, transparent)'
                          : 'var(--accent)',
                        color: applied ? 'var(--success)' : 'white',
                        border: `1px solid ${applied ? 'var(--success)' : 'transparent'}`,
                      }}
                      onMouseEnter={(e) => {
                        if (!applied) {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!applied) {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)';
                        }
                      }}
                    >
                      {applied ? (
                        <><Check size={12} /> Applied</>
                      ) : (
                        <>Apply <ChevronRight size={12} /></>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
