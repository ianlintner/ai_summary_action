# Configuration Reference

Complete reference for all configuration options available in the AI Workflow Failure Summary Action.

## Input Parameters

### Required Inputs

#### `github-token`
- **Type:** `string`
- **Required:** Yes
- **Default:** `${{ github.token }}`
- **Description:** GitHub token for accessing workflow logs and creating issues

```yaml
github-token: ${{ secrets.GITHUB_TOKEN }}
```

### LLM Provider Configuration

#### `llm-provider`
- **Type:** `string`
- **Required:** No
- **Default:** `openai`
- **Options:** `openai`, `azure-openai`, `github-models`, `anthropic`
- **Description:** Which LLM provider to use for analysis

```yaml
llm-provider: 'openai'
```

### OpenAI Configuration

#### `openai-api-key`
- **Type:** `string`
- **Required:** When using OpenAI provider
- **Description:** OpenAI API key

```yaml
openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

#### `openai-model`
- **Type:** `string`
- **Required:** No
- **Default:** `gpt-4o-mini`
- **Options:** Any OpenAI chat model (e.g., `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`)
- **Description:** OpenAI model to use for analysis

```yaml
openai-model: 'gpt-4o'
```

### Azure OpenAI Configuration

#### `azure-openai-api-key`
- **Type:** `string`
- **Required:** When using Azure OpenAI provider
- **Description:** Azure OpenAI API key

```yaml
azure-openai-api-key: ${{ secrets.AZURE_OPENAI_API_KEY }}
```

#### `azure-openai-endpoint`
- **Type:** `string`
- **Required:** When using Azure OpenAI provider
- **Description:** Azure OpenAI endpoint URL

```yaml
azure-openai-endpoint: 'https://your-resource.openai.azure.com'
```

#### `azure-openai-deployment`
- **Type:** `string`
- **Required:** When using Azure OpenAI provider
- **Description:** Azure OpenAI deployment name

```yaml
azure-openai-deployment: 'gpt-4o-deployment'
```

### GitHub Models Configuration

#### `github-models-token`
- **Type:** `string`
- **Required:** When using GitHub Models provider
- **Description:** GitHub PAT with model access (can use `GITHUB_TOKEN`)

```yaml
github-models-token: ${{ secrets.GITHUB_TOKEN }}
```

#### `github-models-model`
- **Type:** `string`
- **Required:** No
- **Default:** `gpt-4o`
- **Options:** `gpt-4o`, `gpt-4o-mini`, `claude-3-5-sonnet`, etc.
- **Description:** GitHub Models model to use

```yaml
github-models-model: 'gpt-4o'
```

### Anthropic Configuration

#### `anthropic-api-key`
- **Type:** `string`
- **Required:** When using Anthropic provider
- **Description:** Anthropic API key

```yaml
anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

#### `anthropic-model`
- **Type:** `string`
- **Required:** No
- **Default:** `claude-3-5-sonnet-20241022`
- **Options:** `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, etc.
- **Description:** Anthropic model to use

```yaml
anthropic-model: 'claude-3-5-sonnet-20241022'
```

### Analysis Configuration

#### `max-log-lines`
- **Type:** `string`
- **Required:** No
- **Default:** `500`
- **Description:** Maximum number of log lines to analyze per failed job

```yaml
max-log-lines: '1000'
```

!!! info "Token Limits"
    Higher values provide more context but use more tokens. Consider your LLM's context window and costs.

### Issue Creation

#### `create-issue`
- **Type:** `string` (boolean)
- **Required:** No
- **Default:** `false`
- **Options:** `true`, `false`
- **Description:** Whether to create a GitHub issue with the analysis

```yaml
create-issue: 'true'
```

#### `issue-label`
- **Type:** `string`
- **Required:** No
- **Default:** `ai-analysis`
- **Description:** Label to add to created issues

```yaml
issue-label: 'automated-analysis'
```

### Custom Prompts

#### `custom-system-prompt`
- **Type:** `string`
- **Required:** No
- **Description:** Custom system prompt or path to prompt file

```yaml
custom-system-prompt: '.github/prompts/system-prompt.md'
# or inline:
custom-system-prompt: 'You are a Python expert analyzing pytest failures...'
```

#### `custom-user-prompt`
- **Type:** `string`
- **Required:** No
- **Description:** Custom user prompt template or path to prompt file

```yaml
custom-user-prompt: '.github/prompts/user-prompt.md'
```

See [Custom Prompts](../usage/custom-prompts.md) for details.

## Output Parameters

### `summary`
- **Type:** `string`
- **Description:** AI-generated summary of workflow failures

```yaml
- id: analyze
  uses: ianlintner/ai_summary_action@v1
  # ... inputs

- name: Use Summary
  run: echo "${{ steps.analyze.outputs.summary }}"
```

### `failed-jobs`
- **Type:** `string` (JSON array)
- **Description:** Array of failed job names

```yaml
- name: List Failed Jobs
  run: echo "${{ steps.analyze.outputs.failed-jobs }}"
```

### `issue-url`
- **Type:** `string`
- **Description:** URL of created issue (only when `create-issue` is `true`)

```yaml
- name: Link to Issue
  if: steps.analyze.outputs.issue-url
  run: echo "Issue created: ${{ steps.analyze.outputs.issue-url }}"
```

## Complete Configuration Examples

### Minimal Configuration

```yaml
- uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

### Recommended Configuration

```yaml
- uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    llm-provider: 'openai'
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    openai-model: 'gpt-4o-mini'
    max-log-lines: '500'
    create-issue: 'true'
    issue-label: 'ci-failure'
```

### Advanced Configuration

```yaml
- uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    llm-provider: 'anthropic'
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    anthropic-model: 'claude-3-5-sonnet-20241022'
    max-log-lines: '1000'
    create-issue: 'true'
    issue-label: 'automated-analysis'
    custom-system-prompt: '.github/prompts/system-prompt.md'
    custom-user-prompt: '.github/prompts/user-prompt.md'
```

## Environment Variables

The action respects these environment variables:

- `GITHUB_WORKSPACE`: Used to resolve relative paths for custom prompts
- `GITHUB_TOKEN`: Can be used implicitly via `${{ github.token }}`

## Permissions

Required workflow permissions:

```yaml
permissions:
  actions: read       # Required: Read workflow logs
  contents: read      # Required: Access repository
  issues: write       # Optional: Only if create-issue is true
```

## Best Practices

### Cost Optimization

```yaml
# Use smaller, cheaper models for most analysis
openai-model: 'gpt-4o-mini'
max-log-lines: '500'

# Or use free GitHub Models
llm-provider: 'github-models'
github-models-token: ${{ secrets.GITHUB_TOKEN }}
```

### Quality Optimization

```yaml
# Use more powerful models for better analysis
llm-provider: 'anthropic'
anthropic-model: 'claude-3-5-sonnet-20241022'
max-log-lines: '1000'
custom-system-prompt: '.github/prompts/detailed-analysis.md'
```

### Security

```yaml
# Never hardcode API keys
openai-api-key: ${{ secrets.OPENAI_API_KEY }}  # ✅ Good

# Don't do this:
# openai-api-key: 'sk-...'  # ❌ Bad
```

## Troubleshooting Configuration

See the [Troubleshooting Guide](../advanced/troubleshooting.md) for common configuration issues.
