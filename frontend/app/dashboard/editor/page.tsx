'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Plus,
  Redo2,
  Trash2,
  Underline,
  Undo2,
} from 'lucide-react';
import Link from 'next/link';
import { gsap } from '@/app/lib/gsap';
import { downloadEnhancement, type DownloadResult } from '@/lib/api';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ResumeSection {
  id: string;
  name: string;
}

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  justifyLeft: boolean;
  justifyCenter: boolean;
  justifyRight: boolean;
  unorderedList: boolean;
  orderedList: boolean;
}

interface LiveScores {
  overall: number;
  ats: number;
  match: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

const BLANK_SECTIONS: ResumeSection[] = [
  { id: 'header', name: '__header__' },
  { id: uid(),    name: 'Professional Summary' },
  { id: uid(),    name: 'Work Experience' },
  { id: uid(),    name: 'Education' },
  { id: uid(),    name: 'Skills' },
];

const FONT_OPTIONS = [
  { label: 'Georgia',         value: 'Georgia, serif'                  },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Garamond',        value: 'Garamond, "EB Garamond", serif'  },
  { label: 'Arial',           value: 'Arial, Helvetica, sans-serif'    },
  { label: 'Helvetica',       value: 'Helvetica, Arial, sans-serif'    },
  { label: 'Trebuchet MS',    value: '"Trebuchet MS", sans-serif'      },
  { label: 'DM Sans',         value: '"DM Sans", system-ui, sans-serif'},
];

const DEFAULT_FONT = FONT_OPTIONS[0].value;

// Sections where AI suggestions should append as bullets, not replace prose
const BULLET_SECTION_PATTERNS = ['experience', 'project', 'work', 'skill', 'employment', 'achievement', 'certification'];

// Sections where "Add Entry" button shows (inject job/edu template)
const ENTRY_SECTION_PATTERNS   = ['experience', 'work', 'employment', 'project'];
const EDU_SECTION_PATTERNS     = ['education', 'academic', 'school', 'degree'];

function isBulletSection(name: string): boolean {
  const l = name.toLowerCase();
  return BULLET_SECTION_PATTERNS.some((p) => l.includes(p));
}

function isEntrySection(name: string): boolean {
  const l = name.toLowerCase();
  return ENTRY_SECTION_PATTERNS.some((p) => l.includes(p)) || EDU_SECTION_PATTERNS.some((p) => l.includes(p));
}

function isEduSection(name: string): boolean {
  const l = name.toLowerCase();
  return EDU_SECTION_PATTERNS.some((p) => l.includes(p));
}

// Template HTML blocks injected by "Add Entry" button
const JOB_ENTRY_HTML = `
<div data-entry="true" style="margin-bottom:14px">
  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px">
    <span style="font-weight:700;font-family:'Georgia',serif;font-size:11pt">Company Name — Job Title</span>
    <span style="font-style:italic;font-size:10pt;color:#555;white-space:nowrap;margin-left:8px">Month Year – Month Year | City, Province</span>
  </div>
  <ul style="margin:0;padding-left:1.4em">
    <li>Describe your key achievement (Action Verb + Metric + Impact)</li>
  </ul>
</div>`;

const EDU_ENTRY_HTML = `
<div data-entry="true" style="margin-bottom:14px">
  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px">
    <span style="font-weight:700;font-family:'Georgia',serif;font-size:11pt">School Name — Degree, Major</span>
    <span style="font-style:italic;font-size:10pt;color:#555;white-space:nowrap;margin-left:8px">Expected/Grad Year | City, Province</span>
  </div>
  <p style="margin:0;font-size:10pt;color:#444">Relevant coursework, GPA, honors, activities…</p>
</div>`;

// ── Score colour helper ────────────────────────────────────────────────────────

function scoreColor(v: number): string {
  if (v >= 85) return 'var(--success)';
  if (v >= 70) return 'var(--warning)';
  return 'var(--danger)';
}

// ── Toolbar helpers ───────────────────────────────────────────────────────────

function ToolbarSep() {
  return (
    <div
      className="no-print"
      style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)', margin: '0 3px', flexShrink: 0 }}
    />
  );
}

interface TBtnProps {
  title: string;
  active?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

function TBtn({ title, active = false, onMouseDown, children }: TBtnProps) {
  return (
    <button
      title={title}
      onMouseDown={onMouseDown}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '28px', height: '28px', borderRadius: '6px', border: 'none',
        backgroundColor: active ? 'var(--accent-subtle)' : 'transparent',
        color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
        cursor: 'pointer', flexShrink: 0,
        transition: 'background-color 0.12s, color 0.12s',
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-sunken)';
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

// ── SectionBlock ──────────────────────────────────────────────────────────────

interface SectionBlockProps {
  section: ResumeSection;
  isFirst: boolean;
  isLast: boolean;
  renamingId: string | null;
  setRef: (el: HTMLDivElement | null) => void;
  onSaveRange: () => void;
  onDelete: () => void;
  onRenameStart: () => void;
  onRenameCommit: (name: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddEntry?: () => void;
}

function SectionBlock({
  section, isFirst, isLast, renamingId,
  setRef, onSaveRange, onDelete, onRenameStart, onRenameCommit,
  onMoveUp, onMoveDown, onAddEntry,
}: SectionBlockProps) {
  const [hovered,  setHovered ] = useState(false);
  const renameRef              = useRef<HTMLInputElement>(null);
  const isHeader               = section.name === '__header__';
  const isRenaming             = renamingId === section.id;

  useEffect(() => {
    if (isRenaming) renameRef.current?.focus();
  }, [isRenaming]);

  const iconBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '20px', height: '20px', borderRadius: '4px', border: 'none',
    backgroundColor: 'transparent', cursor: 'pointer', padding: 0,
  };

  return (
    <div
      style={{ marginBottom: isHeader ? '24px' : '18px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Section heading (non-header) ── */}
      {!isHeader && (
        <div className="no-print" style={{ marginBottom: '5px' }}>
          {/* Fixed 22px row — title left, controls right — NO layout shift on hover */}
          <div style={{ display: 'flex', alignItems: 'center', height: '22px', gap: '6px' }}>

            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              {isRenaming ? (
                <input
                  ref={renameRef}
                  defaultValue={section.name}
                  onBlur={(e) => onRenameCommit(e.target.value.trim() || section.name)}
                  onKeyDown={(e) => {
                    const v = (e.target as HTMLInputElement).value.trim();
                    if (e.key === 'Enter')  onRenameCommit(v || section.name);
                    if (e.key === 'Escape') onRenameCommit(section.name);
                  }}
                  style={{
                    fontSize: '9pt', fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', fontFamily: "'Georgia', serif",
                    color: 'var(--accent-text)', backgroundColor: 'var(--accent-subtle)',
                    border: '1px solid var(--accent)', borderRadius: '4px',
                    padding: '1px 6px', outline: 'none', width: '100%',
                  }}
                />
              ) : (
                <span
                  onClick={onRenameStart}
                  title="Click to rename"
                  style={{
                    fontSize: '9pt', fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', fontFamily: "'Georgia', serif",
                    color: '#333', cursor: 'text', userSelect: 'none',
                    display: 'block', whiteSpace: 'nowrap', overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {section.name}
                </span>
              )}
            </div>

            {/* Controls — opacity only, never leaves DOM */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0,
                opacity: hovered ? 1 : 0,
                pointerEvents: hovered ? 'auto' : 'none',
                transition: 'opacity 0.15s ease',
              }}
            >
              {onAddEntry && (
                <button
                  onClick={onAddEntry}
                  title={isEduSection(section.name) ? 'Add education entry' : 'Add job entry'}
                  style={{
                    ...iconBtn, width: 'auto', gap: '3px', padding: '0 6px',
                    fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.04em',
                    color: 'white', backgroundColor: 'var(--accent)', borderRadius: '4px',
                  }}
                >
                  <Plus size={9} /> {isEduSection(section.name) ? 'Add School' : 'Add Job'}
                </button>
              )}
              <button onClick={onMoveUp}   disabled={isFirst}  title="Move up"   style={{ ...iconBtn, color: 'var(--text-muted)', opacity: isFirst ? 0.3 : 1 }}><ChevronUp   size={11} /></button>
              <button onClick={onMoveDown} disabled={isLast}   title="Move down" style={{ ...iconBtn, color: 'var(--text-muted)', opacity: isLast  ? 0.3 : 1 }}><ChevronDown size={11} /></button>
              <button onClick={onDelete}                       title="Delete"    style={{ ...iconBtn, color: 'var(--danger)' }}><Trash2      size={10} /></button>
            </div>
          </div>

          {/* Black HR matching the PDF */}
          <div style={{ height: '1.5px', backgroundColor: '#111', marginTop: '3px' }} />
        </div>
      )}

      {/* ── Editable content ── */}
      <div
        ref={setRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        onKeyUp={onSaveRange}
        onMouseUp={onSaveRange}
        onSelect={onSaveRange}
        style={{
          fontSize: isHeader ? 'inherit' : '11pt',
          fontFamily: "'Georgia', serif",
          lineHeight: 1.55,
          color: '#111',
          outline: 'none',
          minHeight: isHeader ? '60px' : '32px',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          borderRadius: '3px',
          padding: '2px 4px',
          margin: '0 -4px',
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLDivElement).style.outline = '2px solid color-mix(in oklch, var(--accent) 22%, transparent)';
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLDivElement).style.outline = 'none';
        }}
      />
    </div>
  );
}

// ── EditorContent ─────────────────────────────────────────────────────────────

function EditorContent() {
  const searchParams = useSearchParams();
  const resumeId     = searchParams.get('resumeId');

  const [loading,            setLoading           ] = useState(!!resumeId);
  const [error,              setError             ] = useState<string | null>(null);
  const [apiData,            setApiData           ] = useState<DownloadResult | null>(null);
  const [sections,           setSections          ] = useState<ResumeSection[]>(BLANK_SECTIONS);
  const [usedKeywords,       setUsedKeywords      ] = useState<Set<string>>(new Set());
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [renamingId,         setRenamingId        ] = useState<string | null>(null);
  const [liveScores,         setLiveScores        ] = useState<LiveScores>({ overall: 0, ats: 0, match: 0 });
  const [formatState,        setFormatState       ] = useState<FormatState>({
    bold: false, italic: false, underline: false,
    justifyLeft: true, justifyCenter: false, justifyRight: false,
    unorderedList: false, orderedList: false,
  });

  const contentRefs    = useRef<Map<string, HTMLDivElement>>(new Map());
  const initializedIds = useRef<Set<string>>(new Set());
  const newSectionIds  = useRef<Set<string>>(new Set());
  const savedRange     = useRef<Range | null>(null);
  const apiDataRef     = useRef<DownloadResult | null>(null);
  const scoreTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const docRef     = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!resumeId) return;
    downloadEnhancement(resumeId)
      .then((result) => {
        apiDataRef.current = result;
        setApiData(result);
        setLiveScores({
          overall: result.enhancement.overall_score,
          ats:     result.enhancement.ats_score,
          match:   result.enhancement.job_match_score,
        });
        const feedbackSections: ResumeSection[] = result.enhancement.section_feedback.map((sf) => ({
          id: uid(),
          name: sf.section,
        }));
        setSections([{ id: 'header', name: '__header__' }, ...feedbackSections]);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [resumeId]);

  // ── Entrance animation ──────────────────────────────────────────────────────

  useEffect(() => {
    if (loading) return;
    const targets = [toolbarRef.current, docRef.current, panelRef.current].filter(Boolean);
    gsap.fromTo(
      targets,
      { opacity: 0, y: 24, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.65, ease: 'power3.out', stagger: 0.08 },
    );
  }, [loading]);

  // ── Live score: MutationObserver on the document canvas ────────────────────
  // No LLM call. Counts how many missing_keywords now appear in the document
  // text and proportionally boosts ATS / Overall scores.
  // Debounced at 600 ms so it doesn't fire on every keystroke.

  const computeScores = useCallback(() => {
    const enh = apiDataRef.current?.enhancement;
    const doc = docRef.current;
    if (!enh || !doc) return;

    const text  = doc.innerText.toLowerCase();
    const total = enh.missing_keywords.length;
    if (total === 0) return;

    const found    = enh.missing_keywords.filter((kw) => text.includes(kw.toLowerCase())).length;
    const coverage = found / total; // 0.0 – 1.0

    // ATS improves by up to 60 % of its remaining gap; Overall by 40 %
    const atsBonus     = Math.round(coverage * (100 - enh.ats_score)     * 0.60);
    const overallBonus = Math.round(coverage * (100 - enh.overall_score) * 0.40);

    setLiveScores({
      overall: Math.min(100, enh.overall_score + overallBonus),
      ats:     Math.min(100, enh.ats_score     + atsBonus),
      match:   enh.job_match_score, // semantic — can't compute locally
    });
  }, []);

  useEffect(() => {
    const doc = docRef.current;
    if (!doc || loading) return;

    const observer = new MutationObserver(() => {
      if (scoreTimer.current) clearTimeout(scoreTimer.current);
      scoreTimer.current = setTimeout(computeScores, 600);
    });

    observer.observe(doc, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      if (scoreTimer.current) clearTimeout(scoreTimer.current);
    };
  }, [loading, computeScores]);

  // ── Format state tracking ───────────────────────────────────────────────────

  useEffect(() => {
    const update = () => {
      try {
        setFormatState({
          bold:          document.queryCommandState('bold'),
          italic:        document.queryCommandState('italic'),
          underline:     document.queryCommandState('underline'),
          justifyLeft:   document.queryCommandState('justifyLeft'),
          justifyCenter: document.queryCommandState('justifyCenter'),
          justifyRight:  document.queryCommandState('justifyRight'),
          unorderedList: document.queryCommandState('insertUnorderedList'),
          orderedList:   document.queryCommandState('insertOrderedList'),
        });
      } catch (_) { /* unsupported browsers */ }
    };
    document.addEventListener('selectionchange', update);
    return () => document.removeEventListener('selectionchange', update);
  }, []);

  // ── Range helpers ───────────────────────────────────────────────────────────

  const saveRange = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  }, []);

  const restoreRange = useCallback(() => {
    const range = savedRange.current;
    if (!range) return;
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }
  }, []);

  // ── Format commands ─────────────────────────────────────────────────────────

  const execFormat = useCallback((command: string, value?: string) => {
    restoreRange();
    document.execCommand(command, false, value ?? undefined);
    saveRange();
  }, [restoreRange, saveRange]);

  // ── Real pt font size (size-7 trick) ────────────────────────────────────────

  const applyFontSize = useCallback((pt: string) => {
    restoreRange();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('fontSize', false, '7');
    const doc = docRef.current;
    if (!doc) return;
    doc.querySelectorAll('font[size="7"]').forEach((el) => {
      const span = document.createElement('span');
      span.style.fontSize = `${pt}pt`;
      span.innerHTML = (el as HTMLElement).innerHTML;
      el.parentNode?.replaceChild(span, el);
    });
    saveRange();
  }, [restoreRange, saveRange]);

  // ── Font family ─────────────────────────────────────────────────────────────

  const applyFontFamily = useCallback((family: string) => {
    restoreRange();
    document.execCommand('fontName', false, family);
    saveRange();
  }, [restoreRange, saveRange]);

  // ── Section init ────────────────────────────────────────────────────────────

  const initSection = useCallback((id: string, name: string, el: HTMLDivElement) => {
    if (initializedIds.current.has(id)) return;
    initializedIds.current.add(id);

    if (newSectionIds.current.has(id)) {
      newSectionIds.current.delete(id);
      gsap.fromTo(el.parentElement ?? el,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
      );
    }

    if (name === '__header__') {
      const raw = apiDataRef.current?.filename;
      const displayName = raw
        ? raw.replace(/\.pdf$/i, '').replace(/[_\-]/g, ' ')
        : 'Your Full Name';
      el.innerHTML = `
        <p style="text-align:center;font-size:22pt;font-weight:700;letter-spacing:-0.01em;font-family:'Georgia',serif;margin:0 0 5px;color:#111">${displayName}</p>
        <p style="text-align:center;font-size:10pt;font-family:'Georgia',serif;color:#333;margin:0">City, Province &nbsp;|&nbsp; your.email@example.com &nbsp;|&nbsp; <span style="color:#1a5fb4;text-decoration:underline">linkedin.com/in/yourprofile</span></p>
      `;
      return;
    }

    const data = apiDataRef.current;

    // Experience / Education sections get a blank job-entry template if no AI data
    if (isEntrySection(name) && (!data || !data.enhancement.section_feedback.find((sf) => sf.section === name))) {
      el.innerHTML = isEduSection(name) ? EDU_ENTRY_HTML : JOB_ENTRY_HTML;
      return;
    }

    if (!data) {
      el.innerHTML = '<ul><li>Add your content here…</li></ul>';
      return;
    }

    const entry = data.enhancement.section_feedback.find((sf) => sf.section === name);
    if (!entry || entry.suggestions.length === 0) {
      el.innerHTML = isEntrySection(name)
        ? (isEduSection(name) ? EDU_ENTRY_HTML : JOB_ENTRY_HTML)
        : '<ul><li>Add your content here…</li></ul>';
      return;
    }

    const improved = entry.suggestions.map((s) => s.improved).filter(Boolean);

    if (!isBulletSection(name)) {
      // Prose section (Summary, Objective, Profile)
      el.innerHTML = `<p style="margin:0">${improved[0] ?? ''}</p>`;
    } else if (isEntrySection(name)) {
      // Work Experience / Projects: job entry template + bullets from AI
      el.innerHTML = `
        <div data-entry="true" style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px">
            <span style="font-weight:700;font-family:'Georgia',serif;font-size:11pt">Company Name — Job Title</span>
            <span style="font-style:italic;font-size:10pt;color:#555;white-space:nowrap;margin-left:8px">Month Year – Month Year | City, Province</span>
          </div>
          <ul style="margin:0;padding-left:1.4em">
            ${improved.map((l) => `<li>${l}</li>`).join('')}
          </ul>
        </div>`;
    } else {
      // Other bullet sections (Skills, etc.)
      el.innerHTML = `<ul style="margin:0;padding-left:1.4em">${improved.map((l) => `<li>${l}</li>`).join('')}</ul>`;
    }
  }, []);

  // ── Add / delete / rename / move sections ───────────────────────────────────

  const addSection = useCallback(() => {
    const id = uid();
    newSectionIds.current.add(id);
    setSections((prev) => [...prev, { id, name: 'New Section' }]);
    setRenamingId(id);
  }, []);

  const deleteSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    contentRefs.current.delete(id);
    initializedIds.current.delete(id);
  }, []);

  const renameSection = useCallback((id: string, name: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
    setRenamingId(null);
  }, []);

  const moveSection = useCallback((id: string, dir: -1 | 1) => {
    setSections((prev) => {
      const idx  = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 1 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  }, []);

  // ── Add job / education entry ───────────────────────────────────────────────

  const addEntry = useCallback((sectionId: string, sectionName: string) => {
    const el = contentRefs.current.get(sectionId);
    if (!el) return;

    const html = isEduSection(sectionName) ? EDU_ENTRY_HTML : JOB_ENTRY_HTML;
    el.insertAdjacentHTML('beforeend', html);

    // Animate the new entry
    const entries = el.querySelectorAll('[data-entry="true"]');
    const last    = entries[entries.length - 1] as HTMLElement | null;
    if (last) {
      gsap.fromTo(last, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    }

    // Move cursor to the end of the new block
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  // ── Keyword insertion ───────────────────────────────────────────────────────

  const insertKeyword = useCallback((keyword: string) => {
    if (usedKeywords.has(keyword)) return;
    restoreRange();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      toast.error('Click inside the resume first, then click a keyword');
      return;
    }

    let inside = false;
    contentRefs.current.forEach((el) => {
      if (el?.contains(sel.getRangeAt(0).commonAncestorContainer)) inside = true;
    });
    if (!inside) {
      toast.error('Click inside a section to place your cursor first');
      return;
    }

    document.execCommand('insertText', false, keyword);
    saveRange();

    // GSAP pulse on the active section
    contentRefs.current.forEach((el) => {
      if (el?.contains(window.getSelection()?.anchorNode ?? null)) {
        gsap.fromTo(el, { scale: 0.997 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
      }
    });

    setUsedKeywords((prev) => new Set([...prev, keyword]));
  }, [usedKeywords, restoreRange, saveRange]);

  // ── Apply AI suggestion ─────────────────────────────────────────────────────
  // Summary: replace full prose content.
  // Work Experience / Skills / Projects: try to replace the matching original
  // bullet; if not found, APPEND as a new <li> so existing content is preserved.

  const applySuggestion = useCallback((
    sectionName: string,
    original: string,
    improved: string,
    id: string,
  ) => {
    if (appliedSuggestions.has(id)) return;

    const section = sections.find((s) => s.name === sectionName);
    if (!section) return;
    const el = contentRefs.current.get(section.id);
    if (!el) return;

    if (!isBulletSection(sectionName)) {
      // Prose replacement (Summary, Objective)
      el.innerHTML = `<p style="margin:0">${improved}</p>`;
    } else {
      // Bullet section: try to find and update the original bullet
      const lis = Array.from(el.querySelectorAll('li'));
      const match = lis.find((li) => li.textContent?.trim() === original.trim());

      if (match) {
        // Replace just the matching bullet in place
        match.textContent = improved;
        gsap.fromTo(match, { backgroundColor: 'color-mix(in oklch, var(--accent) 20%, transparent)' },
          { backgroundColor: 'transparent', duration: 1.1, ease: 'power2.out' });
      } else {
        // Append as a new bullet — find or create a <ul>
        let ul = el.querySelector('ul');
        if (!ul) {
          ul = document.createElement('ul');
          ul.style.margin = '0';
          ul.style.paddingLeft = '1.4em';
          el.appendChild(ul);
        }
        const li = document.createElement('li');
        li.textContent = improved;
        ul.appendChild(li);
        gsap.fromTo(li, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' });
      }
    }

    // Flash the whole section
    gsap.fromTo(
      el,
      { backgroundColor: 'color-mix(in oklch, var(--accent) 12%, transparent)' },
      { backgroundColor: 'transparent', duration: 1.2, ease: 'power2.out' },
    );

    setAppliedSuggestions((prev) => new Set([...prev, id]));
    toast.success(`Applied to ${sectionName}`);
  }, [appliedSuggestions, sections]);

  // ── Print ────────────────────────────────────────────────────────────────────

  const handleDownload = useCallback(() => { window.print(); }, []);

  // ── Loading / error ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '10px' }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--accent)' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Loading resume…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '440px', margin: '48px auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)', fontWeight: 500, marginBottom: '8px' }}>Failed to load resume</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>{error}</p>
        <Link href="/dashboard/history">
          <button style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: 'var(--radius-md)', padding: '9px 20px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', border: 'none' }}>
            Back to History
          </button>
        </Link>
      </div>
    );
  }

  const enhancement        = apiData?.enhancement ?? null;
  const nonHeaderSections  = sections.filter((s) => s.name !== '__header__');
  const baseScores         = { overall: enhancement?.overall_score ?? 0, ats: enhancement?.ats_score ?? 0 };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Toaster />

      {/* Page header */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/dashboard/history"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}
          >
            <ArrowLeft size={15} /> Back
          </Link>
          <span style={{ color: 'var(--border-strong)', fontWeight: 300, fontSize: '1.1rem' }}>|</span>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              Resume Builder
            </h1>
            {apiData?.filename && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>{apiData.filename}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleDownload}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            backgroundColor: 'var(--accent)', color: 'white',
            borderRadius: 'var(--radius-md)', padding: '9px 18px',
            fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', border: 'none',
          }}
        >
          <Download size={14} /> Download PDF
        </button>
      </div>

      {/* Toolbar */}
      <div
        ref={toolbarRef}
        className="no-print"
        style={{
          display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '5px 10px',
          marginBottom: '16px',
          boxShadow: 'var(--shadow-sm)',
          opacity: 0,
        }}
      >
        <TBtn title="Bold (Ctrl+B)"      active={formatState.bold}      onMouseDown={(e) => { e.preventDefault(); execFormat('bold'); }}>      <Bold      size={14} /></TBtn>
        <TBtn title="Italic (Ctrl+I)"    active={formatState.italic}    onMouseDown={(e) => { e.preventDefault(); execFormat('italic'); }}>    <Italic    size={14} /></TBtn>
        <TBtn title="Underline (Ctrl+U)" active={formatState.underline} onMouseDown={(e) => { e.preventDefault(); execFormat('underline'); }}> <Underline size={14} /></TBtn>
        <ToolbarSep />
        <TBtn title="Bullet list"   active={formatState.unorderedList} onMouseDown={(e) => { e.preventDefault(); execFormat('insertUnorderedList'); }}><List        size={14} /></TBtn>
        <TBtn title="Numbered list" active={formatState.orderedList}   onMouseDown={(e) => { e.preventDefault(); execFormat('insertOrderedList'); }}>  <ListOrdered size={14} /></TBtn>
        <ToolbarSep />
        <TBtn title="Align left"   active={formatState.justifyLeft}   onMouseDown={(e) => { e.preventDefault(); execFormat('justifyLeft'); }}>   <AlignLeft   size={14} /></TBtn>
        <TBtn title="Align center" active={formatState.justifyCenter} onMouseDown={(e) => { e.preventDefault(); execFormat('justifyCenter'); }}> <AlignCenter size={14} /></TBtn>
        <TBtn title="Align right"  active={formatState.justifyRight}  onMouseDown={(e) => { e.preventDefault(); execFormat('justifyRight'); }}>  <AlignRight  size={14} /></TBtn>
        <ToolbarSep />
        <select
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => applyFontSize(e.target.value)}
          defaultValue="11"
          title="Font size"
          style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', padding: '3px 5px', cursor: 'pointer', width: '62px' }}
        >
          {['9','10','11','12','14','16','18','20','24'].map((pt) => (
            <option key={pt} value={pt}>{pt}pt</option>
          ))}
        </select>
        <ToolbarSep />
        <select
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => applyFontFamily(e.target.value)}
          defaultValue={DEFAULT_FONT}
          title="Font family"
          style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', padding: '3px 5px', cursor: 'pointer', width: '112px' }}
        >
          {FONT_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <ToolbarSep />
        <TBtn title="Undo (Ctrl+Z)" active={false} onMouseDown={(e) => { e.preventDefault(); execFormat('undo'); }}><Undo2 size={14} /></TBtn>
        <TBtn title="Redo (Ctrl+Y)" active={false} onMouseDown={(e) => { e.preventDefault(); execFormat('redo'); }}><Redo2 size={14} /></TBtn>
        <ToolbarSep />
        <button
          onMouseDown={(e) => { e.preventDefault(); addSection(); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)',
            backgroundColor: 'transparent', border: '1px solid var(--border)',
            borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
          }}
        >
          <Plus size={12} /> Add Section
        </button>
      </div>

      {/* Document + AI panel */}
      <div style={{ display: 'grid', gridTemplateColumns: enhancement ? '1fr 340px' : '1fr', gap: '20px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>

        {/* Document canvas */}
        <div style={{ minWidth: 0, display: 'flex', justifyContent: 'center' }}>
          <div
            id="resume-document"
            ref={docRef}
            style={{
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              padding: '52px 64px',
              width: '100%',
              maxWidth: '816px',
              minHeight: '1056px',
              fontFamily: "'Georgia', serif",
              fontSize: '11pt',
              lineHeight: 1.55,
              opacity: 0,
            }}
          >
            {sections.map((section) => {
              const nhIdx = nonHeaderSections.findIndex((s) => s.id === section.id);
              return (
                <SectionBlock
                  key={section.id}
                  section={section}
                  isFirst={nhIdx === 0}
                  isLast={nhIdx === nonHeaderSections.length - 1}
                  renamingId={renamingId}
                  setRef={(el) => {
                    if (el) {
                      contentRefs.current.set(section.id, el);
                      initSection(section.id, section.name, el);
                    } else {
                      contentRefs.current.delete(section.id);
                    }
                  }}
                  onSaveRange={saveRange}
                  onDelete={() => deleteSection(section.id)}
                  onRenameStart={() => setRenamingId(section.id)}
                  onRenameCommit={(name) => renameSection(section.id, name)}
                  onMoveUp={() => moveSection(section.id, -1)}
                  onMoveDown={() => moveSection(section.id, 1)}
                  onAddEntry={isEntrySection(section.name) ? () => addEntry(section.id, section.name) : undefined}
                />
              );
            })}
          </div>
        </div>

        {/* AI sidebar */}
        {enhancement && (
          <div
            ref={panelRef}
            className="no-print"
            style={{
              minWidth: 0,
              position: 'sticky',
              top: '72px',
              maxHeight: 'calc(100vh - 88px)',
              overflowY: 'auto',
              wordBreak: 'break-word',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              opacity: 0,
            }}
          >
            {/* Live score strip */}
            <div style={{
              backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '14px',
            }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Live Score
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {([
                  { label: 'Overall', live: liveScores.overall, base: baseScores.overall },
                  { label: 'ATS',     live: liveScores.ats,     base: baseScores.ats     },
                  { label: 'Match',   live: liveScores.match,   base: liveScores.match   },
                ] as { label: string; live: number; base: number }[]).map(({ label, live, base }) => {
                  const delta = live - base;
                  const col   = scoreColor(live);
                  return (
                    <div key={label} style={{
                      textAlign: 'center', padding: '10px 4px', borderRadius: 'var(--radius-md)',
                      backgroundColor: `color-mix(in oklch, ${col} 10%, transparent)`,
                      border: `1px solid color-mix(in oklch, ${col} 30%, transparent)`,
                    }}>
                      <p style={{ fontSize: '1.375rem', fontWeight: 700, color: col, lineHeight: 1 }}>{live}</p>
                      {delta > 0 && (
                        <p style={{ fontSize: '0.6rem', color: 'var(--success)', fontWeight: 600, lineHeight: 1, marginTop: '2px' }}>+{delta}</p>
                      )}
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '3px' }}>{label}</p>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.4 }}>
                Updates as you add keywords. Job Match reflects your original upload.
              </p>
            </div>

            {/* Missing keywords */}
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>Missing Keywords</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Click to insert at cursor position</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {enhancement.missing_keywords.map((kw) => {
                  const used = usedKeywords.has(kw);
                  return (
                    <button
                      key={kw}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => insertKeyword(kw)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        borderRadius: '999px', padding: '4px 10px',
                        fontSize: '0.75rem', fontWeight: 500,
                        cursor: used ? 'default' : 'pointer', userSelect: 'none',
                        backgroundColor: used
                          ? 'color-mix(in oklch, var(--success) 12%, transparent)'
                          : 'var(--accent-subtle)',
                        border: `1px solid ${used ? 'var(--success)' : 'transparent'}`,
                        color: used ? 'var(--success)' : 'var(--accent-text)',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      {used ? <Check size={10} /> : <Plus size={10} />}
                      {kw}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI suggestions */}
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>AI Suggestions</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Summary: replaces content. Experience / Skills: adds or updates bullet.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {enhancement.section_feedback.map((sec, si) =>
                  sec.suggestions.map((sug, sgi) => {
                    const id      = `${si}-${sgi}`;
                    const applied = appliedSuggestions.has(id);
                    return (
                      <div
                        key={id}
                        style={{
                          backgroundColor: applied ? 'color-mix(in oklch, var(--success) 8%, transparent)' : 'var(--bg-sunken)',
                          border: `1px solid ${applied ? 'var(--success)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-md)', padding: '12px',
                          transition: 'border-color 0.25s, background-color 0.25s',
                        }}
                      >
                        <span style={{
                          display: 'inline-block', fontSize: '0.625rem', fontWeight: 700,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          color: 'var(--accent-text)', backgroundColor: 'var(--accent-subtle)',
                          borderRadius: '999px', padding: '2px 7px', marginBottom: '6px',
                        }}>
                          {sec.section}
                        </span>
                        <p style={{
                          fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.55,
                          marginBottom: '6px',
                          display: '-webkit-box', WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {sug.improved}
                        </p>
                        {sug.reason && (
                          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px', lineHeight: 1.4 }}>
                            {sug.reason}
                          </p>
                        )}
                        <button
                          onClick={() => applySuggestion(sec.section, sug.original, sug.improved, id)}
                          disabled={applied}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '0.75rem', fontWeight: 500, border: 'none',
                            borderRadius: 'var(--radius-md)', padding: '5px 12px',
                            cursor: applied ? 'default' : 'pointer',
                            backgroundColor: applied ? 'color-mix(in oklch, var(--success) 12%, transparent)' : 'var(--accent)',
                            color: applied ? 'var(--success)' : 'white',
                            outline: applied ? '1px solid var(--success)' : 'none',
                          }}
                        >
                          {applied ? <><Check size={11} /> Applied</> : 'Apply'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Export ─────────────────────────────────────────────────────────────────────

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '10px' }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--accent)' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Loading…</span>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
