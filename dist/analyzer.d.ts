interface AnalyzerConfig {
    githubToken: string;
    owner: string;
    repo: string;
    runId: number;
    llmProvider: string;
    openaiApiKey?: string;
    openaiModel?: string;
    azureOpenaiApiKey?: string;
    azureOpenaiEndpoint?: string;
    azureOpenaiDeployment?: string;
    githubModelsToken?: string;
    githubModelsModel?: string;
    anthropicApiKey?: string;
    anthropicModel?: string;
    maxLogLines: number;
    customSystemPrompt?: string;
    customUserPrompt?: string;
}
interface AnalysisResult {
    summary: string;
    failedJobs: string[];
}
export declare function analyzeWorkflowFailure(config: AnalyzerConfig): Promise<AnalysisResult>;
export {};
