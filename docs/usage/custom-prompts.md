# Custom Prompts

Customize how the AI analyzes your workflow failures by providing custom prompts. This allows you to tailor the analysis to your specific needs, tech stack, and team preferences.

## Overview

The action uses two types of prompts:

1. **System Prompt**: Defines the AI's role, expertise, and output format
2. **User Prompt**: Provides the actual logs and specific analysis request

Both can be customized either inline or via files in your repository.

## Quick Start

### Using File-Based Prompts

1. Create prompt files in your repository:

```bash
mkdir -p .github/prompts
```

2. Add your custom prompts:

```markdown title=".github/prompts/system-prompt.md"
You are a senior Python engineer specializing in Django applications.
Analyze workflow failures with focus on:
- Database migration issues
- Django ORM errors
- Python dependency conflicts
- Test failures in pytest

Provide detailed, beginner-friendly explanations.
```

3. Reference in your workflow:

```yaml
- uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    custom-system-prompt: '.github/prompts/system-prompt.md'
```

### Using Inline Prompts

```yaml
- uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    custom-system-prompt: |
      You are a Node.js expert. Focus on npm/yarn issues,
      async/await problems, and Jest test failures.
```

## Default Prompts

### Default System Prompt

```markdown
You are an expert DevOps engineer analyzing GitHub Actions workflow failures. 
Your task is to analyze the provided workflow logs and provide a clear, 
actionable summary that helps developers quickly understand and fix the issues.

Focus on:
1. Root cause of the failure
2. Specific error messages and their meaning
3. Actionable steps to fix the issue
4. Related code files or dependencies mentioned in the logs

Format your response in Markdown with clear sections:
- **Summary**: Brief overview of what went wrong
- **Root Cause**: Technical explanation of the failure
- **Error Details**: Key error messages and their locations
- **Recommended Actions**: Step-by-step fix suggestions
- **Additional Context**: Any relevant information

Be concise but thorough. Focus on what developers need to know to fix the issue.
```

### Default User Prompt

```markdown
Analyze the following failed GitHub Actions workflow jobs and provide 
a comprehensive summary:

{{FAILED_JOBS}}

Please provide your analysis in the format specified in the system prompt.
```

## Template Variables

In the user prompt, you can use these variables:

- `{{FAILED_JOBS}}`: Replaced with formatted job logs and error information

## Prompt Examples

### Security-Focused Analysis

```markdown title=".github/prompts/security-analysis.md"
You are a security engineer analyzing CI/CD failures.

Priority focus areas:
1. **Secret Exposure**: Check if any secrets were accidentally logged
2. **Dependency Vulnerabilities**: Identify security issues in dependencies
3. **Permission Errors**: Analyze authentication and authorization failures
4. **Supply Chain**: Look for suspicious package installations

Format:
- **Security Impact**: Severity and potential risks
- **Immediate Actions**: Critical fixes needed
- **Long-term Recommendations**: Security improvements
```

### Performance-Focused Analysis

```markdown title=".github/prompts/performance-analysis.md"
You are a performance engineer analyzing slow or timeout failures.

Analyze for:
1. **Timeout Issues**: Identify operations exceeding time limits
2. **Resource Constraints**: Memory, CPU, or disk space issues
3. **Inefficient Operations**: Slow database queries, API calls
4. **Optimization Opportunities**: Caching, parallelization

Suggest:
- Quick wins for immediate improvement
- Long-term architectural changes
```

### Beginner-Friendly Analysis

```markdown title=".github/prompts/beginner-friendly.md"
You are a patient mentor helping junior developers understand CI failures.

Requirements:
1. **Explain Simply**: Avoid jargon, explain technical terms
2. **Provide Context**: Why did this fail? What should happen?
3. **Step-by-Step Fixes**: Detailed instructions with examples
4. **Learning Resources**: Links to docs, tutorials, examples
5. **Prevention Tips**: How to avoid this in the future

Use analogies and be encouraging!
```

### Language/Framework-Specific

=== "Python/Django"

    ```markdown
    You are a Python expert specializing in Django applications.
    
    Focus areas:
    - Django ORM and migration issues
    - pytest failures and fixtures
    - Virtual environment problems
    - pip/poetry dependency conflicts
    - Celery/async task issues
    
    Reference Django documentation when relevant.
    ```

=== "Node.js/React"

    ```markdown
    You are a Node.js and React specialist.
    
    Focus areas:
    - npm/yarn/pnpm dependency issues
    - Jest/Vitest test failures
    - Build errors (webpack, vite, next.js)
    - TypeScript compilation errors
    - ESLint/Prettier issues
    
    Suggest modern best practices.
    ```

=== "Go"

    ```markdown
    You are a Go expert analyzing build and test failures.
    
    Focus areas:
    - Module dependency issues (go.mod)
    - Test failures and race conditions
    - Build errors and compilation issues
    - golangci-lint problems
    - Cross-compilation issues
    
    Reference Go best practices and idioms.
    ```

=== "Java/Spring"

    ```markdown
    You are a Java engineer specializing in Spring Boot.
    
    Focus areas:
    - Maven/Gradle build failures
    - JUnit/TestNG test issues
    - Spring context problems
    - Dependency injection errors
    - Database connection issues
    
    Reference Spring documentation.
    ```

## Advanced Techniques

### Multi-Stage Analysis

Create different prompts for different scenarios:

```yaml
jobs:
  analyze-tests:
    if: contains(github.event.workflow_run.name, 'Test')
    steps:
      - uses: ianlintner/ai_summary_action@v1
        with:
          custom-system-prompt: '.github/prompts/test-analysis.md'
  
  analyze-builds:
    if: contains(github.event.workflow_run.name, 'Build')
    steps:
      - uses: ianlintner/ai_summary_action@v1
        with:
          custom-system-prompt: '.github/prompts/build-analysis.md'
```

### Team-Specific Prompts

```markdown title=".github/prompts/team-backend.md"
You are analyzing failures for the Backend Team.

Context:
- We use Python 3.11+ with FastAPI
- PostgreSQL 15 database
- Redis for caching
- Our code style: PEP 8, type hints required
- We prefer pytest with async fixtures

Link to our runbooks: https://wiki.company.com/backend/runbooks
```

### Output Format Customization

```markdown
Format your response as JSON:

{
  "severity": "critical|high|medium|low",
  "category": "build|test|deploy|integration",
  "root_cause": "brief explanation",
  "error_location": "file:line",
  "fix_steps": ["step 1", "step 2"],
  "estimated_time": "minutes to fix"
}
```

## Best Practices

### ✅ Do

- **Be Specific**: Tailor to your exact tech stack
- **Include Context**: Mention your team's standards and preferences  
- **Request Structure**: Specify exactly how you want output formatted
- **Add Examples**: Show the AI what good output looks like
- **Iterate**: Refine prompts based on results

### ❌ Don't

- **Over-Complicate**: Keep prompts focused and clear
- **Include Secrets**: Never put sensitive data in prompt files
- **Make Too Long**: Very long prompts can reduce quality
- **Ignore Defaults**: Default prompts are well-tested, start there

## Testing Your Prompts

Create a test workflow to validate prompts:

```yaml title=".github/workflows/test-prompts.yml"
name: Test Custom Prompts

on:
  workflow_dispatch:

jobs:
  fail-intentionally:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Testing custom prompts" && exit 1
  
  analyze-with-custom:
    runs-on: ubuntu-latest
    if: failure()
    needs: [fail-intentionally]
    steps:
      - uses: actions/checkout@v4
      - uses: ianlintner/ai_summary_action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          custom-system-prompt: '.github/prompts/system-prompt.md'
```

## Prompt Library

<!-- See our [Examples](../examples/custom-prompts.md) page for a collection of ready-to-use prompts for common scenarios. -->

## GitHub Copilot Integration

Custom prompts work great with GitHub Copilot. Use output format that Copilot can easily parse:

```markdown
Structure your analysis for GitHub Copilot consumption:

1. Use clear markdown headers
2. Include file paths and line numbers
3. Provide code snippets with proper syntax highlighting
4. Link to relevant documentation
5. Suggest specific code changes in diff format
```

Then ask Copilot: "Based on the AI failure analysis, suggest fixes for the failed tests"

## Troubleshooting

**Prompt not loading?**
- Check file path is correct relative to repository root
- Ensure file has `.md` or `.txt` extension
- Verify file is committed to the repository

**Poor quality analysis?**
- Prompts may be too vague - add more specifics
- Try using a more powerful model
- Increase `max-log-lines` for more context
- Review default prompts for ideas

**Getting errors?**
- Ensure prompts don't exceed model context limits
- Check for special characters that need escaping
- Validate prompt file is valid UTF-8

## Next Steps

<!-- - [View Example Prompts](../examples/custom-prompts.md)
- [Learn About LLM Providers](providers.md) -->
- [Integration with Copilot](../integrations/copilot.md)
