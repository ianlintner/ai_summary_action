# Quick Start Guide

Get AI-powered workflow failure analysis running in your repository in less than 5 minutes!

## Prerequisites

- A GitHub repository with Actions enabled
- An API key from one of the supported LLM providers:
    - [OpenAI](https://platform.openai.com/api-keys) (recommended for beginners)
    - [GitHub Models](https://github.com/marketplace/models) (free tier available)
    - [Anthropic Claude](https://console.anthropic.com/)
    - [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service)

## Step 1: Add Your API Key

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add your secret:
    - Name: `OPENAI_API_KEY` (or provider-specific name)
    - Value: Your API key
5. Click **Add secret**

!!! tip "Using GitHub Models"
    If using GitHub Models, you can use `${{ secrets.GITHUB_TOKEN }}` directly - no additional secret needed!

## Step 2: Create the Workflow

Create a new file: `.github/workflows/ai-failure-analysis.yml`

=== "Automatic (Monitors All Workflows)"

    ```yaml
    name: AI Failure Analysis
    
    on:
      workflow_run:
        workflows: ["*"]  # Monitor all workflows
        types: [completed]
    
    jobs:
      analyze:
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

=== "Manual (Add to Existing Workflow)"

    ```yaml
    # Add this job to your existing workflow
    analyze-failure:
      runs-on: ubuntu-latest
      if: failure()
      needs: [test, build]  # Add all jobs you want to monitor
      
      steps:
        - name: AI Failure Analysis
          uses: ianlintner/ai_summary_action@v1
          with:
            github-token: ${{ secrets.GITHUB_TOKEN }}
            llm-provider: 'openai'
            openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    ```

=== "GitHub Models (Free)"

    ```yaml
    name: AI Failure Analysis
    
    on:
      workflow_run:
        workflows: ["*"]
        types: [completed]
    
    jobs:
      analyze:
        runs-on: ubuntu-latest
        if: ${{ github.event.workflow_run.conclusion == 'failure' }}
        
        steps:
          - name: Analyze with GitHub Models
            uses: ianlintner/ai_summary_action@v1
            with:
              github-token: ${{ secrets.GITHUB_TOKEN }}
              llm-provider: 'github-models'
              github-models-token: ${{ secrets.GITHUB_TOKEN }}
              github-models-model: 'gpt-4o'
              create-issue: 'true'
    ```

## Step 3: Test It!

1. **Commit and push** the workflow file
2. **Trigger a workflow** that will fail (or wait for one to fail naturally)
3. **Check the Actions tab** to see the AI analysis

## What You'll Get

After a workflow fails, you'll see:

### 1. **GitHub Actions Summary**
A detailed analysis appears in the Actions summary tab:

```markdown
## 🔍 AI Workflow Failure Analysis

### Summary
The test suite failed due to a missing environment variable...

### Root Cause
The DATABASE_URL environment variable is not set...

### Recommended Actions
1. Add DATABASE_URL to your workflow
2. Configure it in repository secrets
...
```

### 2. **GitHub Issue (if enabled)**
An automatically created issue with the full analysis and links to the failed run.

### 3. **Action Outputs**
Available for use in subsequent workflow steps:
- `summary`: The AI-generated analysis
- `failed-jobs`: List of failed job names
- `issue-url`: URL of created issue (if enabled)

## Next Steps

<div class="grid cards" markdown>

-   :material-cog: **[Configure Options](../configuration.md)**
    
    Customize behavior, prompts, and more

-   :material-brain: **[Custom Prompts](../usage/custom-prompts.md)**
    
    Tailor AI analysis to your needs

-   :material-creation: **[LLM Providers](../usage/providers.md)**
    
    Learn about all supported providers

-   :material-github: **[Copilot Integration](../integrations/copilot.md)**
    
    Use with GitHub Copilot for even better debugging

</div>

## Troubleshooting

!!! warning "Action Not Running?"
    Make sure your workflow has the necessary permissions. Add this to your workflow:
    ```yaml
    permissions:
      actions: read
      contents: read
      issues: write  # If creating issues
    ```

!!! warning "API Key Issues?"
    - Verify the secret name matches exactly
    - Ensure the API key is valid and has quota
    - Check provider-specific requirements

!!! tip "Need Help?"
    - 📖 Check the [Troubleshooting Guide](../advanced/troubleshooting.md)
    - 🐛 [Open an Issue](https://github.com/ianlintner/ai_summary_action/issues)
    - 💬 Ask in [Discussions](https://github.com/ianlintner/ai_summary_action/discussions)

## Complete Example

Here's a full working example with all recommended settings:

```yaml title=".github/workflows/ai-failure-analysis.yml"
name: AI Failure Analysis

on:
  workflow_run:
    workflows: ["CI", "Tests", "Build"]  # Specific workflows to monitor
    types: [completed]

permissions:
  actions: read
  contents: read
  issues: write

jobs:
  analyze:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    
    steps:
      - name: Analyze Failed Workflow
        uses: ianlintner/ai_summary_action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          llm-provider: 'openai'
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          openai-model: 'gpt-4o-mini'
          max-log-lines: '500'
          create-issue: 'true'
          issue-label: 'automated-analysis'
      
      - name: Comment on PR (if applicable)
        if: github.event.workflow_run.pull_requests[0]
        uses: actions/github-script@v7
        with:
          script: |
            const summary = '${{ steps.analyze.outputs.summary }}';
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🤖 AI Failure Analysis\n\n${summary}`
            });
```

You're all set! 🎉
