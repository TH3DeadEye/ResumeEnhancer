# AI Resume Enhancer - Frontend ✨

> **Note:** This is the frontend branch built with **Next.js 15**. Backend AWS integration is ready but not yet connected.

A modern, responsive Next.js frontend for the AI Resume Enhancer platform. Features server-side rendering, API routes ready for AWS integration, GSAP animations, and a custom OKLCH color scheme.

## 🌟 Features

- **Next.js 15 with App Router** - Modern React framework with server-side rendering
- **API Routes Ready** - Server-side API endpoints prepared for AWS services
- **Advanced Animations** - GSAP with parallax scrolling and micro-interactions
- **Custom Color Scheme** - OKLCH colors with full dark mode support
- **Type Safe** - Full TypeScript implementation
- **Optimized Performance** - Image optimization and code splitting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the frontend branch:
   ```bash
   git clone -b frontend <repository-url>
   cd "AI Enhancer"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your AWS credentials when ready
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser

## 🎨 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript 5** - Type safety
- **Tailwind CSS** - Utility-first styling
- **GSAP** - Professional animations
- **Shadcn/ui** - Component library
- **next-themes** - Dark mode support

## 📁 Project Structure

```
AI Enhancer/
├── app/
│   ├── api/                          # API routes (ready for AWS)
│   │   ├── auth/                    # Cognito authentication
│   │   │   ├── signin/route.ts     # Sign in endpoint
│   │   │   ├── signup/route.ts     # Sign up endpoint
│   │   │   └── verify/route.ts     # Token validation
│   │   ├── resume/                  # Resume operations
│   │   │   ├── upload/route.ts     # S3 presigned URL
│   │   │   ├── enhance/route.ts    # Lambda enhancement
│   │   │   ├── download/route.ts   # Download presigned URL
│   │   │   └── list/route.ts       # Fetch user resumes
│   │   └── contact/                 # Contact form
│   ├── dashboard/                   # Protected dashboard area
│   │   ├── layout.tsx              # Dashboard layout with nav
│   │   ├── page.tsx                # Dashboard home
│   │   ├── upload/                 # Upload resume page
│   │   └── history/                # Resume history page
│   ├── components/
│   │   ├── protected-route.tsx     # Auth wrapper
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── about-section.tsx
│   │   ├── contact-section.tsx
│   │   ├── signin-page.tsx
│   │   ├── navigation.tsx
│   │   ├── theme-toggle.tsx
│   │   └── ui/                     # Shadcn components
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Global styles
├── lib/
│   └── utils.ts                     # Utility functions
├── public/                          # Static assets
├── INTEGRATION_PLAN.md              # Merge & integration guide
└── AWS_INTEGRATION_GUIDE.md         # AWS setup reference
```

## 🔌 AWS Integration

### ✅ Integrated Services

**Amazon Cognito** - User authentication (WORKING)
- Sign up with email verification
- Sign in with session management
- Protected routes with token checking
- User Pool: `us-west-2_qhPzQQqYA`

### 🟡 Ready for Integration

### Architecture Overview
Based on your AWS infrastructure diagram:

**Authentication:**
- Amazon Cognito → `/api/auth/signin`, `/api/auth/signup`

**Resume Upload Flow:**
1. Generate S3 presigned URL → `/api/resume/upload`
2. Client uploads directly to S3
3. S3 triggers Lambda (Extraction + Parser)
4. Amazon Textract parses resume
5. DynamoDB stores metadata

**Resume Enhancement Flow:**
1. Submit job description → `/api/resume/enhance`
2. Lambda invokes Amazon Bedrock (Claude 3.5 Sonnet)
3. AI generates enhanced resume
4. Store in S3

**Download Flow:**
- Generate presigned URL → `/api/resume/download`

### Integration Status

🟢 **Frontend Complete** - All UI and animations done  
🟢 **Cognito Auth** - Sign in/up working with email verification  
🟡 **API Routes Created** - Server-side endpoints ready  
🟡 **S3/Lambda/Bedrock** - Ready for integration  

### Testing Authentication

```bash
# Start the dev server
npm run dev

# Test Sign Up
1. Click "Sign In" button
2. Toggle to "Sign Up"
3. Enter name, email, password (min 8 chars, uppercase, lowercase, numbers)
4. Click "Create Account"
5. Check email for 6-digit code
6. Enter code and verify
7. Sign in with verified account

# Test Sign In
1. Enter verified email and password
2. Click "Sign In"
3. Redirects to /dashboard ✅
```

### When Ready to Connect S3/Lambda

1. Install AWS SDK:
   ```bash
   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @aws-sdk/client-lambda @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
   ```

2. Fill in `.env.local` with S3 and Lambda details

3. Implement AWS calls in API routes

4. Test resume upload and enhancement

## 📱 Pages

### Public Pages
- **Landing Page** (`/`) - Hero, features, about, contact sections with GSAP animations
- **Sign In/Up** (`/?page=signin`) - Authentication UI (calls `/api/auth/*`)

### Protected Pages (Dashboard)
- **Dashboard** (`/dashboard`) - User hub with resume cards, statistics, and quick actions
- **Upload Resume** (`/dashboard/upload`) - Drag-drop PDF upload with job description input
- **History** (`/dashboard/history`) - Resume history (placeholder - coming soon)

### API Routes
- `/api/auth/signin` - Cognito authentication (sign in)
- `/api/auth/signup` - Cognito user registration
- `/api/auth/verify` - Token validation
- `/api/resume/upload` - Generate S3 presigned URL
- `/api/resume/enhance` - Trigger Lambda enhancement
- `/api/resume/download` - Generate download presigned URL
- `/api/resume/list` - Fetch user's resumes from DynamoDB
- `/api/contact` - Contact form handler

## 👥 Team

**Team KMR**
- Arman Milani  
- Ramtin Loghmani

**COMP 2154 - System Development Project**  
George Brown College

## 📝 Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎯 Current Status

### ✅ Completed
- [x] Landing page with GSAP animations
- [x] Sign In/Sign Up UI
- [x] Mobile responsive design
- [x] Dark mode support
- [x] Dashboard page with statistics
- [x] Upload resume page (drag-drop)
- [x] Protected routes structure
- [x] API route stubs

### ⏳ In Progress
- [ ] AWS Cognito integration
- [ ] S3 upload with presigned URLs
- [ ] Lambda enhancement trigger
- [ ] DynamoDB data fetching
- [ ] End-to-end testing

### 📅 Coming Soon
- [ ] Email verification flow
- [ ] Password reset
- [ ] Resume history with filters
- [ ] Analytics dashboard
- [ ] Production deployment

## 📄 License

This project is part of an academic course at George Brown College.

---

**Status:** ✅ UI Complete | 🟡 API Ready | 🔴 AWS Integration Pending  
**Framework:** Next.js 15 with App Router  
Built with ❤️ by Team KMR
