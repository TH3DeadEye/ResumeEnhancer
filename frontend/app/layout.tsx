import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/app/components/theme-provider';
import { AmplifyProvider } from '@/app/components/amplify-provider';

export const metadata: Metadata = {
  title: 'Resumence — AI Resume Tailoring',
  description: 'Upload your resume, paste a job description, and let Resumence tailor it to the role in seconds.',
  keywords: ['AI', 'Resume', 'ATS', 'Job Application', 'AWS Bedrock', 'Resumence'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AmplifyProvider>
          <ThemeProvider
            attribute="class"
            forcedTheme="light"
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AmplifyProvider>
      </body>
    </html>
  );
}
