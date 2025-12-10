import * as core from '@actions/core'
import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { getWorkflowRunLogs } from './github-client'

interface AnalyzerConfig {
  githubToken: string
  owner: string
  repo: string
  runId: number
  llmProvider: string
  openaiApiKey?: string
  openaiModel?: string
  azureOpenaiApiKey?: string
  azureOpenaiEndpoint?: string
  azureOpenaiDeployment?: string
  githubModelsToken?: string
  githubModelsModel?: string
  anthropicApiKey?: string
  anthropicModel?: string
  maxLogLines: number
}

interface AnalysisResult {
  summary: string
  failedJobs: string[]
}

function createLLMClient(config: AnalyzerConfig): BaseChatModel {
  const provider = config.llmProvider.toLowerCase()

  switch (provider) {
    case 'openai':
      if (!config.openaiApiKey) {
        throw new Error('OpenAI API key is required when using openai provider')
      }
      return new ChatOpenAI({
        openAIApiKey: config.openaiApiKey,
        modelName: config.openaiModel || 'gpt-4o-mini',
        temperature: 0.3
      })

    case 'azure-openai':
      if (!config.azureOpenaiApiKey || !config.azureOpenaiEndpoint) {
        throw new Error('Azure OpenAI API key and endpoint are required when using azure-openai provider')
      }
      return new ChatOpenAI({
        azureOpenAIApiKey: config.azureOpenaiApiKey,
        azureOpenAIApiInstanceName: config.azureOpenaiEndpoint,
        azureOpenAIApiDeploymentName: config.azureOpenaiDeployment,
        azureOpenAIApiVersion: '2024-02-15-preview',
        temperature: 0.3
      })

    case 'github-models':
      if (!config.githubModelsToken) {
        throw new Error('GitHub Models token is required when using github-models provider')
      }
      return new ChatOpenAI({
        openAIApiKey: config.githubModelsToken,
        modelName: config.githubModelsModel || 'gpt-4o',
        temperature: 0.3,
        configuration: {
          baseURL: 'https://models.inference.ai.azure.com'
        }
      })

    case 'anthropic':
      if (!config.anthropicApiKey) {
        throw new Error('Anthropic API key is required when using anthropic provider')
      }
      return new ChatAnthropic({
        anthropicApiKey: config.anthropicApiKey,
        modelName: config.anthropicModel || 'claude-3-5-sonnet-20241022',
        temperature: 0.3
      })

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`)
  }
}

export async function analyzeWorkflowFailure(config: AnalyzerConfig): Promise<AnalysisResult> {
  core.info(`Fetching logs for workflow run ${config.runId}`)

  // Get failed job logs
  const jobLogs = await getWorkflowRunLogs(
    config.githubToken,
    config.owner,
    config.repo,
    config.runId,
    config.maxLogLines
  )

  if (jobLogs.length === 0) {
    return {
      summary: 'No failed jobs found in this workflow run.',
      failedJobs: []
    }
  }

  // Create LLM client
  core.info(`Initializing ${config.llmProvider} LLM client`)
  const llm = createLLMClient(config)

  // Prepare the prompt
  const systemPrompt = `You are an expert DevOps engineer analyzing GitHub Actions workflow failures. 
Your task is to analyze the provided workflow logs and provide a clear, actionable summary that helps developers quickly understand and fix the issues.

Focus on:
1. Root cause of the failure
2. Specific error messages and their meaning
3. Actionable steps to fix the issue
4. Related code files or dependencies mentioned in the logs

Format your response in Markdown with clear sections:
- **Summary**: Brief overview of what went wrong
- **Root Cause**: Technical explanation of the failure
- **Error Details**: Key error messages and their locations
- **Recommended Actions**: Step-by-step fix suggestions
- **Additional Context**: Any relevant information about dependencies, environment, or configuration

Be concise but thorough. Focus on what developers need to know to fix the issue.`

  const failedJobsInfo = jobLogs
    .map(
      (job, idx) => `
### Job ${idx + 1}: ${job.jobName}
**Status:** ${job.conclusion}

**Logs:**
\`\`\`
${job.logContent}
\`\`\`
`
    )
    .join('\n---\n')

  const userPrompt = `Analyze the following failed GitHub Actions workflow jobs and provide a comprehensive summary:

${failedJobsInfo}

Please provide your analysis in the format specified in the system prompt.`

  core.info('Sending logs to LLM for analysis...')

  try {
    const response = await llm.invoke([new SystemMessage(systemPrompt), new HumanMessage(userPrompt)])

    const summary = response.content.toString()

    return {
      summary,
      failedJobs: jobLogs.map(job => job.jobName)
    }
  } catch (error) {
    core.error(`LLM analysis failed: ${error}`)
    throw new Error(`Failed to analyze workflow: ${error}`)
  }
}
