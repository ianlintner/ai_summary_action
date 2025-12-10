# AI Workflow Failure Summary Action

A GitHub Action that automatically analyzes failed workflow runs using AI (via LangChain) and generates actionable summaries to help debug and fix issues quickly.

## Features

- 🤖 **AI-Powered Analysis**: Uses LLM models to analyze failure logs and provide intelligent summaries
- 🔌 **Multiple LLM Providers**: Supports OpenAI, Azure OpenAI, GitHub Models, and Anthropic
- 📊 **Actionable Insights**: Generates structured summaries with root cause, error details, and fix recommendations
- 🎯 **GitHub Integration**: Automatically creates issues with analysis results
- 🔍 **Copilot Ready**: Outputs formatted for GitHub Copilot and VSCode review

## Usage

### Basic Usage with OpenAI

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test
  
  analyze-failure:
    runs-on: ubuntu-latest
    if: failure()
    needs: [test]
    steps:
      - name: Analyze Workflow Failure
        uses: ianlintner/ai_summary_action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          llm-provider: 'openai'
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

### Using GitHub Models

```yaml
- name: Analyze Workflow Failure
  uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    llm-provider: 'github-models'
    github-models-token: ${{ secrets.GITHUB_MODELS_TOKEN }}
    github-models-model: 'gpt-4o'
```

### Using Anthropic Claude

```yaml
- name: Analyze Workflow Failure
  uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    llm-provider: 'anthropic'
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    anthropic-model: 'claude-3-5-sonnet-20241022'
```

### Creating Issues Automatically

```yaml
- name: Analyze Workflow Failure
  uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    llm-provider: 'openai'
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    create-issue: 'true'
    issue-label: 'automated-analysis'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github-token` | GitHub token for accessing workflow logs | Yes | `${{ github.token }}` |
| `llm-provider` | LLM provider (openai, azure-openai, github-models, anthropic) | No | `openai` |
| `openai-api-key` | OpenAI API key | No* | - |
| `openai-model` | OpenAI model to use | No | `gpt-4o-mini` |
| `azure-openai-api-key` | Azure OpenAI API key | No* | - |
| `azure-openai-endpoint` | Azure OpenAI endpoint | No* | - |
| `azure-openai-deployment` | Azure OpenAI deployment name | No* | - |
| `github-models-token` | GitHub Models token (PAT) | No* | - |
| `github-models-model` | GitHub Models model name | No | `gpt-4o` |
| `anthropic-api-key` | Anthropic API key | No* | - |
| `anthropic-model` | Anthropic model name | No | `claude-3-5-sonnet-20241022` |
| `max-log-lines` | Max log lines to analyze per job | No | `500` |
| `create-issue` | Create GitHub issue with summary | No | `false` |
| `issue-label` | Label for created issues | No | `ai-analysis` |

*Required based on chosen `llm-provider`

## Outputs

| Output | Description |
|--------|-------------|
| `summary` | AI-generated summary of workflow failures |
| `failed-jobs` | JSON array of failed job names |
| `issue-url` | URL of created issue (if `create-issue` is true) |

## LLM Provider Setup

### OpenAI

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add it as a repository secret named `OPENAI_API_KEY`

### GitHub Models

1. Get a GitHub PAT with model access from [GitHub Settings](https://github.com/settings/tokens)
2. Add it as a repository secret named `GITHUB_MODELS_TOKEN`
3. Visit [GitHub Models Marketplace](https://github.com/marketplace/models) for available models

### Azure OpenAI

1. Deploy an Azure OpenAI resource
2. Add secrets: `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT`

### Anthropic

1. Get an API key from [Anthropic](https://console.anthropic.com/)
2. Add it as a repository secret named `ANTHROPIC_API_KEY`

## Example Output

The action generates a structured summary like:

```markdown
## Summary
The workflow failed due to a missing environment variable in the test job.

## Root Cause
The test suite expects `DATABASE_URL` to be defined but it was not set in the workflow environment.

## Error Details
- **Location**: test/integration/db.test.js:15
- **Error**: `Error: DATABASE_URL is not defined`

## Recommended Actions
1. Add `DATABASE_URL` to your workflow environment variables
2. Or add it to repository secrets and reference as `${{ secrets.DATABASE_URL }}`
3. Ensure the test database is accessible from GitHub Actions runners

## Additional Context
The error occurred in all test jobs, suggesting this is a configuration issue rather than a code problem.
```

## Development

### Building

```bash
npm install
npm run build
```

### Running Locally

Set environment variables and run:

```bash
export INPUT_GITHUB_TOKEN="your-token"
export INPUT_LLM_PROVIDER="openai"
export INPUT_OPENAI_API_KEY="your-key"
node dist/index.js
```

## Security Considerations

This action processes workflow logs and sends them to external LLM providers for analysis. Please be aware of the following:

### Data Handling

- **Workflow Logs**: The action extracts logs from failed jobs and sends them to your chosen LLM provider
- **Sensitive Data**: Ensure your workflows use GitHub's [secret masking](https://docs.github.com/en/actions/security-guides/encrypted-secrets) to prevent secrets from appearing in logs
- **Log Truncation**: Only the last 500 lines (configurable) of each failed job are analyzed to limit data exposure

### API Keys

- **Always use GitHub Secrets**: Store all API keys (OpenAI, Anthropic, etc.) as repository or organization secrets
- **Token Permissions**: The action requires `read` access to Actions logs and `write` access if creating issues

### LLM Provider Trust

- **Third-Party Processing**: Log data is sent to your chosen LLM provider for analysis
- **Provider Selection**: Choose a provider that meets your organization's data privacy requirements
- **Data Retention**: Review your LLM provider's data retention and usage policies

### Issue Creation

- **Public Repositories**: Be cautious when enabling automatic issue creation in public repos, as summaries may contain code snippets or error details
- **Review Summaries**: Consider reviewing AI-generated summaries before making them public
- **Access Control**: Issues are created in the same repository with the same visibility

### Recommendations

1. ✅ Use GitHub secrets for all API keys
2. ✅ Enable secret masking in your workflows
3. ✅ Avoid logging sensitive information
4. ✅ Review your LLM provider's security and privacy policies
5. ✅ Use the `max-log-lines` parameter to limit data sent to LLMs
6. ✅ Consider disabling `create-issue` for public repositories
7. ✅ Regularly rotate API keys

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
