import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/app/components/theme-provider';
import { AmplifyProvider } from '@/app/components/amplify-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Resume Enhancer - Optimize Your Resume with AI',
  description: 'AI-powered resume tailoring that automatically optimizes your resume for any job description, helping you bypass ATS filters and secure more interviews.',
  keywords: ['AI', 'Resume', 'ATS', 'Job Application', 'AWS Bedrock', 'Resume Optimization'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AmplifyProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AmplifyProvider>
      </body>
    </html>
  );
}
