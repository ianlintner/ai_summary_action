# Installation

## GitHub Marketplace

The easiest way to use this action is through the GitHub Actions marketplace:

1. Visit the [AI Workflow Failure Summary Action](https://github.com/marketplace/actions/ai-workflow-failure-summary) on GitHub Marketplace
2. Click **"Use latest version"**
3. Copy the usage snippet to your workflow

## Manual Installation

### Using a Specific Version (Recommended)

```yaml
- uses: ianlintner/ai_summary_action@v1.0.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    # ... other inputs
```

### Using Latest Version

```yaml
- uses: ianlintner/ai_summary_action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    # ... other inputs
```

### Using Main Branch (Not Recommended for Production)

```yaml
- uses: ianlintner/ai_summary_action@main
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    # ... other inputs
```

!!! warning "Production Usage"
    Always pin to a specific version tag (like `@v1.0.0`) in production workflows to avoid unexpected breaking changes.

## Prerequisites

### 1. GitHub Token

The action requires a GitHub token to access workflow logs and create issues. The default `GITHUB_TOKEN` is usually sufficient:

```yaml
github-token: ${{ secrets.GITHUB_TOKEN }}
```

**Required Permissions:**
```yaml
permissions:
  actions: read       # To fetch workflow logs
  contents: read      # To access repository
  issues: write       # If creating issues (optional)
```

### 2. LLM Provider API Key

Choose one of the supported providers and obtain an API key:

=== "OpenAI"
    
    **Get API Key:**
    1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
    2. Sign in or create an account
    3. Create a new API key
    4. Add to repository secrets as `OPENAI_API_KEY`
    
    **Pricing:** Pay-as-you-go, starting at $0.03 per 1K tokens for GPT-4o-mini
    
    **Best For:** General use, best balance of cost and quality

=== "GitHub Models"
    
    **Get API Key:**
    1. No additional key needed! Use `${{ secrets.GITHUB_TOKEN }}`
    2. Visit [GitHub Models Marketplace](https://github.com/marketplace/models)
    3. Check available models and rate limits
    
    **Pricing:** Free tier available with rate limits
    
    **Best For:** Getting started, testing, small projects

=== "Anthropic Claude"
    
    **Get API Key:**
    1. Visit [Anthropic Console](https://console.anthropic.com/)
    2. Sign up for an account
    3. Create an API key
    4. Add to repository secrets as `ANTHROPIC_API_KEY`
    
    **Pricing:** Pay-as-you-go, competitive with OpenAI
    
    **Best For:** Advanced reasoning, large context windows

=== "Azure OpenAI"
    
    **Get API Key:**
    1. Create an [Azure OpenAI resource](https://portal.azure.com/)
    2. Deploy a model (e.g., gpt-4o)
    3. Get the endpoint and API key
    4. Add to secrets:
        - `AZURE_OPENAI_API_KEY`
        - `AZURE_OPENAI_ENDPOINT`
        - `AZURE_OPENAI_DEPLOYMENT`
    
    **Pricing:** Enterprise pricing through Azure
    
    **Best For:** Enterprise deployments, compliance requirements

## Adding Secrets to Your Repository

### Repository Secrets (Recommended)

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each required secret:
    - Name: `OPENAI_API_KEY` (or your provider)
    - Value: Your API key
5. Click **Add secret**

### Organization Secrets

For multiple repositories:

1. Go to your organization on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New organization secret**
4. Add the secret and select which repositories can access it

### Environment Secrets

For environment-specific configuration:

1. Create an environment in your repository settings
2. Add secrets to that environment
3. Reference in your workflow:

```yaml
jobs:
  analyze:
    runs-on: ubuntu-latest
    environment: production  # Use environment secrets
    steps:
      - uses: ianlintner/ai_summary_action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

## Verification

To verify installation, add a simple test workflow:

```yaml title=".github/workflows/test-ai-action.yml"
name: Test AI Action

on:
  workflow_dispatch:  # Manual trigger

jobs:
  fail-intentionally:
    runs-on: ubuntu-latest
    steps:
      - name: This will fail
        run: exit 1
  
  analyze:
    runs-on: ubuntu-latest
    if: failure()
    needs: [fail-intentionally]
    steps:
      - name: Analyze Failure
        uses: ianlintner/ai_summary_action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          llm-provider: 'openai'
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

Run this workflow manually from the Actions tab to test your setup.

## System Requirements

- **GitHub Actions:** Any runner (ubuntu-latest, windows-latest, macos-latest)
- **Node.js Runtime:** Node 20 (provided by GitHub Actions)
- **Internet Access:** Required to call LLM provider APIs
- **Permissions:** Read access to Actions, optional write access to Issues

## Upgrading

To upgrade to a newer version:

1. Check the [Changelog](changelog.md) for breaking changes
2. Update the version in your workflow:
   ```yaml
   - uses: ianlintner/ai_summary_action@v2.0.0  # New version
   ```
3. Test in a non-production workflow first
4. Roll out to all workflows

## Uninstalling

To remove the action:

1. Delete or comment out the action step in your workflows
2. Optionally remove the API key secret from repository settings
3. Remove any custom prompt files from `.github/prompts/`

## Next Steps

- [Configuration Guide](configuration.md) - Learn about all available options
- [Quick Start](quickstart.md) - Get up and running quickly
<!-- - [Examples](../examples/patterns.md) - See common usage patterns -->
