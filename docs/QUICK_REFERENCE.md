# Quick Reference Guide

Essential commands and workflows for KMR Resume Enhancer development.

## 🔥 Daily Commands

```bash
# Start your day
git checkout develop
git pull origin develop
git checkout -b feature/issue-number-description

# During work
git status                    # Check what changed
git add .                     # Stage all changes
git add file.ts               # Stage specific file
git commit -m "type: message" # Commit with message
git push origin feature/...   # Push to remote

# End of day
git push origin feature/...   # Push your work
# Update issue on GitHub with progress
```

## 🌿 Git Workflow

### Starting New Work
```bash
# 1. Update develop branch
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/2-cognito-setup

# 3. Work on your feature
# ... make changes ...

# 4. Commit frequently
git add .
git commit -m "feat(backend): configure Cognito User Pool #2"

# 5. Push to remote
git push origin feature/2-cognito-setup

# 6. Create PR on GitHub
```

### Updating Your Branch
```bash
# If develop has new changes while you're working
git checkout develop
git pull origin develop
git checkout feature/2-cognito-setup
git rebase develop

# Or use merge (if rebase is confusing)
git merge develop
```

### Finishing Work
```bash
# After PR is approved and merged
git checkout develop
git pull origin develop
git branch -d feature/2-cognito-setup  # Delete local branch
```

## 💻 Common Git Commands

### Status & Information
```bash
git status                    # What changed
git log                       # Commit history
git log --oneline            # Compact history
git diff                     # See unstaged changes
git diff --staged            # See staged changes
git branch                   # List local branches
git branch -a                # List all branches
```

### Staging & Committing
```bash
git add file.ts              # Stage specific file
git add .                    # Stage all changes
git add -p                   # Stage changes interactively
git reset HEAD file.ts       # Unstage file
git commit -m "message"      # Commit with message
git commit --amend           # Edit last commit
```

### Branching
```bash
git branch feature/new       # Create branch
git checkout -b feature/new  # Create and switch
git checkout main            # Switch to main
git branch -d feature/old    # Delete local branch
git push origin --delete feature/old  # Delete remote branch
```

### Remote Operations
```bash
git fetch origin             # Download remote changes
git pull origin develop      # Fetch and merge
git push origin feature/...  # Push branch
git push -u origin feature   # Push and set upstream
git remote -v                # Show remotes
```

### Undoing Changes
```bash
git checkout -- file.ts      # Discard local changes
git reset --hard HEAD        # Discard all local changes
git reset HEAD~1             # Undo last commit (keep changes)
git reset --hard HEAD~1      # Undo last commit (discard changes)
git revert abc123            # Create new commit that undoes abc123
```

## 📦 NPM Commands (Frontend)

```bash
cd frontend

# Development
npm install                  # Install dependencies
npm run dev                  # Start dev server (localhost:3000)
npm run build                # Build for production
npm run start                # Start production server

# Quality
npm run lint                 # Run ESLint
npm run lint:fix             # Fix ESLint errors
npm test                     # Run tests
npm test -- --watch          # Run tests in watch mode

# Dependencies
npm install package-name     # Add dependency
npm install -D package-name  # Add dev dependency
npm update                   # Update dependencies
npm outdated                 # Check outdated packages
```

## 🐍 Python Commands (Backend)

```bash
cd backend

# Environment
python -m venv venv          # Create virtual environment
source venv/bin/activate     # Activate (Mac/Linux)
venv\Scripts\activate        # Activate (Windows)
deactivate                   # Deactivate

# Dependencies
pip install -r requirements.txt        # Install all
pip install package-name               # Add package
pip install --upgrade package-name     # Update package
pip freeze > requirements.txt          # Save dependencies

# Testing
pytest                       # Run all tests
pytest tests/test_parser.py  # Run specific test
pytest --cov=lambdas        # Run with coverage
pytest -v                    # Verbose output

# Code Quality
pylint lambdas/             # Lint code
black lambdas/              # Format code
autopep8 --in-place file.py # Format file
```

## ☁️ AWS CLI Commands

```bash
# Configuration
aws configure                # Set up credentials
aws configure list           # Show current config
aws sts get-caller-identity  # Verify credentials

# S3
aws s3 ls                    # List buckets
aws s3 ls s3://bucket-name   # List files in bucket
aws s3 cp file.pdf s3://bucket/path/  # Upload file
aws s3 rm s3://bucket/path/file.pdf   # Delete file

# DynamoDB
aws dynamodb list-tables     # List tables
aws dynamodb describe-table --table-name MasterResumes
aws dynamodb scan --table-name MasterResumes  # View all items

# Lambda
aws lambda list-functions    # List functions
aws lambda invoke --function-name name output.txt  # Test function
aws lambda update-function-code --function-name name --zip-file fileb://function.zip

# Cognito
aws cognito-idp list-user-pools --max-results 10
aws cognito-idp describe-user-pool --user-pool-id us-east-1_xxx

# Logs
aws logs tail /aws/lambda/function-name --follow  # Stream logs
```

## 🔍 Debugging Commands

### Frontend Debugging
```bash
# Check build errors
npm run build

# Check for unused dependencies
npx depcheck

# Analyze bundle size
npx next build --profile

# Check TypeScript errors
npx tsc --noEmit
```

### Backend Debugging
```bash
# Test Lambda locally
python lambdas/auth/signup.py

# Check Python syntax
python -m py_compile lambdas/auth/signup.py

# Profile code
python -m cProfile lambdas/scoring/scorer.py
```

## 🎯 Project-Specific Commands

```bash
# Root directory (use package.json scripts)
npm run dev                  # Start frontend dev
npm run test                 # Run all tests
npm run install:all          # Install both frontend & backend
npm run clean                # Clean node_modules and cache
npm run setup:db             # Create DynamoDB tables
npm run deploy:frontend      # Deploy to Vercel
npm run deploy:backend       # Deploy to AWS Lambda

# Backend deployment
cd backend
./scripts/deploy_lambda.sh auth           # Deploy auth Lambda
./scripts/deploy_lambda.sh --all          # Deploy all Lambdas
./scripts/create_layer.sh                 # Create Lambda layer

# Database scripts
python backend/scripts/setup_db.py        # Create tables
python backend/scripts/seed_data.py       # Add test data
```

## 🐛 Troubleshooting Commands

### Git Issues
```bash
# Branch conflicts during rebase
git rebase --abort           # Cancel rebase
git rebase --continue        # Continue after fixing

# Merge conflicts
git merge --abort            # Cancel merge
# After fixing conflicts:
git add .
git commit

# Accidentally committed to wrong branch
git reset --soft HEAD~1      # Undo commit, keep changes
git stash                    # Stash changes
git checkout correct-branch
git stash pop                # Apply changes
```

### Node/NPM Issues
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Port already in use
lsof -ti:3000 | xargs kill   # Kill process on port 3000

# Permission errors
sudo chown -R $USER ~/.npm
```

### Python/Pip Issues
```bash
# Reinstall dependencies
pip uninstall -r requirements.txt -y
pip install -r requirements.txt

# Fix permissions
pip install --user package-name

# Use break-system-packages (if needed)
pip install package-name --break-system-packages
```

### AWS Issues
```bash
# Check credentials
aws sts get-caller-identity

# Reconfigure
aws configure

# Clear credentials cache
rm -rf ~/.aws/cli/cache

# Test Lambda function
aws lambda invoke --function-name test out.txt
cat out.txt
```

## 📊 Useful Aliases (Add to .bashrc or .zshrc)

```bash
# Git aliases
alias gs='git status'
alias ga='git add .'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline'
alias gco='git checkout'
alias gd='git diff'

# Project aliases
alias kmr='cd ~/path/to/kmr-resume-enhancer'
alias kmr-fe='cd ~/path/to/kmr-resume-enhancer/frontend && npm run dev'
alias kmr-be='cd ~/path/to/kmr-resume-enhancer/backend'

# Docker aliases (if using)
alias dc='docker-compose'
alias dcu='docker-compose up'
alias dcd='docker-compose down'
```

## 🔐 Environment Variables

### Check Variables
```bash
# Frontend
cat frontend/.env.local

# Backend
cat backend/.env

# Verify they're loaded
echo $NEXT_PUBLIC_API_URL
echo $AWS_REGION
```

### Export Variables (temporary)
```bash
export NEXT_PUBLIC_API_URL="https://api.example.com"
export AWS_REGION="us-east-1"
```

## 📝 Quick Issue/PR Templates

### Creating Issue
```bash
# Via GitHub CLI
gh issue create --title "Set up Cognito" --body "Configure User Pool" --label "backend,setup"

# Via web: github.com/username/repo/issues/new
```

### Creating PR
```bash
# Via GitHub CLI
gh pr create --title "feat: add Cognito setup" --body "Closes #2"

# Via web: Push branch, then click "Create PR" on GitHub
```

## 🎯 Commit Message Templates

```bash
# Features
git commit -m "feat(frontend): add upload component #4"
git commit -m "feat(backend): integrate Bedrock API #14"

# Fixes
git commit -m "fix(parser): handle empty resume sections #23"
git commit -m "fix(ui): button alignment on mobile #31"

# Documentation
git commit -m "docs: add API endpoint documentation #7"
git commit -m "docs: update setup guide with AWS steps"

# Chores
git commit -m "chore: update dependencies"
git commit -m "chore: clean up unused imports"

# Refactoring
git commit -m "refactor(scoring): extract ATS calculation"
git commit -m "refactor: simplify auth middleware"
```

## 🚀 Deployment Quick Reference

### Frontend (Vercel)
```bash
cd frontend
vercel login                 # First time only
vercel                       # Deploy to preview
vercel --prod                # Deploy to production
```

### Backend (AWS Lambda)
```bash
cd backend

# Deploy specific Lambda
./scripts/deploy_lambda.sh auth

# Deploy all Lambdas
./scripts/deploy_lambda.sh --all

# Create Lambda layer
./scripts/create_layer.sh
```

## 📖 Documentation Links

- GitHub Repo: https://github.com/username/kmr-resume-enhancer
- Project Board: https://github.com/username/kmr-resume-enhancer/projects/1
- AWS Console: https://console.aws.amazon.com
- Vercel Dashboard: https://vercel.com/dashboard

## 🆘 Getting Help

1. Check this quick reference
2. Check CONTRIBUTING.md
3. Search GitHub issues
4. Ask your teammate
5. Check official docs:
   - Git: https://git-scm.com/docs
   - Next.js: https://nextjs.org/docs
   - AWS: https://docs.aws.amazon.com

---

**Pro Tip:** Print this page or bookmark it! You'll use these commands daily.

**Last Updated:** January 28, 2026
