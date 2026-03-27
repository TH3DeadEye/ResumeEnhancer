'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Plus, Download, ChevronRight, AlertCircle } from 'lucide-react';
import { gsap } from '@/app/lib/gsap';
import { downloadEnhancement, type DownloadResult, type EnhancementResult } from '@/lib/api';

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

/** Build initial editor content from real section_feedback data. */
function buildInitialContent(enhancement: EnhancementResult): Record<string, string> {
  const content: Record<string, string> = {};
  for (const section of enhancement.section_feedback) {
    content[section.section] = section.suggestions.map((s) => s.original).join('\n\n');
  }
  return content;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EditorPage() {
  const searchParams = useSearchParams();
  const resumeId     = searchParams.get('resumeId');

  const [data,    setData   ] = useState<DownloadResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState<string | null>(null);

  const [usedKeywords,        setUsedKeywords       ] = useState<Set<string>>(new Set());
  const [appliedSuggestions,  setAppliedSuggestions ] = useState<Set<string>>(new Set());

  // Section content refs — contentEditable divs
  const sectionRefs  = useRef<Map<string, HTMLDivElement>>(new Map());

  // Panel refs for entrance animation
  const leftPanelRef  = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // ── Fetch data on mount ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!resumeId) {
      setError('No resume ID provided. Please go back to the results page.');
      setLoading(false);
      return;
    }

    downloadEnhancement(resumeId)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load enhancement data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load enhancement data.');
        setLoading(false);
      });
  }, [resumeId]);

  // ── Entrance animation — runs after data is ready ────────────────────────────

  useEffect(() => {
    if (!data) return;
    const els = [leftPanelRef.current, rightPanelRef.current].filter(Boolean);
    gsap.fromTo(
      els,
      { opacity: 0, y: 32, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', stagger: 0.12 }
    );
  }, [data]);

  // ── Keyword insertion ─────────────────────────────────────────────────────────

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

    gsap.fromTo(span, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });

    // After 2s fade background back to plain text, then unwrap span
    setTimeout(() => {
      span.style.backgroundColor = 'transparent';
      span.style.color           = 'inherit';
      setTimeout(() => {
        if (span.parentNode) {
          const text = document.createTextNode(span.textContent ?? keyword);
          span.parentNode.replaceChild(text, span);
        }
      }, 500);
    }, 2000);

    setUsedKeywords((prev) => new Set([...prev, keyword]));
  }, [usedKeywords]);

  // ── Apply AI suggestion ───────────────────────────────────────────────────────

  const applySuggestion = useCallback(
    (sectionName: string, improved: string, id: string) => {
      if (appliedSuggestions.has(id) || !data) return;

      const el = sectionRefs.current.get(sectionName);
      if (!el) return;

      const current  = el.innerText ?? '';
      const original = data.enhancement.section_feedback
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
    [appliedSuggestions, data]
  );

  // ── PDF download ──────────────────────────────────────────────────────────────

  const handleDownload = useCallback(() => {
    if (typeof window !== 'undefined') window.print();
  }, []);

  // ── Loading state ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Loading editor…
        </p>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────────

  if (error || !data) {
    return (
      <div style={{ maxWidth: '600px', margin: '64px auto', padding: '32px', backgroundColor: 'var(--bg-surface)', border: '1px solid color-mix(in oklch, var(--danger) 40%, transparent)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <AlertCircle style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} size={20} />
        <div>
          <p style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '6px' }}>Unable to load editor</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {error ?? 'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  // ── Derive editor content from real data ──────────────────────────────────────

  const enhancement    = data.enhancement;
  const sections       = enhancement.section_feedback.map((s) => s.section);
  const initialContent = buildInitialContent(enhancement);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', minHeight: '100%' }}>

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
            <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
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
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)'; }}
          >
            <Download size={14} />
            Download PDF
          </button>
        </div>

        {/* Editable sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {sections.map((name) => (
            <div key={name}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {name}
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--border)', marginBottom: '10px' }} />
              <div
                ref={(el) => { if (el) sectionRefs.current.set(name, el); }}
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
                onFocus={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-subtle)'; }}
                onBlur={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
                dangerouslySetInnerHTML={{ __html: initialContent[name] ?? '' }}
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
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.01em' }}>
            Suggested Keywords
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Click to insert at cursor position
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {enhancement.missing_keywords.map((kw) => {
              const used = usedKeywords.has(kw);
              return (
                <div
                  key={kw}
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
                    backgroundColor: used ? 'color-mix(in oklch, var(--success) 12%, transparent)' : 'var(--accent-subtle)',
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
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.01em' }}>
            AI Suggestions
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Apply improvements directly to each section
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {enhancement.section_feedback.map((sec, si) =>
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
                    {sug.reason && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px', lineHeight: 1.5 }}>
                        {sug.reason}
                      </p>
                    )}

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
                        backgroundColor: applied ? 'color-mix(in oklch, var(--success) 12%, transparent)' : 'var(--accent)',
                        color: applied ? 'var(--success)' : 'white',
                        border: `1px solid ${applied ? 'var(--success)' : 'transparent'}`,
                      }}
                      onMouseEnter={(e) => {
                        if (!applied) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!applied) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)';
                      }}
                    >
                      {applied ? <><Check size={12} /> Applied</> : <>Apply <ChevronRight size={12} /></>}
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
