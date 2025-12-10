interface JobLog {
    jobName: string;
    logContent: string;
    conclusion: string;
}
export declare function getWorkflowRunLogs(githubToken: string, owner: string, repo: string, runId: number, maxLogLines: number): Promise<JobLog[]>;
export declare function createIssueWithSummary({ githubToken, owner, repo, runId, summary, failedJobs, label }: {
    githubToken: string;
    owner: string;
    repo: string;
    runId: number;
    summary: string;
    failedJobs: string[];
    label: string;
}): Promise<string>;
export {};
