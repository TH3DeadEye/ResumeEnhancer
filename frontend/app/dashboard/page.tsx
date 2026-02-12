'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Upload, FileText, TrendingUp, Clock, Download, Eye, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/app/components/ui/badge';

interface Resume {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'processing' | 'parsed' | 'enhanced' | 'failed';
  jobTitle?: string;
  enhancedUrl?: string;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('User');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    enhanced: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    loadUserData();
    fetchResumes();
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
      // Mock data
      const mockResumes: Resume[] = [
        {
          id: '1',
          fileName: 'John_Doe_Resume.pdf',
          uploadDate: '2026-02-05',
          status: 'enhanced',
          jobTitle: 'Senior Software Engineer',
          enhancedUrl: '/api/resume/download/1',
        },
        {
          id: '2',
          fileName: 'Resume_Latest.pdf',
          uploadDate: '2026-02-04',
          status: 'parsed',
        },
        {
          id: '3',
          fileName: 'CV_2026.pdf',
          uploadDate: '2026-02-01',
          status: 'processing',
        },
      ];

      setResumes(mockResumes);
      setStats({
        total: mockResumes.length,
        enhanced: mockResumes.filter(r => r.status === 'enhanced').length,
        thisMonth: mockResumes.length,
      });
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    }
  };

  const getStatusBadge = (status: Resume['status']) => {
    const configs = {
      enhanced: { label: 'Enhanced', color: 'var(--success)' },
      parsed: { label: 'Ready to Enhance', color: 'var(--primary)' },
      processing: { label: 'Processing...', color: 'var(--warning)' },
      failed: { label: 'Failed', color: 'var(--danger)' }
    };
    
    const config = configs[status];
    return (
      <Badge 
        variant="secondary" 
        style={{ 
          backgroundColor: `color-mix(in oklch, ${config.color}, transparent 85%)`,
          color: config.color,
          border: `1px solid ${config.color}`
        }}
      >
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--text)" }}>
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>
            Manage your resumes and track your AI enhancements
          </p>
        </div>
        
        <Link href="/dashboard/upload">
          <Button 
            size="lg" 
            className="group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{ 
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              color: "var(--bg-light)",
              padding: "0.75rem 2rem"
            }}
          >
            <Upload className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
            Upload New Resume
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Resumes Card */}
        <Card className="group transition-all duration-300 hover:scale-105 hover:shadow-xl border-2" 
          style={{ 
            backgroundColor: "var(--bg-light)",
            borderColor: "var(--border)",
            background: `linear-gradient(135deg, var(--bg-light) 0%, color-mix(in oklch, var(--primary), transparent 97%) 100%)`
          }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                  Total Resumes
                </p>
                <p className="text-4xl font-bold" style={{ color: "var(--primary)" }}>
                  {stats.total}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  All time uploads
                </p>
              </div>
              <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110" 
                style={{ backgroundColor: "color-mix(in oklch, var(--primary), transparent 85%)" }}>
                <FileText className="h-8 w-8" style={{ color: "var(--primary)" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Card */}
        <Card className="group transition-all duration-300 hover:scale-105 hover:shadow-xl border-2" 
          style={{ 
            backgroundColor: "var(--bg-light)",
            borderColor: "var(--border)",
            background: `linear-gradient(135deg, var(--bg-light) 0%, color-mix(in oklch, var(--secondary), transparent 97%) 100%)`
          }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                  Enhanced
                </p>
                <p className="text-4xl font-bold" style={{ color: "var(--secondary)" }}>
                  {stats.enhanced}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  AI-optimized resumes
                </p>
              </div>
              <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110" 
                style={{ backgroundColor: "color-mix(in oklch, var(--secondary), transparent 85%)" }}>
                <Sparkles className="h-8 w-8" style={{ color: "var(--secondary)" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Month Card */}
        <Card className="group transition-all duration-300 hover:scale-105 hover:shadow-xl border-2" 
          style={{ 
            backgroundColor: "var(--bg-light)",
            borderColor: "var(--border)",
            background: `linear-gradient(135deg, var(--bg-light) 0%, color-mix(in oklch, var(--success), transparent 97%) 100%)`
          }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                  This Month
                </p>
                <p className="text-4xl font-bold" style={{ color: "var(--success)" }}>
                  {stats.thisMonth}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Resumes uploaded
                </p>
              </div>
              <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110" 
                style={{ backgroundColor: "color-mix(in oklch, var(--success), transparent 85%)" }}>
                <TrendingUp className="h-8 w-8" style={{ color: "var(--success)" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Resumes Section */}
      <Card className="border-2 overflow-hidden" 
        style={{ 
          backgroundColor: "var(--bg-light)",
          borderColor: "var(--border)"
        }}>
        <CardHeader className="border-b-2 bg-gradient-to-r" 
          style={{ 
            borderColor: "var(--border)",
            background: `linear-gradient(to right, var(--bg-light), color-mix(in oklch, var(--primary), transparent 97%))`
          }}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--text)" }}>
                <FileText className="h-6 w-6" style={{ color: "var(--primary)" }} />
                Recent Resumes
              </CardTitle>
              <CardDescription className="mt-1" style={{ color: "var(--text-muted)" }}>
                Your recently uploaded and enhanced resumes
              </CardDescription>
            </div>
            <Link href="/dashboard/history">
              <Button variant="outline" size="sm" style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {resumes.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-4 inline-block p-6 rounded-full" 
                style={{ backgroundColor: "color-mix(in oklch, var(--primary), transparent 90%)" }}>
                <FileText className="h-16 w-16" style={{ color: "var(--primary)" }} />
              </div>
              <p className="text-lg font-medium mb-2" style={{ color: "var(--text)" }}>
                No resumes yet
              </p>
              <p className="mb-6" style={{ color: "var(--text-muted)" }}>
                Upload your first resume to get started with AI enhancement
              </p>
              <Link href="/dashboard/upload">
                <Button size="lg" style={{ 
                  background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                  color: "var(--bg-light)"
                }}>
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Your First Resume
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-2"
                  style={{ 
                    backgroundColor: "var(--bg)",
                    borderColor: "var(--border)"
                  }}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" 
                      style={{ 
                        backgroundColor: "color-mix(in oklch, var(--primary), transparent 85%)",
                        border: "1px solid var(--primary)"
                      }}>
                      <FileText className="h-6 w-6" style={{ color: "var(--primary)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg mb-1 truncate" style={{ color: "var(--text)" }}>
                        {resume.fileName}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                        <span>{new Date(resume.uploadDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}</span>
                        {resume.jobTitle && (
                          <>
                            <span>•</span>
                            <span className="truncate">{resume.jobTitle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getStatusBadge(resume.status)}

                    {resume.status === 'enhanced' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-2" 
                          style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button size="sm" className="gap-2" style={{ 
                          background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                          color: "var(--bg-light)"
                        }}>
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    )}

                    {resume.status === 'parsed' && (
                      <Link href={`/dashboard/upload?resumeId=${resume.id}`}>
                        <Button size="sm" style={{ 
                          background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                          color: "var(--bg-light)"
                        }}>
                          <Sparkles className="h-4 w-4 mr-1" />
                          Enhance
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
