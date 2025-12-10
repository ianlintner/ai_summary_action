export interface FailureSummary {
    runId: number;
    branch: string;
    commit: string;
    timestamp: string;
    summary: string;
    failedJobs: string[];
    resolved: boolean;
}
export interface BranchHistory {
    branch: string;
    lastAnalysis: string;
    totalFailures: number;
    commonErrors: string[];
    resolution?: string;
}
export interface CommitChanges {
    commit: string;
    files: string[];
    additions: number;
    deletions: number;
    relevantTo: string[];
}
export interface MemoryData {
    failures: FailureSummary[];
    branchHistory: BranchHistory;
    commitChanges: CommitChanges[];
}
export interface MemoryConfig {
    enabled: boolean;
    strategy: 'actions-cache' | 'github-issues' | 'git-notes';
    scope: 'branch' | 'repository' | 'workflow';
    retentionDays: number;
    maxHistoricalRuns: number;
    includeCommitChanges: boolean;
    githubToken: string;
    owner: string;
    repo: string;
    branch: string;
    workflowName?: string;
}
export declare class MemoryManager {
    private config;
    private octokit;
    constructor(config: MemoryConfig);
    /**
     * Generate cache key based on scope
     */
    private getCacheKey;
    /**
     * Load memory from cache
     */
    loadMemory(): Promise<MemoryData | null>;
    /**
     * Save memory to cache
     */
    saveMemory(data: MemoryData): Promise<void>;
    /**
     * Add a new failure to memory
     */
    addFailure(memory: MemoryData | null, runId: number, commit: string, summary: string, failedJobs: string[]): Promise<MemoryData>;
    /**
     * Get commit changes for context
     */
    getCommitChanges(commits: string[]): Promise<CommitChanges[]>;
    /**
     * Format memory data for LLM prompt
     */
    formatMemoryForPrompt(memory: MemoryData | null): string;
    /**
     * Clean old failures based on retention policy
     */
    private cleanOldFailures;
    /**
     * Load from GitHub Actions Cache
     */
    private loadFromActionsCache;
    /**
     * Save to GitHub Actions Cache
     */
    private saveToActionsCache;
    /**
     * Load from GitHub Issues (stores in issue comments)
     */
    private loadFromGitHubIssues;
    /**
     * Save to GitHub Issues
     */
    private saveToGitHubIssues;
    /**
     * Load from Git Notes
     */
    private loadFromGitNotes;
    /**
     * Save to Git Notes
     */
    private saveToGitNotes;
}
