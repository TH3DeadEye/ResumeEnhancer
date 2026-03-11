'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Download, Eye, Sparkles, Upload } from 'lucide-react';
import Link from 'next/link';
import { gsap } from '@/app/lib/gsap';
import { FillButton } from '@/app/components/ui/fill-button';

interface Resume {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'processing' | 'parsed' | 'enhanced' | 'failed';
  jobTitle?: string;
  enhancedUrl?: string;
}

const STATUS_CONFIG = {
  enhanced:   { label: 'Enhanced',  color: 'var(--success)' },
  parsed:     { label: 'Ready',     color: 'var(--accent)'  },
  processing: { label: 'Processing',color: 'var(--warning)' },
  failed:     { label: 'Failed',    color: 'var(--danger)'  },
};

export default function DashboardPage() {
  const [userName, setUserName] = useState('User');
  const [resumes,  setResumes]  = useState<Resume[]>([]);
  const [stats,    setStats]    = useState({ total: 0, enhanced: 0 });

  const headerRef  = useRef<HTMLDivElement>(null);
  const listRef    = useRef<HTMLDivElement>(null);

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
    const mockResumes: Resume[] = [
      { id: '1', fileName: 'John_Doe_Resume.pdf',         uploadDate: '2026-02-05', status: 'enhanced',   jobTitle: 'Senior Software Engineer', enhancedUrl: '/api/resume/download/1' },
      { id: '2', fileName: 'Resume_Latest.pdf',            uploadDate: '2026-02-04', status: 'parsed' },
      { id: '3', fileName: 'CV_2026.pdf',                  uploadDate: '2026-02-01', status: 'processing' },
    ];
    setResumes(mockResumes);
    setStats({ total: mockResumes.length, enhanced: mockResumes.filter(r => r.status === 'enhanced').length });
  };

  const StatusBadge = ({ status }: { status: Resume['status'] }) => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ── Header row ── */}
      <div
        ref={headerRef}
        style={{ opacity: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}
      >
        <div>
          <h1
            style={{
              fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '6px',
            }}
          >
            Welcome back, {userName}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            {userName}&apos;s workspace&nbsp;&middot;&nbsp;{stats.total} resume{stats.total !== 1 ? 's' : ''}&nbsp;&middot;&nbsp;{stats.enhanced} enhanced
          </p>
        </div>

        <Link href="/dashboard/upload">
          <FillButton
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '10px 20px',
            }}
          >
            <Upload className="h-4 w-4" />
            Upload Resume
          </FillButton>
        </Link>
      </div>

      {/* ── Recent Resumes ── */}
      <div ref={listRef} style={{ opacity: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Recent Resumes
          </h2>
          <Link href="/dashboard/history">
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--accent-text)',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-text)'; }}
            >
              View all
            </span>
          </Link>
        </div>

        {resumes.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 24px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <FileText className="h-10 w-10 mx-auto mb-4" style={{ color: 'var(--text-disabled)' }} />
            <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>No resumes yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
              Upload your first resume to get started
            </p>
              <Link href="/dashboard/upload">
                <FillButton
                  className="inline-flex items-center gap-2 text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 20px',
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Upload Your First Resume
                </FillButton>
              </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                }}
              >
                {/* File info */}
                <div className="flex items-center gap-12 flex-1 min-w-0">
                  <FileText className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div className="min-w-0">
                    <p
                      className="truncate"
                      style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '2px' }}
                    >
                      {resume.fileName}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {new Date(resume.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {resume.jobTitle && <> &middot; {resume.jobTitle}</>}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={resume.status} />

                  {resume.status === 'enhanced' && (
                    <div className="flex gap-2">
                      <FillButton
                            fillColor="var(--accent)"
                            fillOpacity={0.12}
                            hoverTextColor="var(--accent)"
                            className="inline-flex items-center gap-1.5 text-xs font-medium"
                            style={{
                              backgroundColor: 'transparent',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-md)',
                              padding: '7px 13px',
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </FillButton>
                          <FillButton
                            className="inline-flex items-center gap-1.5 text-xs font-medium"
                            style={{
                              backgroundColor: 'var(--accent)',
                              color: 'white',
                              borderRadius: 'var(--radius-md)',
                              padding: '7px 13px',
                            }}
                          >
                            <Download className="h-3.5 w-3.5" /> Download
                          </FillButton>
                    </div>
                  )}

                  {resume.status === 'parsed' && (
                    <Link href={`/dashboard/upload?resumeId=${resume.id}`}>
                      <FillButton
                        className="inline-flex items-center gap-1.5 text-xs font-medium"
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: 'white',
                          borderRadius: 'var(--radius-md)',
                          padding: '7px 13px',
                        }}
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Enhance
                      </FillButton>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
