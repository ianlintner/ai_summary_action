import * as core from '@actions/core'
import * as github from '@actions/github'

interface JobLog {
  jobName: string
  logContent: string
  conclusion: string
}

export async function getWorkflowRunLogs(
  githubToken: string,
  owner: string,
  repo: string,
  runId: number,
  maxLogLines: number
): Promise<JobLog[]> {
  const octokit = github.getOctokit(githubToken)

  try {
    // Get workflow run details
    const { data: workflowRun } = await octokit.rest.actions.getWorkflowRun({
      owner,
      repo,
      run_id: runId
    })

    core.info(`Workflow: ${workflowRun.name}, Status: ${workflowRun.status}, Conclusion: ${workflowRun.conclusion}`)

    // Get all jobs for this workflow run
    const { data: jobs } = await octokit.rest.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: runId,
      filter: 'all'
    })

    core.info(`Found ${jobs.jobs.length} jobs`)

    // Filter failed jobs
    const failedJobs = jobs.jobs.filter(job => job.conclusion === 'failure' || job.conclusion === 'cancelled')

    if (failedJobs.length === 0) {
      core.warning('No failed jobs found in this workflow run')
      return []
    }

    core.info(`Found ${failedJobs.length} failed jobs`)

    // Fetch logs for each failed job
    const jobLogs: JobLog[] = []

    for (const job of failedJobs) {
      try {
        core.info(`Fetching logs for job: ${job.name} (ID: ${job.id})`)

        // Download logs for the job
        const logResponse = await octokit.rest.actions.downloadJobLogsForWorkflowRun({
          owner,
          repo,
          job_id: job.id
        })

        // The response is a redirect URL, we need to fetch the actual content
        let logContent = ''
        if (typeof logResponse.data === 'string') {
          logContent = logResponse.data
        } else if (logResponse.url) {
          // Fetch from the URL
          try {
            const response = await fetch(logResponse.url)
            if (!response.ok) {
              throw new Error(`Failed to fetch logs: ${response.statusText}`)
            }
            logContent = await response.text()
          } catch (fetchError) {
            core.warning(`Failed to fetch log content from URL: ${fetchError}`)
            continue
          }
        }

        // Truncate to max lines (keep last N lines as they usually contain errors)
        const lines = logContent.split('\n')
        const truncatedLines = lines.slice(-maxLogLines)
        const truncatedContent = truncatedLines.join('\n')

        jobLogs.push({
          jobName: job.name,
          logContent: truncatedContent,
          conclusion: job.conclusion || 'unknown'
        })

        core.info(`Retrieved ${lines.length} lines (showing last ${truncatedLines.length})`)
      } catch (error) {
        core.warning(`Failed to fetch logs for job ${job.name}: ${error}`)
      }
    }

    return jobLogs
  } catch (error) {
    core.error(`Error fetching workflow logs: ${error}`)
    throw error
  }
}

export async function createIssueWithSummary({
  githubToken,
  owner,
  repo,
  runId,
  summary,
  failedJobs,
  label
}: {
  githubToken: string
  owner: string
  repo: string
  runId: number
  summary: string
  failedJobs: string[]
  label: string
}): Promise<string> {
  const octokit = github.getOctokit(githubToken)

  const title = `🤖 Workflow Failure Analysis - Run #${runId}`
  const body = `## AI Analysis of Workflow Failure

**Workflow Run:** [#${runId}](https://github.com/${owner}/${repo}/actions/runs/${runId})
**Failed Jobs:** ${failedJobs.join(', ')}

---

${summary}

---

*This issue was automatically created by the AI Summary Action*
`

  try {
    const labels = label ? [label] : []
    const { data: issue } = await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body,
      labels
    })

    return issue.html_url
  } catch (error) {
    core.error(`Failed to create issue: ${error}`)
    throw error
  }
}
