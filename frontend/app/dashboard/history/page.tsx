'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { FileText, Download, Eye, Search, Calendar, Filter, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';

interface Resume {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'processing' | 'parsed' | 'enhanced' | 'failed';
  jobTitle?: string;
  enhancedUrl?: string;
}

export default function HistoryPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
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
      {
        id: '4',
        fileName: 'Software_Engineer_Resume.pdf',
        uploadDate: '2026-01-28',
        status: 'enhanced',
        jobTitle: 'Full Stack Developer',
      },
      {
        id: '5',
        fileName: 'My_Resume_2026.pdf',
        uploadDate: '2026-01-25',
        status: 'enhanced',
        jobTitle: 'Product Manager',
      },
    ];

    setResumes(mockResumes);
  };

  const filteredResumes = resumes.filter(resume => {
    const matchesSearch = resume.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || resume.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: Resume['status']) => {
    const configs = {
      enhanced: { label: 'Enhanced', color: 'var(--success)', icon: Sparkles },
      parsed: { label: 'Ready', color: 'var(--primary)', icon: FileText },
      processing: { label: 'Processing', color: 'var(--warning)', icon: Clock },
      failed: { label: 'Failed', color: 'var(--danger)', icon: FileText }
    };
    
    const config = configs[status];
    const Icon = config.icon;
    
    return (
      <Badge 
        variant="secondary" 
        className="gap-1"
        style={{ 
          backgroundColor: `color-mix(in oklch, ${config.color}, transparent 85%)`,
          color: config.color,
          border: `1px solid ${config.color}`,
          padding: "0.375rem 0.75rem"
        }}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--text)" }}>
          Resume History
        </h1>
        <p className="text-lg" style={{ color: "var(--text-muted)" }}>
          View and manage all your uploaded and enhanced resumes
        </p>
      </div>

      {/* Search and Filter Bar */}
      <Card className="border-2" style={{ 
        backgroundColor: "var(--bg-light)",
        borderColor: "var(--border)"
      }}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" 
                style={{ color: "var(--text-muted)" }} />
              <Input
                placeholder="Search by filename or job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)"
                }}
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'enhanced', 'parsed', 'processing'].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={filterStatus === status ? "default" : "outline"}
                  onClick={() => setFilterStatus(status)}
                  className="capitalize transition-all duration-300"
                  style={filterStatus === status ? {
                    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                    color: "var(--bg-light)",
                    border: "none"
                  } : {
                    borderColor: "var(--border)",
                    color: "var(--text)"
                  }}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Showing <span className="font-semibold" style={{ color: "var(--text)" }}>
                {filteredResumes.length}
              </span> of <span className="font-semibold" style={{ color: "var(--text)" }}>
                {resumes.length}
              </span> resumes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resume List */}
      {filteredResumes.length === 0 ? (
        <Card className="border-2" style={{ 
          backgroundColor: "var(--bg-light)",
          borderColor: "var(--border)"
        }}>
          <CardContent className="py-16 text-center">
            <div className="mb-4 inline-block p-6 rounded-full" 
              style={{ backgroundColor: "color-mix(in oklch, var(--primary), transparent 90%)" }}>
              <FileText className="h-16 w-16" style={{ color: "var(--primary)" }} />
            </div>
            <p className="text-lg font-medium mb-2" style={{ color: "var(--text)" }}>
              No resumes found
            </p>
            <p style={{ color: "var(--text-muted)" }}>
              {searchQuery || filterStatus !== 'all' 
                ? "Try adjusting your search or filter" 
                : "Upload your first resume to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredResumes.map((resume, index) => (
            <Card 
              key={resume.id}
              className="group border-2 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              style={{ 
                backgroundColor: "var(--bg-light)",
                borderColor: "var(--border)",
                animationDelay: `${index * 50}ms`
              }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Section - File Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-4 rounded-xl transition-all duration-300 group-hover:scale-110" 
                      style={{ 
                        backgroundColor: "color-mix(in oklch, var(--primary), transparent 85%)",
                        border: "1px solid var(--primary)"
                      }}>
                      <FileText className="h-7 w-7" style={{ color: "var(--primary)" }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2 truncate" style={{ color: "var(--text)" }}>
                        {resume.fileName}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm" 
                        style={{ color: "var(--text-muted)" }}>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(resume.uploadDate).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                        
                        {resume.jobTitle && (
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span className="truncate font-medium" style={{ color: "var(--text)" }}>
                              {resume.jobTitle}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Status and Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:flex-shrink-0">
                    {getStatusBadge(resume.status)}

                    <div className="flex gap-2">
                      {resume.status === 'enhanced' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2 transition-all duration-300 hover:scale-105" 
                            style={{ 
                              borderColor: "var(--border)", 
                              color: "var(--text)" 
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            className="gap-2 transition-all duration-300 hover:scale-105" 
                            style={{ 
                              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                              color: "var(--bg-light)"
                            }}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </>
                      )}

                      {resume.status === 'parsed' && (
                        <Link href={`/dashboard/upload?resumeId=${resume.id}`}>
                          <Button 
                            size="sm" 
                            className="gap-2 transition-all duration-300 hover:scale-105" 
                            style={{ 
                              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                              color: "var(--bg-light)"
                            }}
                          >
                            <Sparkles className="h-4 w-4" />
                            Enhance Now
                          </Button>
                        </Link>
                      )}

                      {resume.status === 'processing' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          disabled 
                          style={{ 
                            borderColor: "var(--border)", 
                            color: "var(--text-muted)" 
                          }}
                        >
                          <Clock className="h-4 w-4 animate-spin mr-2" />
                          Processing
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
