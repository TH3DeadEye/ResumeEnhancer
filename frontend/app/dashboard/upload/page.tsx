'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { Upload, FileText, Check, AlertCircle, Download, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'enhancing' | 'complete' | 'error';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setUploadStatus('idle');
    toast.success('File selected successfully');
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploadStatus('processing');
            setTimeout(() => {
              setUploadStatus('complete');
              toast.success('Resume parsed successfully!');
            }, 2000);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast.error('Upload failed. Please try again.');
    }
  };

  const handleEnhance = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    try {
      setUploadStatus('enhancing');
      
      // Simulate enhancement
      setTimeout(() => {
        setEnhancedUrl('/mock-enhanced-resume.pdf');
        setUploadStatus('complete');
        toast.success('Resume enhanced successfully!');
      }, 3000);

    } catch (error) {
      console.error('Enhancement error:', error);
      setUploadStatus('error');
      toast.error('Enhancement failed. Please try again.');
    }
  };

  const handleDownload = async () => {
    if (!enhancedUrl) return;
    toast.success('Download started');
  };

  const resetForm = () => {
    setFile(null);
    setJobDescription('');
    setUploadStatus('idle');
    setUploadProgress(0);
    setResumeId(null);
    setEnhancedUrl(null);
  };

  const getStepStatus = (step: number) => {
    if (step === 1 && (uploadStatus === 'uploading' || uploadStatus === 'processing')) return 'active';
    if (step === 1 && (uploadStatus === 'complete' || uploadStatus === 'enhancing' || enhancedUrl)) return 'complete';
    if (step === 2 && uploadStatus === 'enhancing') return 'active';
    if (step === 2 && enhancedUrl) return 'complete';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Toaster />
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--text)" }}>
          Upload Resume
        </h1>
        <p className="text-lg" style={{ color: "var(--text-muted)" }}>
          Upload your resume and let AI tailor it for your dream job
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2].map((step) => {
          const status = getStepStatus(step);
          return (
            <div key={step} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300"
                  style={{
                    backgroundColor: status === 'complete' ? 'var(--success)' : 
                                   status === 'active' ? 'var(--primary)' : 
                                   'color-mix(in oklch, var(--border), transparent 50%)',
                    color: status === 'pending' ? 'var(--text-muted)' : 'var(--bg-light)',
                    border: `2px solid ${status === 'pending' ? 'var(--border)' : 'transparent'}`
                  }}
                >
                  {status === 'complete' ? <Check className="h-5 w-5" /> : step}
                </div>
                <span 
                  className="font-medium"
                  style={{ 
                    color: status === 'pending' ? 'var(--text-muted)' : 'var(--text)' 
                  }}
                >
                  {step === 1 ? 'Upload Resume' : 'Enhance with AI'}
                </span>
              </div>
              {step < 2 && (
                <div 
                  className="w-16 h-1 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: getStepStatus(2) !== 'pending' ? 'var(--success)' : 'var(--border)' 
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Upload Resume */}
      {!enhancedUrl && (
        <Card className="border-2" style={{ 
          backgroundColor: "var(--bg-light)",
          borderColor: getStepStatus(1) === 'active' ? 'var(--primary)' : 'var(--border)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl" style={{ color: "var(--text)" }}>
              <Upload className="h-5 w-5" style={{ color: "var(--primary)" }} />
              Step 1: Upload Your Resume
            </CardTitle>
            <CardDescription style={{ color: "var(--text-muted)" }}>
              Upload a PDF file (max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dropzone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className="relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group"
              style={{
                borderColor: dragActive ? 'var(--primary)' : 'var(--border)',
                backgroundColor: dragActive ? 'color-mix(in oklch, var(--primary), transparent 95%)' : 'var(--bg)',
                pointerEvents: (uploadStatus !== 'idle' && file) ? 'none' : 'auto',
                opacity: (uploadStatus !== 'idle' && file) ? 0.6 : 1
              }}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadStatus !== 'idle' && !!file}
              />
              
              <div className="flex flex-col items-center gap-4">
                <div 
                  className="p-6 rounded-full transition-all duration-300 group-hover:scale-110" 
                  style={{ backgroundColor: "color-mix(in oklch, var(--primary), transparent 85%)" }}
                >
                  {file ? (
                    <FileText className="h-12 w-12" style={{ color: "var(--primary)" }} />
                  ) : (
                    <Upload className="h-12 w-12" style={{ color: "var(--primary)" }} />
                  )}
                </div>
                
                {file ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-lg" style={{ color: "var(--text)" }}>
                      {file.name}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-semibold text-lg" style={{ color: "var(--text)" }}>
                      Drop your PDF here or click to browse
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Supports PDF files up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {uploadStatus === 'uploading' && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium" style={{ color: "var(--text)" }}>
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {uploadStatus === 'processing' && (
              <div className="flex items-center justify-center gap-3 py-4">
                <div 
                  className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent" 
                  style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
                />
                <p className="font-medium" style={{ color: "var(--text)" }}>
                  Processing resume with AI...
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {file && uploadStatus === 'idle' && (
              <div className="flex gap-3">
                <Button 
                  onClick={handleUpload} 
                  className="flex-1 gap-2 transition-all duration-300 hover:scale-105"
                  style={{ 
                    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                    color: "var(--bg-light)"
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Upload to Cloud
                </Button>
                <Button 
                  onClick={() => setFile(null)} 
                  variant="outline"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Job Description */}
      {(uploadStatus === 'complete' || uploadStatus === 'enhancing' || enhancedUrl) && (
        <Card className="border-2 animate-in slide-in-from-top duration-500" style={{ 
          backgroundColor: "var(--bg-light)",
          borderColor: getStepStatus(2) === 'active' ? 'var(--primary)' : 'var(--border)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl" style={{ color: "var(--text)" }}>
              <Sparkles className="h-5 w-5" style={{ color: "var(--secondary)" }} />
              Step 2: Add Job Description
            </CardTitle>
            <CardDescription style={{ color: "var(--text-muted)" }}>
              Paste the job posting to tailor your resume
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="jobDescription" className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                Job Description
              </Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the full job description here including requirements, responsibilities, and qualifications..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={12}
                className="resize-none text-sm"
                disabled={uploadStatus === 'enhancing' || !!enhancedUrl}
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)"
                }}
              />
            </div>

            {uploadStatus === 'enhancing' && (
              <div className="flex items-center justify-center gap-3 py-4">
                <div 
                  className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent" 
                  style={{ borderColor: 'var(--secondary)', borderTopColor: 'transparent' }}
                />
                <p className="font-medium" style={{ color: "var(--text)" }}>
                  AI is enhancing your resume...
                </p>
              </div>
            )}

            {!enhancedUrl && uploadStatus !== 'enhancing' && (
              <Button 
                onClick={handleEnhance} 
                className="w-full gap-2 transition-all duration-300 hover:scale-105"
                disabled={!jobDescription.trim()}
                style={{ 
                  background: jobDescription.trim() 
                    ? "linear-gradient(135deg, var(--primary), var(--secondary))"
                    : "var(--border)",
                  color: "var(--bg-light)"
                }}
              >
                <Sparkles className="h-5 w-5" />
                Enhance with AI
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success Card */}
      {enhancedUrl && (
        <Card className="border-2 animate-in slide-in-from-bottom duration-500" style={{ 
          backgroundColor: "var(--bg-light)",
          borderColor: "var(--success)",
          background: `linear-gradient(135deg, var(--bg-light) 0%, color-mix(in oklch, var(--success), transparent 95%) 100%)`
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl" style={{ color: "var(--success)" }}>
              <Check className="h-6 w-6" />
              Resume Enhanced Successfully!
            </CardTitle>
            <CardDescription style={{ color: "var(--text-muted)" }}>
              Your AI-optimized resume is ready to download
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {[
                'ATS-optimized keywords added',
                'Tailored to job requirements',
                'Enhanced with relevant achievements'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0" style={{ color: "var(--success)" }} />
                  <span style={{ color: "var(--text)" }}>{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleDownload} 
                className="flex-1 gap-2 transition-all duration-300 hover:scale-105"
                style={{ 
                  background: "linear-gradient(135deg, var(--success), var(--primary))",
                  color: "var(--bg-light)"
                }}
              >
                <Download className="h-5 w-5" />
                Download Enhanced Resume
              </Button>
              <Button 
                onClick={resetForm} 
                variant="outline"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                Upload Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {uploadStatus === 'error' && (
        <Card className="border-2 animate-in shake duration-500" style={{ 
          backgroundColor: "var(--bg-light)",
          borderColor: "var(--danger)",
          background: `linear-gradient(135deg, var(--bg-light) 0%, color-mix(in oklch, var(--danger), transparent 95%) 100%)`
        }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 flex-shrink-0" style={{ color: "var(--danger)" }} />
              <div className="flex-1">
                <p className="font-semibold mb-1" style={{ color: "var(--danger)" }}>
                  Something went wrong
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Please try again or contact support if the issue persists
                </p>
              </div>
              <Button 
                onClick={resetForm} 
                variant="outline" 
                size="sm"
                style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
