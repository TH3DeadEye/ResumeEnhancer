Before making any changes, always read: @CHANGELOG.md @project_1_ai_resume_enhancer.md

After completing ALL changes in a session, you MUST update CHANGELOG.md:
- Add a new dated entry at the top of the session log
- List every file modified and why
- Update the bug backlog table (mark fixed bugs ✅)
- Update the MVP Remaining Work table
- Never skip this step — it is required at the end of every session

CODING RULES — apply to every single edit:
- Never hardcode colors, sizes, or spacing
- All colors must use CSS variables: var(--primary), var(--bg), var(--text), etc.
- Fix layout bugs at root cause — never patch with magic margin/padding
- Stack: Next.js 15 App Router, TypeScript, Tailwind CSS, GSAP, AWS Amplify
- No plain React patterns — always use App Router conventions
- When fixing layout: check max-width, overflow, and flex/grid constraints first
- When touching API routes: always add console.log timing logs (start + end + ms)
- After every session, tell me exactly which files were modified