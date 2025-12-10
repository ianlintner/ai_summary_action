# Custom Prompt Templates

This directory contains example prompt templates that you can customize for your specific needs.

## How to Use

### Option 1: Use Files in Your Repository

1. Copy these example files to your repository's `.github/prompts/` directory
2. Customize them to fit your needs
3. Reference them in your workflow:

```yaml
- uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    llm-provider: 'openai'
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    custom-system-prompt: '.github/prompts/system-prompt.md'
    custom-user-prompt: '.github/prompts/user-prompt.md'
```

### Option 2: Inline Prompts

You can also provide prompts inline:

```yaml
- uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    llm-provider: 'openai'
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    custom-system-prompt: |
      You are a senior engineer. Analyze these logs and be extra detailed.
```

## Template Variables

In the user prompt template, you can use these variables:

- `{{FAILED_JOBS}}` - Will be replaced with formatted job logs

## Examples

### Security-Focused Analysis

```markdown
You are a security engineer analyzing workflow failures. Focus on:
- Potential security vulnerabilities exposed in logs
- Secret leakage risks
- Permission issues
- Dependency security concerns
```

### Performance-Focused Analysis

```markdown
You are a performance engineer. When analyzing failures:
- Identify timeout issues
- Look for resource constraints
- Suggest optimization opportunities
- Consider caching strategies
```

### Beginner-Friendly Analysis

```markdown
You are a patient mentor helping junior developers. When analyzing:
- Explain technical terms in simple language
- Provide links to relevant documentation
- Suggest learning resources
- Include example fixes with explanations
```

## Tips for Customization

1. **Be Specific**: Tailor prompts to your tech stack (e.g., "for Node.js projects" or "for Python Django apps")
2. **Add Context**: Include information about your team's coding standards or common issues
3. **Format Requirements**: Specify exactly how you want the output structured
4. **Link Resources**: Include links to your team's runbooks or documentation
5. **Language Preference**: Request responses in specific languages if needed

## Integration with GitHub Copilot

These prompts work seamlessly with GitHub Copilot. The structured output format makes it easy for Copilot to:
- Parse and understand the analysis
- Suggest relevant code fixes
- Reference specific error locations
- Provide context-aware assistance

Simply ask Copilot: "Review the latest workflow failure analysis and suggest fixes"
