'use client';

import { useState, useCallback } from 'react';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Upload, FileText, Check, AlertCircle, Download, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import { FillButton } from '@/app/components/ui/fill-button';
import { uploadResume, pollResumeStatus, enhanceResume, downloadEnhancement, type EnhancementResult } from '@/lib/api';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'enhancing' | 'complete' | 'error';

// ── Shared styles ─────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '28px',
  boxShadow: 'var(--shadow-sm)',
};

export default function UploadPage() {
  const [file,              setFile            ] = useState<File | null>(null);
  const [jobDescription,    setJobDescription  ] = useState('');
  const [uploadStatus,      setUploadStatus    ] = useState<UploadStatus>('idle');
  const [uploadProgress,    setUploadProgress  ] = useState(0);
  const [resumeId,          setResumeId        ] = useState<string | null>(null);
  const [enhancedUrl,       setEnhancedUrl     ] = useState<string | null>(null);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  const [dragActive,        setDragActive      ] = useState(false);

  // ── Drag handlers ─────────────────────────────────────────────────────────

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setFile(selectedFile);
    setUploadStatus('idle');
    toast.success('File selected');
  };

  // ── Action handlers ───────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!file) { toast.error('Please select a file first'); return; }
    try {
      setUploadStatus('uploading');
      setUploadProgress(30);

      const { resume_id } = await uploadResume(file);
      setResumeId(resume_id);
      setUploadProgress(60);

      setUploadStatus('processing');
      await pollResumeStatus(resume_id, ['PARSED', 'ENHANCED']);
      setUploadProgress(100);
      setUploadStatus('complete');
      toast.success('Resume parsed successfully');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast.error(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    }
  };

  const handleEnhance = async () => {
    if (!jobDescription.trim()) { toast.error('Please enter a job description'); return; }
    if (!resumeId) { toast.error('No resume uploaded yet'); return; }
    try {
      setUploadStatus('enhancing');
      const result = await enhanceResume(resumeId, jobDescription);
      setEnhancementResult(result);
      setEnhancedUrl('done');
      setUploadStatus('complete');
      toast.success('Resume enhanced successfully');
    } catch (error) {
      console.error('Enhancement error:', error);
      setUploadStatus('error');
      toast.error(error instanceof Error ? error.message : 'Enhancement failed. Please try again.');
    }
  };

  const handleDownload = async () => {
    if (!resumeId) return;
    try {
      const data = enhancementResult ?? (await downloadEnhancement(resumeId)).enhancement;
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhancement-${resumeId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Enhancement data downloaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Download failed');
    }
  };

  const resetForm = () => {
    setFile(null);
    setJobDescription('');
    setUploadStatus('idle');
    setUploadProgress(0);
    setResumeId(null);
    setEnhancedUrl(null);
    setEnhancementResult(null);
  };

  const getStepStatus = (step: number) => {
    if (step === 1 && (uploadStatus === 'uploading' || uploadStatus === 'processing')) return 'active';
    if (step === 1 && (uploadStatus === 'complete' || uploadStatus === 'enhancing' || enhancedUrl)) return 'complete';
    if (step === 2 && uploadStatus === 'enhancing') return 'active';
    if (step === 2 && enhancedUrl) return 'complete';
    return 'pending';
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Toaster />

      {/* ── Header ── */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Upload Resume
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
          Upload your resume and let AI tailor it for any job
        </p>
      </div>

      {/* ── Progress steps ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {[1, 2].map((step) => {
          const status = getStepStatus(step);
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: '0.8125rem',
                  backgroundColor: status === 'complete' ? 'var(--success)' : status === 'active' ? 'var(--accent)' : 'var(--bg-sunken)',
                  color: status === 'pending' ? 'var(--text-muted)' : 'white',
                  border: `2px solid ${status === 'pending' ? 'var(--border)' : 'transparent'}`,
                  transition: 'all 0.3s ease',
                }}>
                  {status === 'complete' ? <Check className="h-4 w-4" /> : step}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {step === 1 ? 'Upload Resume' : 'Enhance with AI'}
                </span>
              </div>
              {step < 2 && (
                <div style={{
                  width: '48px', height: '2px', borderRadius: '1px',
                  backgroundColor: getStepStatus(2) !== 'pending' ? 'var(--success)' : 'var(--border)',
                  transition: 'background-color 0.3s ease',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Upload ── */}
      {!enhancedUrl && (
        <div style={{
          ...card,
          borderColor: getStepStatus(1) === 'active' ? 'var(--accent)' : 'var(--border)',
          transition: 'border-color 0.2s ease',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload className="h-4 w-4" style={{ color: 'var(--accent)' }} />
              Step 1 — Upload Your Resume
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              PDF file, max 10 MB
            </p>
          </div>

          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              position: 'relative',
              border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: dragActive ? 'var(--accent-subtle)' : 'var(--bg-sunken)',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              pointerEvents: (uploadStatus !== 'idle' && !!file) ? 'none' : 'auto',
              opacity: (uploadStatus !== 'idle' && !!file) ? 0.6 : 1,
            }}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              disabled={uploadStatus !== 'idle' && !!file}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '16px', borderRadius: '50%',
                backgroundColor: 'var(--accent-subtle)',
              }}>
                {file ? (
                  <FileText className="h-8 w-8" style={{ color: 'var(--accent)' }} />
                ) : (
                  <Upload className="h-8 w-8" style={{ color: 'var(--accent)' }} />
                )}
              </div>
              {file ? (
                <>
                  <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{file.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Drop your PDF here or click to browse</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>PDF files up to 10 MB</p>
                </>
              )}
            </div>
          </div>

          {/* Upload progress */}
          {uploadStatus === 'uploading' && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ height: '4px', borderRadius: '2px', backgroundColor: 'var(--bg-sunken)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, backgroundColor: 'var(--accent)', transition: 'width 0.2s ease', borderRadius: '2px' }} />
              </div>
            </div>
          )}

          {uploadStatus === 'processing' && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
              <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>Processing resume…</p>
            </div>
          )}

          {/* Action buttons */}
          {file && uploadStatus === 'idle' && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <FillButton
                onClick={handleUpload}
                className="inline-flex items-center justify-center gap-2 text-sm font-medium flex-1"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 20px',
                }}
              >
                <Upload className="h-4 w-4" />
                Upload to Cloud
              </FillButton>
              <FillButton
                onClick={() => setFile(null)}
                fillColor="var(--accent)"
                fillOpacity={0.12}
                hoverTextColor="var(--accent)"
                className="inline-flex items-center gap-1.5 text-sm font-medium"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                }}
              >
                <X className="h-4 w-4" /> Clear
              </FillButton>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Job Description ── */}
      {(uploadStatus === 'complete' || uploadStatus === 'enhancing' || enhancedUrl) && (
        <div style={{
          ...card,
          borderColor: getStepStatus(2) === 'active' ? 'var(--accent)' : 'var(--border)',
          transition: 'border-color 0.2s ease',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles className="h-4 w-4" style={{ color: 'var(--accent)' }} />
              Step 2 — Add Job Description
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Paste the job posting to tailor your resume
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Label htmlFor="jobDescription" style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              Job Description
            </Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the full job description here including requirements, responsibilities, and qualifications…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12}
              disabled={uploadStatus === 'enhancing' || !!enhancedUrl}
              style={{
                backgroundColor: 'var(--bg-sunken)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                resize: 'none',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {uploadStatus === 'enhancing' && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
              <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>AI is enhancing your resume…</p>
            </div>
          )}

          {!enhancedUrl && uploadStatus !== 'enhancing' && (
            <FillButton
              onClick={handleEnhance}
              disabled={!jobDescription.trim()}
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium mt-5"
              style={{
                backgroundColor: jobDescription.trim() ? 'var(--accent)' : 'var(--bg-sunken)',
                color: jobDescription.trim() ? 'white' : 'var(--text-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 20px',
                cursor: jobDescription.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              <Sparkles className="h-4 w-4" />
              Enhance with AI
            </FillButton>
          )}
        </div>
      )}

      {/* ── Success card ── */}
      {enhancedUrl && enhancementResult && (
        <div style={{ ...card, borderColor: 'var(--success)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Check className="h-5 w-5" />
            Resume Enhanced Successfully
          </h2>

          {/* Score grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Overall', value: enhancementResult.overall_score },
              { label: 'ATS Score', value: enhancementResult.ats_score },
              { label: 'Job Match', value: enhancementResult.job_match_score },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center', padding: '16px 8px', borderRadius: 'var(--radius-md)', backgroundColor: 'color-mix(in oklch, var(--success) 10%, transparent)', border: '1px solid color-mix(in oklch, var(--success) 30%, transparent)' }}>
                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Top wins */}
          {enhancementResult.top_wins.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Top Wins</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {enhancementResult.top_wins.slice(0, 3).map((win, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{win}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing keywords */}
          {enhancementResult.missing_keywords.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Keywords to Add</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {enhancementResult.missing_keywords.slice(0, 10).map((kw, i) => (
                  <span key={i} style={{ fontSize: '0.75rem', fontWeight: 500, padding: '3px 10px', borderRadius: '999px', backgroundColor: 'color-mix(in oklch, var(--warning) 12%, transparent)', color: 'var(--warning)', border: '1px solid color-mix(in oklch, var(--warning) 40%, transparent)' }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <FillButton
              onClick={handleDownload}
              className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium"
              style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: 'var(--radius-md)', padding: '10px 20px' }}
            >
              <Download className="h-4 w-4" />
              Download Enhancement Report
            </FillButton>
            <FillButton
              onClick={resetForm}
              fillColor="var(--accent)"
              fillOpacity={0.12}
              hoverTextColor="var(--accent)"
              className="inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 16px' }}
            >
              Upload Another
            </FillButton>
          </div>
        </div>
      )}

      {/* ── Error card ── */}
      {uploadStatus === 'error' && (
        <div style={{
          ...card,
          borderColor: 'color-mix(in oklch, var(--danger), transparent 40%)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <AlertCircle className="h-7 w-7 flex-shrink-0" style={{ color: 'var(--danger)' }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 500, color: 'var(--danger)', marginBottom: '4px' }}>Something went wrong</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Please try again or contact support if the issue persists.
            </p>
          </div>
          <FillButton
            onClick={resetForm}
            fillColor="var(--danger)"
            fillOpacity={0.12}
            hoverTextColor="var(--danger)"
            className="text-sm font-medium flex-shrink-0"
            style={{ backgroundColor: 'transparent', color: 'var(--danger)', border: '1px solid color-mix(in oklch, var(--danger), transparent 40%)', borderRadius: 'var(--radius-md)', padding: '8px 16px' }}
          >
            Try Again
          </FillButton>
        </div>
      )}
    </div>
  );
}
