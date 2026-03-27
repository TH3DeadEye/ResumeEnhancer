'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Search, Sparkles, Clock, X, Check } from 'lucide-react';
import Link from 'next/link';
import { FillButton } from '@/app/components/ui/fill-button';
import { listResumes, downloadEnhancement, type Resume, type DownloadResult } from '@/lib/api';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';

// Map backend status → local display status
type DisplayStatus = 'processing' | 'parsed' | 'enhanced' | 'failed';

function toDisplayStatus(status: Resume['status']): DisplayStatus {
  if (status === 'ENHANCED') return 'enhanced';
  if (status === 'PARSED') return 'parsed';
  if (status === 'FAILED') return 'failed';
  return 'processing'; // uploaded | EXTRACTED
}

const STATUS_CONFIG: Record<DisplayStatus, { label: string; color: string }> = {
  enhanced:   { label: 'Enhanced',  color: 'var(--success)' },
  parsed:     { label: 'Ready',     color: 'var(--accent)'  },
  processing: { label: 'Processing',color: 'var(--warning)' },
  failed:     { label: 'Failed',    color: 'var(--danger)'  },
};

const FILTERS = ['all', 'enhanced', 'parsed', 'processing'] as const;

export default function HistoryPage() {
  const [resumes,       setResumes      ] = useState<Resume[]>([]);
  const [searchQuery,   setSearchQuery  ] = useState('');
  const [filterStatus,  setFilterStatus ] = useState<string>('all');
  const [viewData,      setViewData     ] = useState<DownloadResult | null>(null);
  const [viewLoading,   setViewLoading  ] = useState<string | null>(null); // resume_id being loaded

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    try {
      const data = await listResumes();
      setResumes(data);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
      toast.error('Failed to load resumes');
    }
  };

  const handleView = async (resumeId: string) => {
    try {
      setViewLoading(resumeId);
      const data = await downloadEnhancement(resumeId);
      setViewData(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load enhancement data');
    } finally {
      setViewLoading(null);
    }
  };

  const handleDownload = async (resumeId: string, filename: string) => {
    try {
      setViewLoading(resumeId);
      const data = await downloadEnhancement(resumeId);
      const json = JSON.stringify(data.enhancement, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhancement-${filename.replace('.pdf', '')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Enhancement report downloaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Download failed');
    } finally {
      setViewLoading(null);
    }
  };

  const filteredResumes = resumes.filter(r => {
    const display = toDisplayStatus(r.status);
    const matchesSearch = r.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || display === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const StatusBadge = ({ status }: { status: DisplayStatus }) => {
    const cfg = STATUS_CONFIG[status];
    return (
      <span style={{
        fontSize: '0.6875rem', fontWeight: 600, color: cfg.color,
        backgroundColor: `color-mix(in oklch, ${cfg.color} 12%, transparent)`,
        border: `1px solid ${cfg.color}`,
        borderRadius: '999px', padding: '3px 9px',
        letterSpacing: '0.02em', whiteSpace: 'nowrap',
      }}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Toaster />

      {/* ── Header ── */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          History
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
          All your uploaded and enhanced resumes
        </p>
      </div>

      {/* ── Search + filters ── */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '16px', height: '16px', pointerEvents: 'none' }} />
            <input
              placeholder="Search by filename…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', backgroundColor: 'var(--bg-sunken)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {FILTERS.map((status) => {
              const isActive = filterStatus === status;
              return (
                <FillButton
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  fillColor="var(--accent)"
                  fillOpacity={0.12}
                  hoverTextColor={isActive ? undefined : 'var(--accent)'}
                  className="text-xs font-medium capitalize"
                  style={{ backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent', color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)', border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '6px 12px' }}
                >
                  {status}
                </FillButton>
              );
            })}
          </div>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
          Showing <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{filteredResumes.length}</span> of <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{resumes.length}</span> resumes
        </p>
      </div>

      {/* ── Resume list ── */}
      {filteredResumes.length === 0 ? (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '64px 24px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <FileText className="h-10 w-10 mx-auto mb-4" style={{ color: 'var(--text-disabled)' }} />
          <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>No resumes found</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {searchQuery || filterStatus !== 'all' ? 'Try adjusting your search or filter' : 'Upload your first resume to get started'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredResumes.map((resume) => {
            const display = toDisplayStatus(resume.status);
            const isLoading = viewLoading === resume.resume_id;
            return (
              <div
                key={resume.resume_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}
              >
                {/* File info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <FileText className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '2px' }} className="truncate">
                      {resume.filename}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {new Date(resume.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {resume.overall_score != null && <> &middot; Score: {resume.overall_score}</>}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <StatusBadge status={display} />

                  {display === 'enhanced' && (
                    <>
                      <FillButton
                        onClick={() => handleView(resume.resume_id)}
                        disabled={isLoading}
                        fillColor="var(--accent)"
                        fillOpacity={0.12}
                        hoverTextColor="var(--accent)"
                        className="inline-flex items-center gap-1.5 text-xs font-medium"
                        style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '7px 13px' }}
                      >
                        {isLoading ? <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : <Eye className="h-3.5 w-3.5" />}
                        View
                      </FillButton>
                      <FillButton
                        onClick={() => handleDownload(resume.resume_id, resume.filename)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 text-xs font-medium"
                        style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: 'var(--radius-md)', padding: '7px 13px' }}
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </FillButton>
                    </>
                  )}

                  {display === 'parsed' && (
                    <Link href={`/dashboard/upload?resumeId=${resume.resume_id}`}>
                      <FillButton
                        className="inline-flex items-center gap-1.5 text-xs font-medium"
                        style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: 'var(--radius-md)', padding: '7px 13px' }}
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Enhance
                      </FillButton>
                    </Link>
                  )}

                  {display === 'processing' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '7px 13px' }}>
                      <Clock className="h-3.5 w-3.5 animate-spin" /> Processing
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── View modal ── */}
      {viewData && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'color-mix(in oklch, black 50%, transparent)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setViewData(null)}
        >
          <div
            style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '28px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{viewData.filename}</h2>
              <button onClick={() => setViewData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scores */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Overall', value: viewData.enhancement.overall_score },
                { label: 'ATS Score', value: viewData.enhancement.ats_score },
                { label: 'Job Match', value: viewData.enhancement.job_match_score },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center', padding: '16px 8px', borderRadius: 'var(--radius-md)', backgroundColor: 'color-mix(in oklch, var(--success) 10%, transparent)', border: '1px solid color-mix(in oklch, var(--success) 30%, transparent)' }}>
                  <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)', lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Summary suggestion */}
            {viewData.enhancement.summary_suggestion && (
              <div style={{ marginBottom: '16px', padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-sunken)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested Summary</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{viewData.enhancement.summary_suggestion}</p>
              </div>
            )}

            {/* Top wins */}
            {viewData.enhancement.top_wins.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Top Wins</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {viewData.enhancement.top_wins.map((win, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Check className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{win}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing keywords */}
            {viewData.enhancement.missing_keywords.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Keywords to Add</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {viewData.enhancement.missing_keywords.map((kw, i) => (
                    <span key={i} style={{ fontSize: '0.75rem', fontWeight: 500, padding: '3px 10px', borderRadius: '999px', backgroundColor: 'color-mix(in oklch, var(--warning) 12%, transparent)', color: 'var(--warning)', border: '1px solid color-mix(in oklch, var(--warning) 40%, transparent)' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section feedback */}
            {viewData.enhancement.section_feedback.length > 0 && (
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>Section Feedback</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {viewData.enhancement.section_feedback.map((section, i) => (
                    <div key={i} style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-sunken)', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>{section.section}</p>
                      {section.feedback && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{section.feedback}</p>}
                      {section.suggestions.map((s, j) => (
                        <div key={j} style={{ marginTop: '8px', paddingLeft: '12px', borderLeft: '2px solid var(--accent)' }}>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Original: {s.original}</p>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>→ {s.improved}</p>
                          {s.reason && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>{s.reason}</p>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
