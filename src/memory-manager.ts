import * as core from '@actions/core'
import * as github from '@actions/github'
import * as cache from '@actions/cache'
import * as crypto from 'crypto'

export interface FailureSummary {
  runId: number
  branch: string
  commit: string
  timestamp: string
  summary: string
  failedJobs: string[]
  resolved: boolean
}

export interface BranchHistory {
  branch: string
  lastAnalysis: string
  totalFailures: number
  commonErrors: string[]
  resolution?: string
}

export interface CommitChanges {
  commit: string
  files: string[]
  additions: number
  deletions: number
  relevantTo: string[]
}

export interface MemoryData {
  failures: FailureSummary[]
  branchHistory: BranchHistory
  commitChanges: CommitChanges[]
}

export interface MemoryConfig {
  enabled: boolean
  strategy: 'actions-cache' | 'github-issues' | 'git-notes'
  scope: 'branch' | 'repository' | 'workflow'
  retentionDays: number
  maxHistoricalRuns: number
  includeCommitChanges: boolean
  githubToken: string
  owner: string
  repo: string
  branch: string
  workflowName?: string
}

export class MemoryManager {
  private config: MemoryConfig
  private octokit: ReturnType<typeof github.getOctokit>

  constructor(config: MemoryConfig) {
    this.config = config
    this.octokit = github.getOctokit(config.githubToken)
  }

  /**
   * Generate cache key based on scope
   */
  private getCacheKey(): string {
    const { scope, branch, repo, workflowName } = this.config
    const parts = ['ai-summary-action']

    switch (scope) {
      case 'branch':
        parts.push(repo, branch)
        break
      case 'workflow':
        parts.push(repo, workflowName || 'default')
        break
      case 'repository':
        parts.push(repo)
        break
    }

    return parts.join('-').replace(/[^a-zA-Z0-9-]/g, '_')
  }

  /**
   * Load memory from cache
   */
  async loadMemory(): Promise<MemoryData | null> {
    if (!this.config.enabled) {
      return null
    }

    core.info('Loading memory from cache...')

    try {
      switch (this.config.strategy) {
        case 'actions-cache':
          return await this.loadFromActionsCache()
        case 'github-issues':
          core.warning('GitHub Issues cache strategy is not yet implemented. Using actions-cache instead.')
          return await this.loadFromActionsCache()
        case 'git-notes':
          core.warning('Git Notes cache strategy is not yet implemented. Using actions-cache instead.')
          return await this.loadFromActionsCache()
        default:
          core.warning(`Unknown cache strategy: ${this.config.strategy}. Using actions-cache instead.`)
          return await this.loadFromActionsCache()
      }
    } catch (error) {
      core.warning(`Failed to load memory: ${error}`)
      return null
    }
  }

  /**
   * Save memory to cache
   */
  async saveMemory(data: MemoryData): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    core.info('Saving memory to cache...')

    try {
      // Clean old data
      data.failures = this.cleanOldFailures(data.failures)

      switch (this.config.strategy) {
        case 'actions-cache':
          await this.saveToActionsCache(data)
          break
        case 'github-issues':
          core.warning('GitHub Issues cache strategy is not yet implemented. Using actions-cache instead.')
          await this.saveToActionsCache(data)
          break
        case 'git-notes':
          core.warning('Git Notes cache strategy is not yet implemented. Using actions-cache instead.')
          await this.saveToActionsCache(data)
          break
        default:
          core.warning(`Unknown cache strategy: ${this.config.strategy}. Using actions-cache instead.`)
          await this.saveToActionsCache(data)
      }
    } catch (error) {
      core.warning(`Failed to save memory: ${error}`)
    }
  }

  /**
   * Add a new failure to memory
   */
  async addFailure(
    memory: MemoryData | null,
    runId: number,
    commit: string,
    summary: string,
    failedJobs: string[]
  ): Promise<MemoryData> {
    const newFailure: FailureSummary = {
      runId,
      branch: this.config.branch,
      commit,
      timestamp: new Date().toISOString(),
      summary,
      failedJobs,
      resolved: false
    }

    const data: MemoryData = memory || {
      failures: [],
      branchHistory: {
        branch: this.config.branch,
        lastAnalysis: new Date().toISOString(),
        totalFailures: 0,
        commonErrors: []
      },
      commitChanges: []
    }

    // Add new failure
    data.failures.push(newFailure)

    // Limit to max historical runs
    if (data.failures.length > this.config.maxHistoricalRuns) {
      data.failures = data.failures.slice(-this.config.maxHistoricalRuns)
    }

    // Update branch history
    data.branchHistory.lastAnalysis = new Date().toISOString()
    data.branchHistory.totalFailures++

    return data
  }

  /**
   * Get commit changes for context
   */
  async getCommitChanges(commits: string[]): Promise<CommitChanges[]> {
    if (!this.config.includeCommitChanges || commits.length === 0) {
      return []
    }

    core.info(`Fetching changes for ${commits.length} commits...`)

    const changes: CommitChanges[] = []

    for (const commit of commits.slice(0, 5)) {
      // Limit to 5 most recent
      try {
        const { data } = await this.octokit.rest.repos.getCommit({
          owner: this.config.owner,
          repo: this.config.repo,
          ref: commit
        })

        changes.push({
          commit,
          files: data.files?.map(f => f.filename) || [],
          additions: data.stats?.additions || 0,
          deletions: data.stats?.deletions || 0,
          relevantTo: [] // Future enhancement: analyze file paths to determine job relevance
        })
      } catch (error) {
        core.warning(`Failed to fetch commit ${commit}: ${error}`)
      }
    }

    return changes
  }

  /**
   * Format memory data for LLM prompt (static helper)
   */
  static formatMemoryForPrompt(memory: MemoryData | null): string {
    if (!memory || memory.failures.length === 0) {
      return ''
    }

    let context = '\n\n## Historical Context\n\n'

    // Add previous failures
    if (memory.failures.length > 0) {
      context += '### Previous Failures on This Branch\n\n'
      memory.failures.slice(-5).forEach((failure, idx) => {
        const daysAgo = Math.floor(
          (Date.now() - new Date(failure.timestamp).getTime()) / (1000 * 60 * 60 * 24)
        )
        context += `${idx + 1}. ${daysAgo} days ago (Run #${failure.runId}):\n`
        context += `   - Jobs: ${failure.failedJobs.join(', ')}\n`
        context += `   - Summary: ${failure.summary.split('\n')[0]}\n`
        if (failure.resolved) {
          context += `   - Status: Resolved\n`
        }
        context += '\n'
      })
    }

    // Add commit changes
    if (memory.commitChanges && memory.commitChanges.length > 0) {
      context += '### Recent Commits\n\n'
      memory.commitChanges.forEach(change => {
        context += `- ${change.commit.substring(0, 7)}: `
        context += `${change.files.length} files changed `
        context += `(+${change.additions}, -${change.deletions})\n`
        if (change.files.length > 0 && change.files.length <= 5) {
          context += `  Files: ${change.files.join(', ')}\n`
        }
      })
      context += '\n'
    }

    // Add patterns
    if (memory.branchHistory.totalFailures > 1) {
      context += '### Patterns Detected\n\n'
      context += `- Total failures on this branch: ${memory.branchHistory.totalFailures}\n`
      if (memory.failures.length > 1) {
        const recentFailures = memory.failures.slice(-3)
        const jobCounts: { [key: string]: number } = {}
        recentFailures.forEach(f => {
          f.failedJobs.forEach(job => {
            jobCounts[job] = (jobCounts[job] || 0) + 1
          })
        })
        const frequentJobs = Object.entries(jobCounts)
          .filter(([, count]) => count > 1)
          .map(([job]) => job)
        if (frequentJobs.length > 0) {
          context += `- Frequently failing jobs: ${frequentJobs.join(', ')}\n`
        }
      }
      context += '\n'
    }

    context += '### Analysis Request\n'
    context +=
      'Considering the history above, analyze the current failure and:\n'
    context += '1. Identify if this is a recurring issue\n'
    context += '2. Reference previous failures and attempted resolutions\n'
    context += '3. Determine if patterns suggest a deeper problem\n'
    context += '4. Provide recommendations informed by historical context\n'

    return context
  }

  /**
   * Clean old failures based on retention policy
   */
  private cleanOldFailures(failures: FailureSummary[]): FailureSummary[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays)

    return failures.filter(f => new Date(f.timestamp) > cutoffDate)
  }

  /**
   * Load from GitHub Actions Cache
   */
  private async loadFromActionsCache(): Promise<MemoryData | null> {
    const cacheKey = this.getCacheKey()
    const cachePath = `/tmp/ai-summary-cache-${Date.now()}`

    try {
      const cacheHit = await cache.restoreCache([cachePath], cacheKey)

      if (!cacheHit) {
        core.info('No cache found')
        return null
      }

      const fs = await import('fs')
      const data = fs.readFileSync(cachePath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      core.warning(`Cache restore failed: ${error}`)
      return null
    }
  }

  /**
   * Save to GitHub Actions Cache
   */
  private async saveToActionsCache(data: MemoryData): Promise<void> {
    const cacheKey = this.getCacheKey()
    const cachePath = `/tmp/ai-summary-cache-${Date.now()}`

    try {
      const fs = await import('fs')
      fs.writeFileSync(cachePath, JSON.stringify(data, null, 2))

      await cache.saveCache([cachePath], cacheKey)
      core.info(`Saved to cache with key: ${cacheKey}`)
    } catch (error) {
      core.warning(`Cache save failed: ${error}`)
    }
  }

  /**
   * Load from GitHub Issues (stores in issue comments)
   */
  private async loadFromGitHubIssues(): Promise<MemoryData | null> {
    // Implementation for loading from GitHub issues
    // Would search for a special "memory" issue and parse its content
    core.info('Loading from GitHub Issues not yet implemented')
    return null
  }

  /**
   * Save to GitHub Issues
   */
  private async saveToGitHubIssues(data: MemoryData): Promise<void> {
    // Implementation for saving to GitHub issues
    core.info('Saving to GitHub Issues not yet implemented')
  }

  /**
   * Load from Git Notes
   */
  private async loadFromGitNotes(): Promise<MemoryData | null> {
    // Implementation for loading from git notes
    core.info('Loading from Git Notes not yet implemented')
    return null
  }

  /**
   * Save to Git Notes
   */
  private async saveToGitNotes(data: MemoryData): Promise<void> {
    // Implementation for saving to git notes
    core.info('Saving to Git Notes not yet implemented')
  }
}
