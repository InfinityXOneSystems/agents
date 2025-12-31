export interface IssueInfo {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  labels: string[];
  assignees: string[];
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface PullRequestInfo {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  mergeable: boolean | null;
  mergeable_state: string;
  merged: boolean;
  draft: boolean;
  labels: string[];
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface AutoResolverConfig {
  githubToken: string;
  organization: string;
  repositories: string[];
  dryRun: boolean;
  autoCloseStale: boolean;
  staleDays: number;
  autoAssign: boolean;
  defaultAssignees: string[];
}

export interface AutoMergerConfig {
  githubToken: string;
  organization: string;
  repositories: string[];
  dryRun: boolean;
  requireApprovals: number;
  requirePassingChecks: boolean;
  autoDeleteBranch: boolean;
  mergeMethod: 'merge' | 'squash' | 'rebase';
  autoMergeLabels: string[];
}

export interface ResolutionResult {
  success: boolean;
  issueNumber: number;
  repository: string;
  action: 'closed' | 'assigned' | 'labeled' | 'commented' | 'skipped';
  reason: string;
  error?: string;
}

export interface MergeResult {
  success: boolean;
  prNumber: number;
  repository: string;
  action: 'merged' | 'skipped' | 'failed';
  reason: string;
  sha?: string;
  error?: string;
}

export interface AutoResolverStats {
  totalIssuesProcessed: number;
  issuesClosed: number;
  issuesAssigned: number;
  issuesSkipped: number;
  errors: number;
}

export interface AutoMergerStats {
  totalPrsProcessed: number;
  prsMerged: number;
  prsSkipped: number;
  errors: number;
}
