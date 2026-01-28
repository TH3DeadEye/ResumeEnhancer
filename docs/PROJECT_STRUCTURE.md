# KMR AI Resume Enhancer - Initial Project Structure

## Repository Structure (Monorepo Approach)

```
kmr-resume-enhancer/
├── .git/
├── .github/
│   ├── workflows/
│   │   ├── frontend-deploy.yml
│   │   └── backend-test.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── task.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── frontend/                          # Next.js Application
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── resumes/
│   │   │   │   └── page.tsx
│   │   │   └── versions/
│   │   │       └── page.tsx
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   └── enhance/
│   │       └── [resumeId]/
│   │           ├── page.tsx
│   │           └── suggestions/
│   │               └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── badge.tsx
│   │   ├── layouts/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── features/
│   │       ├── UploadZone.tsx
│   │       ├── ResumeViewer.tsx
│   │       ├── SuggestionCard.tsx
│   │       ├── ScoreCard.tsx
│   │       └── VersionCard.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts              # Axios instance
│   │   │   ├── auth.ts                # Auth API calls
│   │   │   └── resume.ts              # Resume API calls
│   │   ├── utils/
│   │   │   ├── cn.ts                  # Class name utilities
│   │   │   ├── validators.ts          # Form validation
│   │   │   └── formatters.ts          # Date, text formatters
│   │   └── store/
│   │       └── resumeStore.ts         # Zustand state management
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useResume.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── types/
│   │   ├── index.ts                   # Main type definitions
│   │   ├── resume.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   ├── public/
│   │   ├── logo.svg
│   │   └── favicon.ico
│   │
│   ├── .env.local.example
│   ├── .eslintrc.json
│   ├── .gitignore
│   ├── next.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── README.md
│
├── backend/                           # AWS Lambda Functions
│   ├── lambdas/
│   │   ├── auth/
│   │   │   ├── signup.py
│   │   │   ├── login.py
│   │   │   ├── verify.py
│   │   │   ├── middleware.py
│   │   │   ├── requirements.txt
│   │   │   └── README.md
│   │   │
│   │   ├── upload/
│   │   │   ├── generate_presigned_url.py
│   │   │   ├── confirm_upload.py
│   │   │   ├── requirements.txt
│   │   │   └── README.md
│   │   │
│   │   ├── extraction/
│   │   │   ├── textract_handler.py
│   │   │   ├── docx_handler.py
│   │   │   ├── requirements.txt
│   │   │   └── README.md
│   │   │
│   │   ├── parsing/
│   │   │   ├── resume_parser.py
│   │   │   ├── section_detector.py
│   │   │   ├── requirements.txt
│   │   │   └── README.md
│   │   │
│   │   ├── enhancement/
│   │   │   ├── handler.py
│   │   │   ├── prompts.py
│   │   │   ├── validator.py
│   │   │   ├── requirements.txt
│   │   │   └── README.md
│   │   │
│   │   ├── scoring/
│   │   │   ├── handler.py
│   │   │   ├── scorer.py
│   │   │   ├── ats_scorer.py
│   │   │   ├── quality_scorer.py
│   │   │   ├── requirements.txt
│   │   │   └── README.md
│   │   │
│   │   ├── versioning/
│   │   │   ├── create_version.py
│   │   │   ├── list_versions.py
│   │   │   ├── get_version.py
│   │   │   ├── requirements.txt
│   │   │   └── README.md
│   │   │
│   │   ├── generation/
│   │   │   ├── docx_generator.py
│   │   │   ├── pdf_generator.py
│   │   │   ├── templates/
│   │   │   │   ├── modern.docx
│   │   │   │   └── classic.docx
│   │   │   ├── requirements.txt
│   │   │   └── README.md
│   │   │
│   │   └── common/
│   │       ├── auth_decorator.py      # Shared auth middleware
│   │       ├── response_builder.py    # Standard API responses
│   │       ├── logger.py              # Logging utilities
│   │       └── exceptions.py          # Custom exceptions
│   │
│   ├── layers/                        # Lambda Layers
│   │   ├── python-dependencies/
│   │   │   └── python/
│   │   │       └── (pip packages)
│   │   └── README.md
│   │
│   ├── scripts/                       # Utility scripts
│   │   ├── setup_db.py                # Create DynamoDB tables
│   │   ├── seed_data.py               # Populate test data
│   │   ├── deploy_lambda.sh           # Deploy script
│   │   ├── create_layer.sh            # Create Lambda layer
│   │   └── test_apis.sh               # Test API endpoints
│   │
│   ├── tests/                         # Unit tests
│   │   ├── test_parser.py
│   │   ├── test_scorer.py
│   │   ├── test_enhancement.py
│   │   └── fixtures/
│   │       └── sample_resume.json
│   │
│   ├── infrastructure/                # Infrastructure as Code
│   │   ├── cloudformation/
│   │   │   ├── cognito.yaml
│   │   │   ├── dynamodb.yaml
│   │   │   ├── s3.yaml
│   │   │   └── api-gateway.yaml
│   │   └── terraform/                 # (Alternative to CloudFormation)
│   │       └── main.tf
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── requirements.txt               # Root level requirements
│   └── README.md
│
├── docs/                              # Project Documentation
│   ├── architecture/
│   │   ├── system-overview.md
│   │   ├── data-flow.md
│   │   └── aws-architecture.svg
│   │
│   ├── api/
│   │   ├── api-spec.md                # API documentation
│   │   ├── authentication.md
│   │   ├── endpoints.md
│   │   └── error-codes.md
│   │
│   ├── setup/
│   │   ├── local-development.md
│   │   ├── aws-setup.md
│   │   ├── environment-variables.md
│   │   └── troubleshooting.md
│   │
│   ├── database/
│   │   ├── schema.md
│   │   ├── dynamodb-queries.md
│   │   └── data-model.md
│   │
│   ├── frontend/
│   │   ├── component-guide.md
│   │   ├── state-management.md
│   │   └── routing.md
│   │
│   ├── backend/
│   │   ├── lambda-functions.md
│   │   ├── deployment.md
│   │   └── testing.md
│   │
│   ├── ai/
│   │   ├── bedrock-integration.md
│   │   ├── prompt-engineering.md
│   │   └── scoring-algorithm.md
│   │
│   └── project-management/
│       ├── sprint-planning.md
│       ├── task-breakdown.md
│       └── testing-checklist.md
│
├── .gitignore                         # Root gitignore
├── .gitattributes
├── README.md                          # Project README
├── LICENSE
├── CONTRIBUTING.md
├── CHANGELOG.md
└── package.json                       # Root package.json (for monorepo scripts)
```

## Why This Structure?

### Monorepo Approach
- **Frontend and Backend in one repo** - Easier coordination for 2-person team
- **Shared documentation** - Single source of truth
- **Atomic commits** - Change frontend + backend together
- **Simplified CI/CD** - One pipeline for both

### Clear Separation
- **Frontend** - All UI code isolated
- **Backend** - All Lambda functions organized by feature
- **Docs** - Comprehensive documentation structure
- **Tests** - Organized by component

### Scalability
- Easy to add new Lambda functions
- Simple to add new frontend pages
- Clear place for everything
- Easy onboarding for new developers

