'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { User, Mail, Lock, Bell, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';

/**
 * SETTINGS PAGE
 * 
 * User account settings and preferences
 */

export default function SettingsPage() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { getUserInfo } = await import('@/lib/auth-service');
      const result = await getUserInfo();
      
      if (result.success && result.result) {
        setUserName(result.result.name || '');
        setUserEmail(result.result.email || '');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement profile update API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // TODO: Implement password change flow
    toast.info('Password change coming soon!');
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion
      toast.error('Account deletion coming soon!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b-2" style={{ borderColor: "var(--border)" }}>
        <h1 className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: "var(--text)" }}>
          Settings
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="shadow-lg" style={{ 
        backgroundColor: "var(--bg-light)", 
        borderWidth: "2px",
        borderColor: "var(--border)" 
      }}>
        <CardHeader className="border-b-2" style={{ borderColor: "var(--border)" }}>
          <CardTitle className="flex items-center gap-2 text-xl font-bold" style={{ color: "var(--text)" }}>
            <User className="h-5 w-5" style={{ color: "var(--primary)" }} />
            Profile Information
          </CardTitle>
          <CardDescription style={{ color: "var(--text-muted)" }}>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name" style={{ color: "var(--text)" }}>Full Name</Label>
            <Input
              id="name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your full name"
              style={{ 
                backgroundColor: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)"
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" style={{ color: "var(--text)" }}>Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              <Input
                id="email"
                type="email"
                value={userEmail}
                disabled
                className="flex-1"
                style={{ 
                  backgroundColor: "color-mix(in oklch, var(--bg), var(--border) 10%)",
                  borderColor: "var(--border)",
                  color: "var(--text-muted)"
                }}
              />
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          <Button 
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="w-full sm:w-auto shadow-md hover:scale-105 transition-transform"
            style={{ 
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              color: "var(--bg-light)"
            }}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="shadow-lg" style={{ 
        backgroundColor: "var(--bg-light)", 
        borderWidth: "2px",
        borderColor: "var(--border)" 
      }}>
        <CardHeader className="border-b-2" style={{ borderColor: "var(--border)" }}>
          <CardTitle className="flex items-center gap-2 text-xl font-bold" style={{ color: "var(--text)" }}>
            <Shield className="h-5 w-5" style={{ color: "var(--primary)" }} />
            Security
          </CardTitle>
          <CardDescription style={{ color: "var(--text-muted)" }}>
            Manage your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between p-4 rounded-lg" 
            style={{ 
              backgroundColor: "var(--bg)",
              border: "1px solid var(--border)"
            }}>
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
              <div>
                <p className="font-medium" style={{ color: "var(--text)" }}>Password</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Last changed 30 days ago
                </p>
              </div>
            </div>
            <Button 
              onClick={handleChangePassword}
              variant="outline"
              size="sm"
              style={{ 
                borderColor: "var(--primary)",
                color: "var(--primary)"
              }}
            >
              Change
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg" 
            style={{ 
              backgroundColor: "var(--bg)",
              border: "1px solid var(--border)"
            }}>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
              <div>
                <p className="font-medium" style={{ color: "var(--text)" }}>Email Notifications</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Receive email updates about your resumes
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              size="sm"
              style={{ 
                borderColor: "var(--success)",
                color: "var(--success)"
              }}
            >
              Enabled
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="shadow-lg" style={{ 
        backgroundColor: "var(--bg-light)", 
        borderWidth: "2px",
        borderColor: "var(--danger)",
        background: `linear-gradient(135deg, var(--bg-light) 0%, color-mix(in oklch, var(--danger), transparent 95%) 100%)`
      }}>
        <CardHeader className="border-b-2" style={{ borderColor: "var(--danger)" }}>
          <CardTitle className="flex items-center gap-2 text-xl font-bold" style={{ color: "var(--danger)" }}>
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription style={{ color: "var(--text-muted)" }}>
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-medium mb-1" style={{ color: "var(--text)" }}>
                Delete Account
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button 
              onClick={handleDeleteAccount}
              variant="destructive"
              size="sm"
              className="w-full sm:w-auto"
              style={{ 
                backgroundColor: "var(--danger)",
                color: "var(--bg-light)"
              }}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
