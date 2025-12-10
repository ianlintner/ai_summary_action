# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-10

### Added
- Initial release of AI Workflow Failure Summary Action
- Multi-provider LLM support:
  - OpenAI (GPT-4o-mini default)
  - Azure OpenAI
  - GitHub Models
  - Anthropic (Claude)
- Automatic workflow failure detection
- Failed job log extraction and analysis
- AI-powered failure summaries with:
  - Root cause analysis
  - Error details
  - Recommended fix actions
  - Additional context
- Optional GitHub issue creation
- GitHub Actions summary output
- Configurable log truncation (default 500 lines)
- Comprehensive documentation:
  - README with usage examples
  - QUICKSTART guide
  - CONTRIBUTING guide
  - Security considerations
- Example workflows
- TypeScript implementation with full type safety
- Error handling for all external operations
- Zero dependency vulnerabilities

### Features
- 🤖 AI-powered failure analysis
- 🔌 Multiple LLM providers
- 📊 Actionable insights
- 🎯 GitHub Copilot integration ready
- 🔍 VSCode compatible
- 🛡️ Secure by design

[1.0.0]: https://github.com/ianlintner/ai_summary_action/releases/tag/v1.0.0
