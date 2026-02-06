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
│   ├── api/                    # API routes (ready for AWS)
│   │   ├── auth/              # Cognito authentication
│   │   ├── resume/            # Upload, enhance, download
│   │   └── contact/           # Contact form
│   ├── components/
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── about-section.tsx
│   │   ├── contact-section.tsx
│   │   ├── signin-page.tsx
│   │   ├── navigation.tsx
│   │   └── ui/                # Reusable components
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── lib/
│   └── utils.ts               # Utility functions
└── public/                    # Static assets
```

## 🔌 AWS Integration (Ready)

The frontend has API routes ready to connect to your AWS backend:

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
🟡 **API Routes Created** - Server-side endpoints ready  
🔴 **AWS Not Connected** - Awaiting backend implementation  

### When Ready to Connect

1. Install AWS SDK:
   ```bash
   npm install @aws-sdk/client-cognito-identity-provider @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @aws-sdk/client-lambda @aws-sdk/client-bedrock-runtime
   ```

2. Fill in `.env.local` with your AWS credentials

3. Implement AWS calls in API routes (see TODOs in route files)

4. Test authentication flow

5. Test resume upload and enhancement

## 📱 Pages

- **Landing Page** - Hero, features, about, contact sections
- **Sign In/Up** - Authentication UI (calls `/api/auth/*`)
- **API Routes** - Server-side endpoints for AWS integration

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

## 🎯 Next Steps

1. ✅ Frontend UI complete
2. ✅ API routes structure ready
3. ⏳ Connect AWS services (Cognito, S3, Lambda, Bedrock)
4. ⏳ Test end-to-end flow
5. ⏳ Deploy to production

## 📄 License

This project is part of an academic course at George Brown College.

---

**Status:** ✅ UI Complete | 🟡 API Ready | 🔴 AWS Integration Pending  
**Framework:** Next.js 15 with App Router  
Built with ❤️ by Team KMR
