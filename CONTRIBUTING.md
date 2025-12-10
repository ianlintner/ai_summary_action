# Contributing to AI Workflow Failure Summary Action

Thank you for your interest in contributing! This guide will help you get started with development.

## 📖 Full Documentation

For comprehensive contribution guidelines, please see our [Contributing Guide](https://ianlintner.github.io/ai_summary_action/contributing/) in the documentation.

## Quick Start

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/yourusername/ai_summary_action.git
cd ai_summary_action
```

2. **Install Dependencies**
```bash
npm install
```

3. **Make Changes**
- Edit files in the `src/` directory
- Update documentation in `docs/` if needed

4. **Build and Test**
```bash
# Format code
npm run format

# Lint code
npm run lint

# Build the action
npm run build
```

5. **Test Your Changes**
```bash
# Test locally
export INPUT_GITHUB_TOKEN="your-token"
export INPUT_OPENAI_API_KEY="your-key"
node dist/index.js
```

## Pull Request Process

1. **Create a Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Your Changes**
- Follow existing code style
- Add/update tests as needed
- Update documentation

3. **Build and Commit**
```bash
npm run build
git add .
git commit -m "feat: add your feature"
```

⚠️ **Important:** Always commit the `dist/` directory after building!

4. **Push and Create PR**
```bash
git push origin feature/your-feature-name
```

Then open a pull request on GitHub.

## Code Style

- ✅ Use TypeScript for all code
- ✅ Follow Prettier formatting (runs automatically)
- ✅ Pass ESLint checks
- ✅ Add JSDoc comments for functions
- ✅ Keep functions small and focused

## Project Structure

```
ai_summary_action/
├── src/                    # Source code
│   ├── index.ts           # Main entry point
│   ├── analyzer.ts        # AI analysis logic
│   ├── github-client.ts   # GitHub API interactions
│   └── memory-manager.ts  # Memory/caching features
├── docs/                   # MkDocs documentation
├── .github/
│   ├── workflows/         # GitHub Actions workflows
│   └── prompts/           # Example prompt templates
├── dist/                   # Built JavaScript (committed)
└── action.yml             # Action metadata
```

## Testing

### Unit Tests (when available)
```bash
npm test
```

### Integration Testing
Create a test workflow in your fork:

```yaml
name: Test My Changes
on: workflow_dispatch

jobs:
  fail-test:
    runs-on: ubuntu-latest
    steps:
      - run: exit 1
  
  test-action:
    if: failure()
    needs: [fail-test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

## Adding New Features

### Adding an LLM Provider

1. Add provider config to `action.yml`
2. Update `createLLMClient()` in `src/analyzer.ts`
3. Add LangChain dependency if needed
4. Document in `docs/usage/providers.md`
5. Add example to README

### Adding Documentation

1. Create/edit files in `docs/`
2. Update `mkdocs.yml` navigation
3. Test locally:
```bash
pip install mkdocs-material mkdocs-mermaid2-plugin
mkdocs serve
```

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Test updates

Examples:
```
feat: add memory caching feature
fix: resolve log truncation issue
docs: improve quickstart guide
```

## Code of Conduct

This project adheres to the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Help

- 📖 [Full Documentation](https://ianlintner.github.io/ai_summary_action/)
- 💬 [GitHub Discussions](https://github.com/ianlintner/ai_summary_action/discussions)
- 🐛 [Report Issues](https://github.com/ianlintner/ai_summary_action/issues)

## Recognition

Contributors are recognized in:
- Release notes
- README contributors section
- GitHub's contributor graph

Thank you for contributing! 🎉
