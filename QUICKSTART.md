# Quick Start Guide

## Drop-in Workflow for Your Repository

Add this to `.github/workflows/ai-failure-analysis.yml` in your repository:

```yaml
name: AI Failure Analysis

on:
  workflow_run:
    workflows: ["*"]  # Monitor all workflows
    types:
      - completed

jobs:
  analyze-failure:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    
    steps:
      - name: Analyze Failed Workflow
        uses: ianlintner/ai_summary_action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          llm-provider: 'openai'
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          create-issue: 'true'
```

## Setup Steps

1. **Add API Key Secret**:
   - Go to your repository Settings → Secrets and variables → Actions
   - Add a new secret named `OPENAI_API_KEY` with your OpenAI API key

2. **Create the Workflow File**:
   - Create `.github/workflows/ai-failure-analysis.yml`
   - Paste the workflow above

3. **Test It**:
   - Trigger a workflow that will fail
   - The AI analysis will run automatically
   - Check the Actions tab for the summary

## Alternative: Add to Existing Workflow

Add this as the last job in any workflow:

```yaml
jobs:
  # Your existing jobs here
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
  
  # Add this job
  analyze-on-failure:
    runs-on: ubuntu-latest
    if: failure()
    needs: [test]  # List all jobs to monitor
    steps:
      - name: AI Failure Analysis
        uses: ianlintner/ai_summary_action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          llm-provider: 'openai'
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

## Using Different LLM Providers

### GitHub Models (Free with GitHub account)
```yaml
- uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    llm-provider: 'github-models'
    github-models-token: ${{ secrets.GITHUB_TOKEN }}  # Can use same token
```

### Anthropic Claude
```yaml
- uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    llm-provider: 'anthropic'
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

## What You Get

The action will:
- ✅ Detect all failed jobs in the workflow
- ✅ Extract relevant error logs
- ✅ Send to AI for analysis
- ✅ Generate a structured summary with:
  - Root cause identification
  - Specific error details
  - Recommended fix actions
  - Additional context
- ✅ Display in GitHub Actions summary
- ✅ Optionally create an issue

## VSCode/Copilot Integration

The generated summaries are formatted for easy consumption by:
- GitHub Copilot Chat
- VSCode GitHub Issues extension
- Any AI assistant that can read GitHub content

Simply ask Copilot: "Review the latest AI failure analysis issue and suggest fixes"
