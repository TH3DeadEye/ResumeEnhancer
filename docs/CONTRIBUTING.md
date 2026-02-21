# Contributing to KMR Resume Enhancer

Thank you for contributing to this project! This guide will help our 2-person team work efficiently together.

## 🌿 Branch Strategy

### Main Branches
- `main` - Production-ready code, always deployable
- `develop` - Integration branch for ongoing development

### Feature Branches
Create feature branches from `develop`:

```bash
# Branch naming convention
feature/issue-number-short-description
bugfix/issue-number-short-description
hotfix/issue-number-short-description
docs/short-description

# Examples
feature/2-cognito-setup
feature/15-upload-component
bugfix/23-parsing-error
docs/api-documentation
```

### Branch Workflow

```bash
# 1. Create a new branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/2-cognito-setup

# 2. Make your changes and commit
git add .
git commit -m "feat: set up Cognito User Pool #2"

# 3. Push to remote
git push origin feature/2-cognito-setup

# 4. Create Pull Request on GitHub
# 5. After review and approval, merge to develop
# 6. Delete feature branch
git branch -d feature/2-cognito-setup
```

## 📝 Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject> #<issue-number>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, config)
- `perf`: Performance improvements

### Scopes (optional)
- `frontend`: Frontend changes
- `backend`: Backend changes
- `api`: API changes
- `auth`: Authentication
- `ui`: UI components
- `db`: Database

### Examples

```bash
# Good commits
git commit -m "feat(backend): set up Cognito User Pool #2"
git commit -m "feat(frontend): create UploadZone component #4"
git commit -m "fix(api): handle empty resume parsing #15"
git commit -m "docs: add API endpoint documentation #7"
git commit -m "chore: update dependencies"

# Bad commits (avoid these)
git commit -m "update stuff"
git commit -m "fix bug"
git commit -m "WIP"
```

### Detailed Commit Message

For complex changes, add a body:

```bash
git commit -m "feat(backend): implement Bedrock enhancement Lambda #14

- Add prompt engineering for resume suggestions
- Implement validation to prevent hallucinations
- Add scoring integration
- Include error handling for API timeouts

Closes #14"
```

## 🔄 Pull Request Process

### Creating a PR

1. **Before creating PR:**
   - Ensure all tests pass
   - Update documentation if needed
   - Rebase on latest `develop` if needed
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/2-cognito-setup
   git rebase develop
   ```

2. **PR Title:** Same format as commit messages
   ```
   feat(backend): set up Cognito User Pool #2
   ```

3. **PR Description Template:**
   ```markdown
   ## Description
   Brief description of what this PR does.

   ## Related Issue
   Closes #2

   ## Type of Change
   - [ ] Bug fix
   - [x] New feature
   - [ ] Documentation update
   - [ ] Refactoring

   ## Changes Made
   - Set up Cognito User Pool
   - Configured password policy
   - Added email verification
   - Documented User Pool ID

   ## Testing
   - [x] Tested locally
   - [x] Created test user via AWS Console
   - [x] Verified email flow works

   ## Screenshots (if applicable)
   [Add screenshots here]

   ## Checklist
   - [x] Code follows project style guidelines
   - [x] Self-reviewed code
   - [x] Updated documentation
   - [x] No new warnings
   - [x] Tests pass
   ```

4. **Request Review:**
   - Tag your teammate as reviewer
   - Add relevant labels

### Reviewing PRs

**For the Reviewer:**

1. **Check the code:**
   - Does it solve the issue?
   - Is it readable and maintainable?
   - Are there any bugs or edge cases?
   - Does it follow conventions?

2. **Test locally:**
   ```bash
   git fetch origin
   git checkout feature/2-cognito-setup
   npm install  # or pip install if backend
   # Test the changes
   ```

3. **Leave feedback:**
   - Be specific and constructive
   - Suggest improvements, don't just criticize
   - Use GitHub's suggestion feature for small fixes
   - Approve if everything looks good

4. **Approval:**
   - ✅ **Approve** - Ready to merge
   - 💬 **Comment** - Needs discussion
   - ❌ **Request Changes** - Needs fixes

### Merging

- **Squash and merge** for feature branches (keeps history clean)
- **Person who created the PR** should merge after approval
- Delete feature branch after merging

## 🧪 Testing Requirements

### Before Committing
```bash
# Frontend
cd frontend
npm run lint
npm run build  # Ensure it builds

# Backend  
cd backend
python -m pytest tests/
python -m pylint lambdas/  # Check code quality
```

### Testing Checklist
- [ ] Code runs locally without errors
- [ ] New features have tests
- [ ] All existing tests pass
- [ ] Manual testing completed
- [ ] Edge cases considered

## 📋 Code Style Guidelines

### Frontend (TypeScript/React)

**File naming:**
- Components: `PascalCase.tsx` (e.g., `UploadZone.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Hooks: `use + PascalCase.ts` (e.g., `useAuth.ts`)

**Component structure:**
```typescript
// imports
import { useState } from 'react';

// types
interface Props {
  name: string;
  onSubmit: () => void;
}

// component
export default function MyComponent({ name, onSubmit }: Props) {
  const [state, setState] = useState('');
  
  // handlers
  const handleClick = () => {
    // logic
  };
  
  // render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

**Best practices:**
- Use functional components with hooks
- Destructure props
- Use TypeScript types/interfaces
- Keep components small (<200 lines)
- Extract complex logic to custom hooks

### Backend (Python)

**File naming:**
- `snake_case.py` (e.g., `resume_parser.py`)

**Function structure:**
```python
def function_name(param1: str, param2: int) -> dict:
    """
    Brief description of what function does.
    
    Args:
        param1: Description of param1
        param2: Description of param2
        
    Returns:
        Description of return value
    """
    # Implementation
    return result
```

**Best practices:**
- Use type hints
- Write docstrings for functions
- Follow PEP 8
- Keep functions focused (single responsibility)
- Handle errors explicitly

## 🚫 What NOT to Commit

**Never commit:**
- ❌ `.env` files with real credentials
- ❌ `node_modules/` or `__pycache__/`
- ❌ API keys or secrets
- ❌ Personal notes or TODO files
- ❌ Large binary files
- ❌ IDE-specific files (`.vscode/`, `.idea/`)
- ❌ `console.log()` or `print()` for debugging
- ❌ Commented-out code (delete it!)

## 🔧 Issue Management

### Creating Issues

Use issue templates for consistency:
- Bug Report
- Feature Request
- Task

### Issue Lifecycle

```
Open → In Progress → Review → Done
```

**Labels to use:**
- Type: `bug`, `feature`, `documentation`, `setup`
- Priority: `critical`, `high`, `medium`, `low`
- Assignment: `person-1`, `person-2`, `both`
- Status: `blocked`, `ready`, `in-progress`

## 📅 Weekly Workflow

### Monday
- Review project board
- Pick issues for the week
- Move to "This Week" column

### Daily
- Update issue with progress
- Commit frequently with good messages
- Push to remote at least once daily

### Friday
- Create PRs for completed work
- Review teammate's PRs
- Weekly sync meeting (4:00 PM)
- Plan next week's issues

## 🤝 Communication

### When to communicate:
- ✅ Before starting work on an issue (avoid conflicts)
- ✅ When blocked on something
- ✅ When changing approach on a task
- ✅ After completing a major milestone
- ✅ When discovering a bug that affects others

### Communication channels:
- **GitHub Issues**: For feature discussion, bugs
- **GitHub PR Comments**: For code review
- **Daily Standups**: 15 min sync (optional)
- **Weekly Sync**: Friday, 4:00 PM (mandatory)

## 🎯 Definition of Done

A task is "Done" when:
- [x] Code is written and tested
- [x] Tests pass
- [x] Code is reviewed and approved
- [x] Merged to develop
- [x] Documentation updated
- [x] Issue closed
- [x] Working in integration environment

## 🚀 Deployment Process

### Frontend (Vercel)
```bash
cd frontend
vercel deploy --prod
```

### Backend (AWS Lambda)
```bash
cd backend
./scripts/deploy_lambda.sh production
```

## 📚 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [PEP 8 Python Style Guide](https://pep8.org/)

## ❓ Questions?

If you're unsure about anything:
1. Check this guide
2. Check existing code for patterns
3. Ask your teammate
4. Document the decision in an issue comment

---

**Remember:** Good collaboration makes the project successful. When in doubt, over-communicate!
