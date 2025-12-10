# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Custom prompt support via `.github/prompts/` directory
- MkDocs documentation with GitHub Pages deployment
- Comprehensive documentation including:
  - Quick start guide
  - Installation instructions
  - Configuration reference
  - Custom prompts guide
  - GitHub Copilot integration guide
  - Architecture documentation with Mermaid diagrams
  - Security best practices
  - Troubleshooting guide
- Example prompt templates in `.github/prompts/`
- Community health files (CODE_OF_CONDUCT, issue templates, PR template)
- Enhanced README with badges and better structure

### Changed
- Improved documentation structure and organization
- Enhanced CONTRIBUTING.md with detailed development workflow

## [1.0.0] - 2024-12-10

### Added
- Initial release of AI Workflow Failure Summary Action
- Support for multiple LLM providers:
  - OpenAI (GPT-4o, GPT-4o-mini)
  - Azure OpenAI
  - GitHub Models
  - Anthropic Claude
- Automatic workflow failure analysis
- GitHub issue creation with AI summaries
- GitHub Actions summary integration
- Configurable log line limits
- Action outputs for summary, failed jobs, and issue URL

### Features
- AI-powered root cause analysis
- Structured error reporting
- Actionable fix recommendations
- Integration with GitHub Copilot
- Secure API key handling via GitHub Secrets

## [0.1.0] - 2024-12-01

### Added
- Initial prototype
- Basic OpenAI integration
- Simple log extraction

[Unreleased]: https://github.com/ianlintner/ai_summary_action/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ianlintner/ai_summary_action/releases/tag/v1.0.0
[0.1.0]: https://github.com/ianlintner/ai_summary_action/releases/tag/v0.1.0
