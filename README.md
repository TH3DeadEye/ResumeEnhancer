# KMR AI Resume Enhancer 🚀

> An AI-powered web application that helps users create ATS-optimized, tailored resumes for specific job postings using AWS serverless architecture and Claude 3.5 Sonnet.

![Project Status](https://img.shields.io/badge/status-in%20development-yellow)
![Team Size](https://img.shields.io/badge/team-2%20developers-blue)

## 🎯 Project Overview

KMR AI Resume Enhancer analyzes your master resume against a job description and provides intelligent suggestions to improve your resume's ATS score and overall quality—all while ensuring every suggestion is grounded in your real experience.

### Key Features

- 📄 **Master Resume Upload** - Upload your resume (PDF/DOCX) once
- 🎯 **Job-Specific Tailoring** - Paste any job description for customized suggestions
- 🤖 **AI-Powered Enhancement** - Claude 3.5 Sonnet suggests improvements based on your real experience
- ✅ **Review & Accept** - Accept/reject suggestions with before/after comparison
- 📊 **Smart Scoring** - Get ATS match score + quality score (out of 100)
- 💾 **Version Management** - Save multiple tailored versions
- 📥 **Professional Downloads** - Export as DOCX and PDF
- 🎨 **Modern UI** - Beautiful GSAP animations with dark mode support

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router) - React framework with SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **GSAP** - Professional animations
- **next-themes** - Dark mode support

### Backend
- **AWS Lambda** - Serverless functions
- **Amazon API Gateway** - REST API
- **Amazon Cognito** - User authentication ✅ **INTEGRATED**
- **Amazon S3** - File storage
- **Amazon DynamoDB** - Metadata storage
- **Amazon Bedrock** - Claude 3.5 Sonnet AI
- **Amazon Textract** - Resume parsing
- **LangChain** - AI orchestration
- **PyPdf** - PDF processing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- AWS Account with CLI configured
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/TH3DeadEye/ResumeEnhancer.git
cd "AI Enhancer"

# Install frontend dependencies
npm install

# Install backend dependencies (if working on backend)
cd backend
pip install -r requirements.txt
cd ..

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your AWS credentials
```

### Running Locally

**Frontend:**
```bash
npm run dev
# Open http://localhost:3000
```

**Backend:**
```bash
cd backend
# Deploy Lambda functions to AWS
./scripts/deploy_lambda.sh
```

## 📁 Project Structure

```
AI Enhancer/
├── app/                          # Next.js App Router
│   ├── api/                      # Server-side API routes
│   │   ├── auth/                 # Cognito authentication ✅
│   │   │   ├── signin/route.ts  # Sign in endpoint
│   │   │   ├── signup/route.ts  # Sign up endpoint
│   │   │   └── verify/route.ts  # Email verification
│   │   ├── resume/               # Resume operations
│   │   │   ├── upload/route.ts  # S3 presigned URL
│   │   │   ├── enhance/route.ts # Lambda enhancement
│   │   │   └── download/route.ts
│   │   └── contact/              # Contact form
│   ├── dashboard/                # Protected dashboard
│   │   ├── page.tsx             # Dashboard home
│   │   ├── upload/              # Upload resume page
│   │   └── history/             # Resume history
│   ├── components/               # React components
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── about-section.tsx
│   │   ├── signin-page.tsx
│   │   └── navigation.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles (OKLCH colors)
├── backend/                      # AWS Lambda functions
│   ├── lambdas/                 # Lambda function code
│   ├── layers/                  # Lambda layers
│   └── tests/                   # Backend tests
├── lib/                         # Utility functions
├── public/                      # Static assets
└── README.md                    # This file
```

## 🔐 Environment Variables

Create `.env.local` in the root directory:

```env
# AWS Cognito (Authentication) ✅ WORKING
NEXT_PUBLIC_AWS_REGION=us-west-2
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-west-2_qhPzQQqYA
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id

# AWS S3 (File Storage)
AWS_S3_BUCKET_UPLOADS=your-bucket-name
AWS_S3_REGION=us-west-2

# AWS Lambda (Enhancement)
AWS_LAMBDA_ENHANCE_FUNCTION=your-function-name

# AWS DynamoDB (Metadata)
AWS_DYNAMODB_TABLE_RESUMES=ResumeMetadata

# AWS Bedrock (AI)
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
```

## 🔌 AWS Integration Status

### ✅ Fully Integrated
- **Amazon Cognito** - User authentication with email verification
  - Sign up with password requirements
  - Email verification with 6-digit code
  - Sign in with session management
  - Protected routes with token validation

### 🟡 Ready for Integration
- **Amazon S3** - Presigned URL endpoints created
- **AWS Lambda** - Enhancement trigger ready
- **Amazon Bedrock** - AI integration prepared
- **Amazon DynamoDB** - Data fetching endpoints ready
- **Amazon Textract** - Resume parsing flow designed

## 📱 Pages & Features

### Public Pages
- **Landing Page** (`/`) - Hero, features, about, contact with GSAP animations
- **Sign In/Up** (`/?page=signin`) - Cognito authentication UI ✅

### Protected Pages (Dashboard)
- **Dashboard** (`/dashboard`) - User hub with resume cards and statistics ✅
- **Upload Resume** (`/dashboard/upload`) - Drag-drop PDF upload with job description
- **History** (`/dashboard/history`) - Resume version history (coming soon)

### API Routes
All API routes are server-side Next.js endpoints:
- `/api/auth/signin` ✅ - Cognito sign in
- `/api/auth/signup` ✅ - Cognito registration
- `/api/auth/verify` ✅ - Email verification
- `/api/resume/upload` 🟡 - Generate S3 presigned URL
- `/api/resume/enhance` 🟡 - Trigger Lambda enhancement
- `/api/resume/download` 🟡 - Generate download URL
- `/api/resume/list` 🟡 - Fetch user's resumes from DynamoDB
- `/api/contact` - Contact form handler

## 🧪 Testing Authentication

```bash
# Start the development server
npm run dev

# Test Sign Up
1. Click "Sign In" button on homepage
2. Toggle to "Sign Up" tab
3. Enter name, email, password (min 8 chars, uppercase, lowercase, numbers)
4. Click "Create Account"
5. Check email for 6-digit verification code
6. Enter code and verify
7. Sign in with verified account

# Test Sign In
1. Enter verified email and password
2. Click "Sign In"
3. Redirects to /dashboard ✅
```

## 📝 Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 👥 Team

**Team KMR**
- **Ramtin Loghmani** - Frontend Lead (Next.js, UI/UX, GSAP animations)
- **Arman Milani** - Backend Lead (AWS, Lambda, AI Integration)

**COMP 2154 - System Development Project**  
George Brown College

## 🎯 Current Status

### ✅ Completed
- [x] Landing page with GSAP animations
- [x] Sign In/Sign Up UI with validation
- [x] Mobile responsive design
- [x] Dark mode support (custom OKLCH colors)
- [x] Dashboard page with statistics
- [x] Upload resume page (drag-drop UI)
- [x] Protected routes structure
- [x] **Amazon Cognito authentication working** ✅
- [x] Email verification flow ✅
- [x] Session management ✅

### ⏳ In Progress
- [ ] S3 upload with presigned URLs
- [ ] Lambda enhancement trigger
- [ ] DynamoDB data fetching
- [ ] Bedrock AI integration
- [ ] Resume parsing with Textract

### 📅 Coming Soon
- [ ] Password reset functionality
- [ ] Resume history with filters
- [ ] Analytics dashboard
- [ ] Version comparison UI
- [ ] Production deployment (Vercel + AWS)

## 📦 Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### Backend (AWS Lambda)
```bash
cd backend
./scripts/deploy_lambda.sh
```

## 📄 License

This project is part of an academic course at George Brown College.

---

**Status:** ✅ Frontend Complete | ✅ Cognito Auth Working | 🟡 Full AWS Integration In Progress  
**Framework:** Next.js 15 with App Router  
Built with ❤️ by Team KMR
