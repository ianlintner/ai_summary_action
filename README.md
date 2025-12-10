# AI Workflow Failure Summary Action

[![GitHub release](https://img.shields.io/github/v/release/ianlintner/ai_summary_action?style=flat-square)](https://github.com/ianlintner/ai_summary_action/releases)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-AI%20Workflow%20Summary-blue.svg?colorA=24292e&colorB=0366d6&style=flat&longCache=true&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAM6wAADOsB5dZE0gAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAERSURBVCiRhZG/SsMxFEZPfsVJ61jbxaF0cRQRcRJ9hlYn30IHN/+9iquDCOIsblIrOjqKgy5aKoJQj4O3EEtbPwhJbr6Te28CmdSKeqzeqr0YbfVIrTBKakvtOl5dtTkK+v4HfA9PEyBFCY9AGVgCBLaBp1jPAyfAJ/AAdIEG0dNAiyP7+K1qIfMdonZic6+WJoBJvQlvuwDqcXadUuqPA1NKAlexbRTAIMvMOCjTbMwl1LtI/6KWJ5Q6rT6Ht1MA58AX8Apcqqt5r2qhrgAXQC3CZ6i1+KMd9TRu3MvA3aH/fFPnBodb6oe6HM8+lYHrGdRXW8M9bMZtPXUji69lmf5Cmamq7quNLFZXD9Rq7v0Bpc1o/tp0fisAAAAASUVORK5CYII=)](https://github.com/marketplace/actions/ai-workflow-failure-summary)
[![License](https://img.shields.io/github/license/ianlintner/ai_summary_action?style=flat-square)](LICENSE)
[![Documentation](https://img.shields.io/badge/docs-available-brightgreen?style=flat-square)](https://ianlintner.github.io/ai_summary_action/)
[![CI](https://github.com/ianlintner/ai_summary_action/actions/workflows/example.yml/badge.svg)](https://github.com/ianlintner/ai_summary_action/actions/workflows/example.yml)


<img width="1101" height="806" alt="Screenshot 2025-12-10 at 13 31 12" src="https://github.com/user-attachments/assets/3462b6fb-9e8d-49de-aa7e-2d3b1071ea0b" />

## Features

- 🤖 **AI-Powered Analysis**: Uses LLM models to analyze failure logs and provide intelligent summaries
- 🔌 **Multiple LLM Providers**: Supports OpenAI, Azure OpenAI, GitHub Models, and Anthropic
- 📊 **Actionable Insights**: Generates structured summaries with root cause, error details, and fix recommendations
- 💬 **PR Comments**: Automatically comments on pull requests when failures occur (default behavior)
- 🎯 **GitHub Integration**: Optionally creates issues with analysis results, with branch filtering
- 📋 **Console Logging**: Summary is displayed in workflow logs for easy viewing
- 🔄 **Output Reusability**: Summary can be used as input for other actions (Slack, email, etc.)
- 🔍 **Copilot Ready**: Outputs formatted for GitHub Copilot and VSCode review
- 🧠 **Memory & Caching**: Learns from past failures for context-aware analysis
- 🎨 **Customizable Prompts**: Tailor AI analysis with custom prompts via `.github/prompts/`

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

### Commenting on Pull Requests

By default, the action will comment on the originating pull request instead of creating an issue when the workflow run is triggered by a PR:

```yaml
- name: Analyze Workflow Failure
  uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    llm-provider: 'openai'
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    comment-on-pr: 'true'  # This is the default
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
    issue-branch-filter: 'main,develop'  # Optional: only create issues on specific branches
```

### Using Summary Output in Other Jobs

The action outputs the summary as a string that can be used in subsequent jobs:

```yaml
jobs:
  analyze-failure:
    runs-on: ubuntu-latest
    if: failure()
    outputs:
      summary: ${{ steps.analyze.outputs.summary }}
      pr-number: ${{ steps.analyze.outputs.pr-number }}
    steps:
      - name: Analyze Workflow Failure
        id: analyze
        uses: ianlintner/ai_summary_action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
  
  notify-slack:
    runs-on: ubuntu-latest
    needs: analyze-failure
    steps:
      - name: Send to Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Workflow failed: ${{ needs.analyze-failure.outputs.summary }}"
            }
```

### Using Memory & Caching for Context-Aware Analysis

Enable memory to help the AI understand past failures and provide better recommendations:

```yaml
- name: Analyze Workflow Failure
  uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    llm-provider: 'openai'
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    enable-memory: 'true'
    cache-strategy: 'actions-cache'
    memory-scope: 'branch'
    max-historical-runs: '10'
```

With memory enabled, the AI can:
- Identify recurring issues
- Reference previous failures and attempted fixes
- Detect patterns across multiple runs
- Provide more informed recommendations based on history

### Customizing AI Prompts

Tailor the AI analysis to your specific needs with custom prompts:

```yaml
- name: Analyze Workflow Failure
  uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    custom-system-prompt: '.github/prompts/system-prompt.md'
    custom-user-prompt: '.github/prompts/user-prompt.md'
```

See the [Custom Prompts Guide](https://ianlintner.github.io/ai_summary_action/usage/custom-prompts/) for examples.

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
| `issue-branch-filter` | Only create issues on specific branches (comma-separated, e.g., "main,develop") | No | `` (all branches) |
| `comment-on-pr` | Comment on pull request if run is from a PR | No | `true` |
| `custom-system-prompt` | Custom system prompt or file path | No | - |
| `custom-user-prompt` | Custom user prompt template or file path | No | - |
| `enable-memory` | Enable memory and caching | No | `false` |
| `cache-strategy` | Cache storage strategy (actions-cache, github-issues, git-notes) | No | `actions-cache` |
| `memory-scope` | Memory scope (branch, repository, workflow) | No | `branch` |
| `memory-retention-days` | Days to retain memory data | No | `30` |
| `max-historical-runs` | Max historical runs to include | No | `10` |
| `include-commit-changes` | Include recent commit changes | No | `true` |

*Required based on chosen `llm-provider`

## Outputs

| Output | Description |
|--------|-------------|
| `summary` | AI-generated summary of workflow failures |
| `failed-jobs` | JSON array of failed job names |
| `issue-url` | URL of created issue (if `create-issue` is true) |
| `pr-comment-url` | URL of PR comment (if `comment-on-pr` is true and run is from a PR) |
| `pr-number` | Pull request number if the workflow run originated from a PR |
| `historical-failures` | JSON array of previous failures (if `enable-memory` is true) |
| `branch-patterns` | Detected patterns from branch history (if `enable-memory` is true) |
| `similar-issues` | Links to similar past issues (if `enable-memory` is true) |

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
