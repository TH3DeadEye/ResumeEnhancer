# KMR AI Resume Enhancer

> An AI-powered web application that helps users create ATS-optimized, tailored resumes for specific job postings.

![Project Status](https://img.shields.io/badge/status-in%20development-yellow)
![Team Size](https://img.shields.io/badge/team-2%20developers-blue)
![Timeline](https://img.shields.io/badge/timeline-12%20weeks-green)

## 🎯 Project Overview

KMR AI Resume Enhancer analyzes your master resume against a job description and provides intelligent suggestions to improve your resume's ATS score and overall quality—all while ensuring every suggestion is grounded in your real experience.

### Key Features

- 📄 **Master Resume Upload** - Upload your resume (PDF/DOCX) once
- 🎯 **Job-Specific Tailoring** - Paste any job description for customized suggestions
- 🤖 **AI-Powered Enhancement** - Claude 3.5 Sonnet suggests improvements
- ✅ **Review & Accept** - Accept/reject suggestions with before/after comparison
- 📊 **Smart Scoring** - Get ATS match score + quality score (out of 100)
- 💾 **Version Management** - Save multiple tailored versions
- 📥 **Professional Downloads** - Export as DOCX and PDF

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- GSAP (animations)

**Backend:**
- AWS Lambda (serverless functions)
- Amazon API Gateway
- Amazon Cognito (authentication)
- Amazon S3 (file storage)
- Amazon DynamoDB (metadata)
- Amazon Bedrock (Claude 3.5 Sonnet)
- LangChain
- PyPdf

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- AWS Account with CLI configured
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/kmr-resume-enhancer.git
cd kmr-resume-enhancer

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt

# Copy environment variables
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env

# Configure your AWS credentials and API URLs
# Edit .env files with your values
```

### Running Locally

**Frontend:**
```bash
cd frontend
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
kmr-resume-enhancer/
├── frontend/          # Next.js application
├── backend/           # AWS Lambda functions
├── docs/              # Documentation
└── README.md          # This file
```

See [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) for detailed directory layout.

## 📚 Documentation

- [Architecture Overview](./docs/architecture/system-overview.md)
- [API Documentation](./docs/api/api-spec.md)
- [Setup Guide](./docs/setup/local-development.md)
- [AWS Setup](./docs/setup/aws-setup.md)
- [Database Schema](./docs/database/schema.md)
- [Deployment Guide](./docs/backend/deployment.md)

## 🔐 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com/dev
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxx
```

### Backend (.env)
```env
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
DYNAMODB_TABLE_MASTER_RESUMES=MasterResumes
DYNAMODB_TABLE_RESUME_VERSIONS=ResumeVersions
S3_BUCKET_UPLOADS=kmr-resume-dev-uploads
S3_BUCKET_PARSED=kmr-resume-dev-parsed
S3_BUCKET_GENERATED=kmr-resume-dev-generated
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
```

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
python -m pytest tests/
```

## 📦 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

### Backend (AWS Lambda)
```bash
cd backend
./scripts/deploy_lambda.sh
```

See [Deployment Guide](./docs/backend/deployment.md) for detailed instructions.

## 🤝 Contributing

We're a team of 2 working on this project! See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Branch naming conventions
- Commit message format
- Pull request process
- Code review guidelines

## 📋 Project Management

- **GitHub Projects**: [View Board](https://github.com/your-username/kmr-resume-enhancer/projects/1)
- **Milestones**: 12-week timeline with weekly milestones
- **Sprint Planning**: Weekly on Fridays at 4:00 PM

## 👥 Team

- **Person 1** - Backend Lead (AWS, Lambda, AI Integration)
- **Person 2** - Frontend Lead (Next.js, UI/UX)

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## 🔗 Links

- [AWS Architecture Diagram](./docs/architecture/aws-architecture.svg)
- [API Documentation](./docs/api/api-spec.md)
- [Project Board](https://github.com/your-username/kmr-resume-enhancer/projects/1)

## 📞 Support

For questions or issues:
1. Check the [Troubleshooting Guide](./docs/setup/troubleshooting.md)
2. Search [existing issues](https://github.com/your-username/kmr-resume-enhancer/issues)
3. Create a new issue with the appropriate template

---

**Status**: Week 1 - Foundation & Setup (In Progress)

Last Updated: January 28, 2026
