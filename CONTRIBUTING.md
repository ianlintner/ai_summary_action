# Contributing to AI Summary Action

Thank you for your interest in contributing! Here are some guidelines to help you get started.

## Development Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/yourusername/ai_summary_action.git
cd ai_summary_action
```

2. Install dependencies:
```bash
npm install
```

3. Make your changes in the `src/` directory

4. Format and lint your code:
```bash
npm run format
npm run lint
```

5. Build the action:
```bash
npm run build
```

## Testing

Before submitting a pull request:

1. Ensure your code builds without errors: `npm run build`
2. Test the action in a workflow (see `.github/workflows/example.yml`)
3. Verify all formatting and linting passes

## Submitting Changes

1. Create a new branch for your feature/fix
2. Make your changes
3. Commit with clear, descriptive messages
4. Push to your fork
5. Open a pull request

## Code Style

- Use TypeScript for all new code
- Follow the existing code style (enforced by Prettier and ESLint)
- Add JSDoc comments for public functions
- Keep functions focused and single-purpose

## Adding LLM Providers

To add support for a new LLM provider:

1. Add the provider configuration to `action.yml` inputs
2. Update the `createLLMClient` function in `src/analyzer.ts`
3. Add LangChain dependencies if needed
4. Document usage in README.md
5. Add example workflow

## Questions?

Feel free to open an issue for questions or discussions.
