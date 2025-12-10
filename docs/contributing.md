# Contributing to AI Workflow Failure Summary Action

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Documentation](#documentation)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](https://github.com/ianlintner/ai_summary_action/blob/main/CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 9 or higher
- Git
- A GitHub account

### Finding Issues to Work On

- Check the [issue tracker](https://github.com/ianlintner/ai_summary_action/issues)
- Look for issues labeled `good first issue` for beginner-friendly tasks
- Issues labeled `help wanted` are great for contributions
- Feel free to create new issues for bugs or feature requests

## Development Setup

1. **Fork and Clone**

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/ai_summary_action.git
cd ai_summary_action
```

2. **Install Dependencies**

```bash
npm install
```

3. **Set Up Environment**

Create a `.env` file for local testing (never commit this):

```env
INPUT_GITHUB_TOKEN=your_github_token
INPUT_LLM_PROVIDER=openai
INPUT_OPENAI_API_KEY=your_openai_key
```

## Project Structure

```
ai_summary_action/
├── .github/
│   ├── workflows/          # GitHub Actions workflows
│   └── prompts/           # Example prompt templates
├── docs/                  # MkDocs documentation
├── src/
│   ├── index.ts          # Main entry point
│   ├── analyzer.ts       # AI analysis logic
│   └── github-client.ts  # GitHub API interactions
├── dist/                 # Compiled JavaScript (committed)
├── action.yml            # Action metadata
├── mkdocs.yml           # MkDocs configuration
├── package.json         # Node.js dependencies
└── tsconfig.json        # TypeScript configuration
```

## Making Changes

### Branch Naming

Use descriptive branch names:

```bash
# Features
git checkout -b feature/add-custom-prompts
git checkout -b feature/support-new-llm

# Bug fixes
git checkout -b fix/issue-123-log-parsing
git checkout -b fix/timeout-error

# Documentation
git checkout -b docs/improve-quickstart
git checkout -b docs/add-examples
```

### Code Style

We use automated formatting and linting:

```bash
# Format code
npm run format

# Check formatting
npm run format-check

# Lint code
npm run lint
```

**Key Conventions:**
- Use TypeScript for all new code
- Follow existing code patterns
- Add JSDoc comments for public functions
- Use meaningful variable names
- Keep functions small and focused

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Features
git commit -m "feat: add custom prompt support"
git commit -m "feat(analyzer): support streaming responses"

# Fixes
git commit -m "fix: resolve log truncation issue"
git commit -m "fix(github-client): handle rate limiting"

# Documentation
git commit -m "docs: improve installation guide"
git commit -m "docs(api): add examples for custom prompts"

# Chores
git commit -m "chore: update dependencies"
git commit -m "chore(ci): improve workflow performance"
```

## Testing

### Build the Action

```bash
npm run build
```

This compiles TypeScript and bundles everything into `dist/index.js`.

### Local Testing

Test the action locally:

```bash
# Set environment variables
export INPUT_GITHUB_TOKEN="..."
export INPUT_LLM_PROVIDER="openai"
export INPUT_OPENAI_API_KEY="..."

# Run the action
node dist/index.js
```

### Testing in a Workflow

Create a test workflow in your fork:

```yaml
name: Test Changes

on:
  workflow_dispatch:

jobs:
  fail-test:
    runs-on: ubuntu-latest
    steps:
      - run: exit 1
  
  test-action:
    runs-on: ubuntu-latest
    if: failure()
    needs: [fail-test]
    steps:
      - uses: actions/checkout@v4
      - uses: ./
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

### Automated Tests

Run existing tests (when available):

```bash
npm test
```

## Submitting Changes

### Pull Request Process

1. **Update Your Branch**

```bash
git fetch upstream
git rebase upstream/main
```

2. **Build and Test**

```bash
npm run build
npm run lint
npm run format-check
```

3. **Commit dist/ Directory**

⚠️ **Important:** Always commit the built `dist/` directory:

```bash
git add dist/
git commit -m "build: compile changes"
```

4. **Push to Your Fork**

```bash
git push origin your-branch-name
```

5. **Create Pull Request**

- Go to the repository on GitHub
- Click "New Pull Request"
- Select your branch
- Fill out the PR template
- Link related issues

### Pull Request Template

Your PR should include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
How did you test these changes?

## Checklist
- [ ] Code follows project style guidelines
- [ ] Built and committed dist/ directory
- [ ] Updated documentation if needed
- [ ] Tested locally
- [ ] Added/updated tests (if applicable)

## Related Issues
Fixes #123
```

## Documentation

### Writing Documentation

Documentation is written in Markdown and built with MkDocs.

1. **Preview Documentation Locally**

```bash
# Install MkDocs
pip install mkdocs-material mkdocs-mermaid2-plugin

# Serve locally
mkdocs serve

# Visit http://127.0.0.1:8000
```

2. **Documentation Guidelines**

- Use clear, concise language
- Include code examples
- Add diagrams where helpful (Mermaid)
- Test all code examples
- Keep structure consistent
- Add links to related pages

3. **Adding New Pages**

Update `mkdocs.yml`:

```yaml
nav:
  - Home: index.md
  - Your Section:
    - New Page: section/new-page.md
```

## Release Process

For maintainers:

1. **Update Version**

```bash
# Update package.json version
npm version major|minor|patch
```

2. **Update Changelog**

Update `docs/changelog.md` with changes.

3. **Create Release**

```bash
# Tag the release
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

4. **GitHub Release**

Create a release on GitHub with:
- Release notes from changelog
- Link to documentation
- Migration guide (if breaking changes)

## Getting Help

- 💬 [GitHub Discussions](https://github.com/ianlintner/ai_summary_action/discussions)
- 🐛 [Issue Tracker](https://github.com/ianlintner/ai_summary_action/issues)
- 📖 [Documentation](https://ianlintner.github.io/ai_summary_action/)

## Recognition

Contributors are recognized in:
- Release notes
- Contributors section in README
- GitHub's contributor graph

Thank you for contributing! 🎉
