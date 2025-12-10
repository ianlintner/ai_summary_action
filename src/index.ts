import * as core from '@actions/core'
import * as github from '@actions/github'
import { analyzeWorkflowFailure } from './analyzer'
import { createIssueWithSummary, commentOnPR } from './github-client'
import { MemoryManager } from './memory-manager'

async function run(): Promise<void> {
  try {
    // Get inputs
    const githubToken = core.getInput('github-token', { required: true })
    const llmProvider = core.getInput('llm-provider')
    const maxLogLines = parseInt(core.getInput('max-log-lines') || '500')
    const createIssue = core.getInput('create-issue') === 'true'
    const issueLabel = core.getInput('issue-label')
    const issueBranchFilter = core.getInput('issue-branch-filter')
    const commentOnPr = core.getInput('comment-on-pr') === 'true'

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

    // Get custom prompts
    const customSystemPrompt = core.getInput('custom-system-prompt')
    const customUserPrompt = core.getInput('custom-user-prompt')

    // Get memory configuration
    const enableMemory = core.getInput('enable-memory') === 'true'
    const cacheStrategy = core.getInput('cache-strategy') as 'actions-cache' | 'github-issues' | 'git-notes'
    const memoryScope = core.getInput('memory-scope') as 'branch' | 'repository' | 'workflow'
    const memoryRetentionDays = parseInt(core.getInput('memory-retention-days') || '30')
    const maxHistoricalRuns = parseInt(core.getInput('max-historical-runs') || '10')
    const includeCommitChanges = core.getInput('include-commit-changes') === 'true'

    // Get GitHub context
    const context = github.context
    const { owner, repo } = context.repo
    const runId = context.runId
    const branch = context.ref.replace('refs/heads/', '')
    const commit = context.sha

    // Detect if this workflow run is from a pull request
    const prNumber = context.payload.pull_request?.number
    const isPullRequest = !!prNumber

    core.info(`Analyzing workflow run ${runId} for ${owner}/${repo}`)
    if (isPullRequest) {
      core.info(`This run is associated with PR #${prNumber}`)
    }
    core.info(`Branch: ${branch}`)
    core.info(`Commit: ${commit}`)

    // Initialize memory manager
    let memoryManager: MemoryManager | undefined
    let existingMemory = null

    if (enableMemory) {
      memoryManager = new MemoryManager({
        enabled: enableMemory,
        strategy: cacheStrategy,
        scope: memoryScope,
        retentionDays: memoryRetentionDays,
        maxHistoricalRuns,
        includeCommitChanges,
        githubToken,
        owner,
        repo,
        branch,
        workflowName: context.workflow
      })

      // Load existing memory
      existingMemory = await memoryManager.loadMemory()
      if (existingMemory) {
        core.info(`Loaded ${existingMemory.failures.length} historical failures`)
      }
    }

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
      maxLogLines,
      customSystemPrompt,
      customUserPrompt,
      memoryData: existingMemory
    })

    // Set outputs
    core.setOutput('summary', result.summary)
    core.setOutput('failed-jobs', JSON.stringify(result.failedJobs))
    
    if (isPullRequest) {
      core.setOutput('pr-number', prNumber)
    }

    // Set memory outputs if enabled
    if (enableMemory && existingMemory) {
      core.setOutput('historical-failures', JSON.stringify(existingMemory.failures.slice(-5)))
      core.setOutput('branch-patterns', JSON.stringify(existingMemory.branchHistory))
      // Similar issues detection coming in future release
      core.setOutput('similar-issues', '[]')
    }

    // Update memory with this failure
    if (memoryManager) {
      const updatedMemory = await memoryManager.addFailure(
        existingMemory,
        runId,
        commit,
        result.summary,
        result.failedJobs
      )
      await memoryManager.saveMemory(updatedMemory)
    }

    // Display summary in GitHub Actions Summary UI
    core.summary.addHeading('🔍 AI Workflow Failure Analysis', 1)
    core.summary.addRaw(result.summary)
    await core.summary.write()

    // Also log the summary to console for viewing in logs
    core.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    core.info('🔍 AI WORKFLOW FAILURE ANALYSIS')
    core.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    core.info('')
    // Log each line of the summary
    result.summary.split('\n').forEach(line => core.info(line))
    core.info('')
    core.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Comment on PR if requested and this is a PR run
    if (commentOnPr && isPullRequest && prNumber && result.summary) {
      try {
        const commentUrl = await commentOnPR({
          githubToken,
          owner,
          repo,
          prNumber,
          runId,
          summary: result.summary,
          failedJobs: result.failedJobs
        })
        core.setOutput('pr-comment-url', commentUrl)
        core.info(`💬 Added comment to PR #${prNumber}: ${commentUrl}`)
      } catch (error) {
        core.warning(`Failed to comment on PR: ${error}`)
      }
    }

    // Check if branch filtering allows issue creation
    let shouldCreateIssue = createIssue
    if (createIssue && issueBranchFilter) {
      const allowedBranches = issueBranchFilter.split(',').map(b => b.trim()).filter(b => b.length > 0)
      if (allowedBranches.length > 0 && !allowedBranches.includes(branch)) {
        core.info(`Branch '${branch}' not in issue-branch-filter list [${allowedBranches.join(', ')}], skipping issue creation`)
        shouldCreateIssue = false
      }
    }

    // Create issue if requested and not a PR (or if explicitly enabled despite PR comment)
    // Prioritize PR comments: if this is a PR and commenting is enabled, skip issue creation unless explicitly requested
    const skipIssueForPr = isPullRequest && commentOnPr && !createIssue
    
    if (shouldCreateIssue && !skipIssueForPr && result.summary) {
      try {
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
        core.info(`📝 Created issue: ${issueUrl}`)
      } catch (error) {
        core.warning(`Failed to create issue: ${error}`)
      }
    }

    core.info('✅ Analysis complete')
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('Unknown error occurred during workflow analysis')
    }
  }
}

run()
