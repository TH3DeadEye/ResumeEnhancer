/**
 * API client for ResumeEnhancer backend (API Gateway).
 * All requests are authenticated via Cognito IdToken from AWS Amplify.
 */

import { getAuthToken } from './auth-service';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.warn('NEXT_PUBLIC_API_URL is not set. API calls will fail.');
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Resume {
  resume_id: string;
  filename: string;
  uploaded_at: string;
  updated_at?: string;
  overall_score?: number;
  ats_score?: number;
  // upload.py writes 'uploaded' (lowercase); all other lambdas write uppercase
  status: 'uploaded' | 'EXTRACTED' | 'PARSED' | 'ENHANCED' | 'FAILED';
}

export interface BulletSuggestion {
  original: string;
  improved: string;
  reason: string;
}

export interface SectionFeedback {
  section: string;
  feedback?: string;
  suggestions: BulletSuggestion[];
}

// Returned directly by POST /resume/enhance
export interface EnhancementResult {
  message?: string;
  resume_id: string;
  enhanced_s3_key?: string;
  enhanced_at?: string;
  overall_score: number;
  ats_score: number;
  job_match_score: number;
  summary_suggestion: string;
  section_feedback: SectionFeedback[];
  missing_keywords: string[];
  top_wins: string[];
}

// Returned by GET /resume/download
export interface DownloadResult {
  resume_id?: string;
  filename: string;
  status: string;
  enhanced_at?: string;
  job_description_provided?: boolean;
  enhancement: EnhancementResult;
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function authHeaders(): Promise<Record<string, string>> {
  const tokenResult = await getAuthToken();
  if (!tokenResult.success || !tokenResult.result) {
    throw new Error('Not authenticated. Please sign in.');
  }
  return {
    Authorization: `Bearer ${tokenResult.result}`,
  };
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(body.message || `API error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ── API Functions ──────────────────────────────────────────────────────────

/**
 * Upload a PDF resume to S3 via API Gateway.
 * Converts the file to base64 and sends as JSON — the proxy buffers the full
 * body before forwarding so large files don't trigger ECONNRESET on API Gateway.
 */
export async function uploadResume(file: File): Promise<{ resume_id: string }> {
  const headers = await authHeaders();
  const arrayBuffer = await file.arrayBuffer();
  // Convert to base64 in chunks to avoid call-stack overflow on large files
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  const response = await fetch(`${API_URL}/resume/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      file_data: base64,
      filename: file.name,
      content_type: 'application/pdf',
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(body.message || `Upload failed (${response.status})`);
  }

  return response.json();
}

/**
 * Trigger AI enhancement for an already-uploaded resume.
 * Resume must have status PARSED before this can be called.
 */
export async function enhanceResume(
  resumeId: string,
  jobDescription: string,
): Promise<EnhancementResult> {
  return apiFetch<EnhancementResult>('/resume/enhance', {
    method: 'POST',
    body: JSON.stringify({ resume_id: resumeId, job_description: jobDescription }),
  });
}

/**
 * List all resumes for the authenticated user, newest first.
 */
export async function listResumes(): Promise<Resume[]> {
  const data = await apiFetch<{ resumes: Resume[] }>('/resume/list');
  return data.resumes ?? [];
}

/**
 * Fetch the full enhancement result for a resume.
 * Resume must have status ENHANCED.
 */
export async function downloadEnhancement(resumeId: string): Promise<DownloadResult> {
  return apiFetch<DownloadResult>(
    `/resume/download?resume_id=${encodeURIComponent(resumeId)}`,
  );
}

/**
 * Poll the resume list until the given resume_id reaches one of the terminal
 * statuses. Resolves with the final Resume object. Rejects after maxAttempts.
 */
export async function pollResumeStatus(
  resumeId: string,
  terminalStatuses: Resume['status'][],
  intervalMs = 3000,
  maxAttempts = 20,
): Promise<Resume> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const resumes = await listResumes();
    const resume = resumes.find((r) => r.resume_id === resumeId);
    if (resume?.status === 'FAILED') {
      throw new Error('Resume processing failed on the server.');
    }
    if (resume && terminalStatuses.includes(resume.status)) {
      return resume;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error('Timed out waiting for resume to be ready.');
}
