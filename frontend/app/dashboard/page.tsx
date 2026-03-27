'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Download, Eye, Sparkles, Upload, Check, X } from 'lucide-react';
import Link from 'next/link';
import { gsap } from '@/app/lib/gsap';
import { FillButton } from '@/app/components/ui/fill-button';
import { listResumes, downloadEnhancement, type Resume, type DownloadResult } from '@/lib/api';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';

type DisplayStatus = 'processing' | 'parsed' | 'enhanced' | 'failed';

function toDisplayStatus(status: Resume['status']): DisplayStatus {
  if (status === 'ENHANCED') return 'enhanced';
  if (status === 'PARSED') return 'parsed';
  if (status === 'FAILED') return 'failed';
  return 'processing';
}

const STATUS_CONFIG: Record<DisplayStatus, { label: string; color: string }> = {
  enhanced:   { label: 'Enhanced',  color: 'var(--success)' },
  parsed:     { label: 'Ready',     color: 'var(--accent)'  },
  processing: { label: 'Processing',color: 'var(--warning)' },
  failed:     { label: 'Failed',    color: 'var(--danger)'  },
};

export default function DashboardPage() {
  const [userName,    setUserName   ] = useState('User');
  const [resumes,     setResumes    ] = useState<Resume[]>([]);
  const [stats,       setStats      ] = useState({ total: 0, enhanced: 0 });
  const [viewData,    setViewData   ] = useState<DownloadResult | null>(null);
  const [viewLoading, setViewLoading] = useState<string | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const listRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserData();
    fetchResumes();
  }, []);

  useEffect(() => {
    const els = [headerRef.current, listRef.current].filter(Boolean);
    gsap.fromTo(
      els,
      { opacity: 0, y: 32, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', stagger: 0.12 }
    );
  }, []);

  const loadUserData = async () => {
    try {
      const { getUserInfo } = await import('@/lib/auth-service');
      const result = await getUserInfo();
      if (result.success && result.result) {
        setUserName(result.result.name || result.result.email?.split('@')[0] || 'User');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const fetchResumes = async () => {
    try {
      const data = await listResumes();
      setResumes(data);
      setStats({
        total: data.length,
        enhanced: data.filter((r) => r.status === 'ENHANCED').length,
      });
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
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

  const StatusBadge = ({ status }: { status: DisplayStatus }) => {
    const cfg = STATUS_CONFIG[status];
    return (
      <span
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: cfg.color,
          backgroundColor: `color-mix(in oklch, ${cfg.color} 12%, transparent)`,
          border: `1px solid ${cfg.color}`,
          borderRadius: '999px',
          padding: '3px 9px',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        {cfg.label}
      </span>
    );
  };

  // Show only the 5 most recent resumes on the dashboard
  const recentResumes = resumes.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Toaster />

      {/* ── Header row ── */}
      <div
        ref={headerRef}
        style={{ opacity: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}
      >
        <div>
          <h1 style={{ fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '6px' }}>
            Welcome back, {userName}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            {userName}&apos;s workspace&nbsp;&middot;&nbsp;{stats.total} resume{stats.total !== 1 ? 's' : ''}&nbsp;&middot;&nbsp;{stats.enhanced} enhanced
          </p>
        </div>

        <Link href="/dashboard/upload">
          <FillButton
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: 'var(--radius-md)', padding: '10px 20px' }}
          >
            <Upload className="h-4 w-4" />
            Upload Resume
          </FillButton>
        </Link>
      </div>

      {/* ── Recent Resumes ── */}
      <div ref={listRef} style={{ opacity: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Recent Resumes
          </h2>
          <Link href="/dashboard/history">
            <span
              style={{ fontSize: '0.8125rem', color: 'var(--accent-text)', fontWeight: 500, cursor: 'pointer' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-text)'; }}
            >
              View all
            </span>
          </Link>
        </div>

        {recentResumes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <FileText className="h-10 w-10 mx-auto mb-4" style={{ color: 'var(--text-disabled)' }} />
            <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>No resumes yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
              Upload your first resume to get started
            </p>
            <Link href="/dashboard/upload">
              <FillButton
                className="inline-flex items-center gap-2 text-sm font-medium"
                style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: 'var(--radius-md)', padding: '10px 20px' }}
              >
                <Upload className="h-4 w-4" />
                Upload Your First Resume
              </FillButton>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentResumes.map((resume) => {
              const display = toDisplayStatus(resume.status);
              const isLoading = viewLoading === resume.resume_id;
              return (
                <div
                  key={resume.resume_id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}
                >
                  {/* File info */}
                  <div className="flex items-center gap-12 flex-1 min-w-0">
                    <FileText className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <div className="min-w-0">
                      <p className="truncate" style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '2px' }}>
                        {resume.filename}
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {new Date(resume.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {resume.overall_score != null && <> &middot; Score: {resume.overall_score}</>}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={display} />

                    {display === 'enhanced' && (
                      <div className="flex gap-2">
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
                      </div>
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{viewData.filename}</h2>
              <button onClick={() => setViewData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                <X className="h-5 w-5" />
              </button>
            </div>

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

            {viewData.enhancement.summary_suggestion && (
              <div style={{ marginBottom: '16px', padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-sunken)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested Summary</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{viewData.enhancement.summary_suggestion}</p>
              </div>
            )}

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
