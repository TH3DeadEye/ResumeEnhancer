'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Search, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
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

const FILTERS = ['all', 'enhanced', 'parsed', 'processing'] as const;

export default function HistoryPage() {
  const [resumes,       setResumes      ] = useState<Resume[]>([]);
  const [searchQuery,   setSearchQuery  ] = useState('');
  const [filterStatus,  setFilterStatus ] = useState<string>('all');

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = () => {
    const mockResumes: Resume[] = [
      { id: '1', fileName: 'John_Doe_Resume.pdf',           uploadDate: '2026-02-05', status: 'enhanced',   jobTitle: 'Senior Software Engineer', enhancedUrl: '/api/resume/download/1' },
      { id: '2', fileName: 'Resume_Latest.pdf',              uploadDate: '2026-02-04', status: 'parsed' },
      { id: '3', fileName: 'CV_2026.pdf',                    uploadDate: '2026-02-01', status: 'processing' },
      { id: '4', fileName: 'Software_Engineer_Resume.pdf',   uploadDate: '2026-01-28', status: 'enhanced',   jobTitle: 'Full Stack Developer' },
      { id: '5', fileName: 'My_Resume_2026.pdf',             uploadDate: '2026-01-25', status: 'enhanced',   jobTitle: 'Product Manager' },
    ];
    setResumes(mockResumes);
  };

  const filteredResumes = resumes.filter(r => {
    const matchesSearch = r.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const StatusBadge = ({ status }: { status: Resume['status'] }) => {
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
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search
              className="absolute"
              style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', width: '16px', height: '16px', pointerEvents: 'none',
              }}
            />
            <input
              placeholder="Search by filename or job title…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
                backgroundColor: 'var(--bg-sunken)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Filter buttons */}
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
                  style={{
                    backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                    color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 12px',
                  }}
                >
                  {status}
                </FillButton>
              );
            })}
          </div>
        </div>

        {/* Count */}
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
          Showing{' '}
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{filteredResumes.length}</span>
          {' '}of{' '}
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{resumes.length}</span>
          {' '}resumes
        </p>
      </div>

      {/* ── Resume list ── */}
      {filteredResumes.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '64px 24px',
          textAlign: 'center', boxShadow: 'var(--shadow-sm)',
        }}>
          <FileText className="h-10 w-10 mx-auto mb-4" style={{ color: 'var(--text-disabled)' }} />
          <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>No resumes found</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Upload your first resume to get started'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredResumes.map((resume) => (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <FileText className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '2px' }} className="truncate">
                    {resume.fileName}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {new Date(resume.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {resume.jobTitle && <> &middot; {resume.jobTitle}</>}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <StatusBadge status={resume.status} />

                {resume.status === 'enhanced' && (
                  <>
                    <FillButton
                      fillColor="var(--accent)"
                      fillOpacity={0.12}
                      hoverTextColor="var(--accent)"
                      className="inline-flex items-center gap-1.5 text-xs font-medium"
                      style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '7px 13px' }}
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </FillButton>
                    <FillButton
                      className="inline-flex items-center gap-1.5 text-xs font-medium"
                      style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: 'var(--radius-md)', padding: '7px 13px' }}
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </FillButton>
                  </>
                )}

                {resume.status === 'parsed' && (
                  <Link href={`/dashboard/upload?resumeId=${resume.id}`}>
                    <FillButton
                      className="inline-flex items-center gap-1.5 text-xs font-medium"
                      style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: 'var(--radius-md)', padding: '7px 13px' }}
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Enhance
                    </FillButton>
                  </Link>
                )}

                {resume.status === 'processing' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '7px 13px' }}>
                    <Clock className="h-3.5 w-3.5 animate-spin" /> Processing
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
