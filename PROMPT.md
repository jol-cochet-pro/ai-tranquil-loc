# ISSUES

Local issues from github are provided at start of context. Parse them to understand the open issues.

You need to get the `git log` to understand what work has been done.

You need to create a new branch for each issue your will work on.

# TASK SELECTION

Pick the next task. Prioritize tasks in this order:

1. Critical bugfixes
2. Development infrastructure

Getting development infrastructure like tests and types and dev scripts ready is an important precursor to building features.

3. Tracer bullets for new features

Tracer bullets are small slices of functionality that go through all layers of the system, allowing you to test and validate your approach early. This helps in identifying potential issues and ensures that the overall architecture is sound before investing significant time in development.

TL;DR - build a tiny, end-to-end slice of the feature first, then expand it out.

4. Polish and quick wins
5. Refactors

# EXPLORATION

Explore the repo.

# IMPLEMENTATION

YOU MUST USE /tdd skill to complete the task.

# FEEDBACK LOOPS

Before committing, run the feedback loops in the backend and the frontend:

- `npm run test` to run the tests
- `npm run typecheck` to run the type checker
- `npm run lint` to run the linter

# COMMIT

Make a git commit everytime you make an important part of the issue. The commit message must:

1. Include key decisions made
2. Include files changed
3. Blockers or notes for next iteration

# THE ISSUE

At the end of your work, you need to create a merge request with a detailed description of what you've done through the issue.

# FINAL RULES

ONLY WORK ON A SINGLE TASK.