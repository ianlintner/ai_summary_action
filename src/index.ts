import * as core from '@actions/core'
import * as github from '@actions/github'
import { analyzeWorkflowFailure } from './analyzer'
import { createIssueWithSummary } from './github-client'

async function run(): Promise<void> {
  try {
    // Get inputs
    const githubToken = core.getInput('github-token', { required: true })
    const llmProvider = core.getInput('llm-provider')
    const maxLogLines = parseInt(core.getInput('max-log-lines') || '500')
    const createIssue = core.getInput('create-issue') === 'true'
    const issueLabel = core.getInput('issue-label')

    // Get LLM provider credentials
    const openaiApiKey = core.getInput('openai-api-key')
    const azureOpenaiApiKey = core.getInput('azure-openai-api-key')
    const azureOpenaiEndpoint = core.getInput('azure-openai-endpoint')
    const azureOpenaiDeployment = core.getInput('azure-openai-deployment')
    const githubModelsToken = core.getInput('github-models-token')
    const anthropicApiKey = core.getInput('anthropic-api-key')

    // Get model configurations
    const openaiModel = core.getInput('openai-model') || 'gpt-4o-mini'
    const githubModelsModel = core.getInput('github-models-model') || 'gpt-4o'
    const anthropicModel = core.getInput('anthropic-model') || 'claude-3-5-sonnet-20241022'

    // Get GitHub context
    const context = github.context
    const { owner, repo } = context.repo
    const runId = context.runId

    core.info(`Analyzing workflow run ${runId} for ${owner}/${repo}`)

    // Analyze the workflow failure
    const result = await analyzeWorkflowFailure({
      githubToken,
      owner,
      repo,
      runId,
      llmProvider,
      openaiApiKey,
      openaiModel,
      azureOpenaiApiKey,
      azureOpenaiEndpoint,
      azureOpenaiDeployment,
      githubModelsToken,
      githubModelsModel,
      anthropicApiKey,
      anthropicModel,
      maxLogLines
    })

    // Set outputs
    core.setOutput('summary', result.summary)
    core.setOutput('failed-jobs', JSON.stringify(result.failedJobs))

    // Display summary
    core.summary.addHeading('🔍 AI Workflow Failure Analysis', 1)
    core.summary.addRaw(result.summary)
    await core.summary.write()

    // Create issue if requested
    if (createIssue && result.summary) {
      const issueUrl = await createIssueWithSummary({
        githubToken,
        owner,
        repo,
        runId,
        summary: result.summary,
        failedJobs: result.failedJobs,
        label: issueLabel
      })
      core.setOutput('issue-url', issueUrl)
      core.info(`Created issue: ${issueUrl}`)
    }

    core.info('✅ Analysis complete')
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
