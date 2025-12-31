import { Octokit } from '@octokit/rest';
import {
  AutoResolverConfig,
  IssueInfo,
  ResolutionResult,
  AutoResolverStats,
} from './auto-resolver-types.js';

export class AutoResolver {
  private octokit: Octokit;
  private config: AutoResolverConfig;
  private stats: AutoResolverStats;

  constructor(config: AutoResolverConfig) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.githubToken,
      request: {
        timeout: 60000,
      },
    });
    this.stats = {
      totalIssuesProcessed: 0,
      issuesClosed: 0,
      issuesAssigned: 0,
      issuesSkipped: 0,
      errors: 0,
    };
  }

  async resolveIssues(): Promise<ResolutionResult[]> {
    const results: ResolutionResult[] = [];

    for (const repo of this.config.repositories) {
      try {
        const issues = await this.getOpenIssues(repo);
        console.log(`Processing ${issues.length} issues in ${repo}`);

        for (const issue of issues) {
          const result = await this.processIssue(repo, issue);
          results.push(result);
          this.updateStats(result);
        }
      } catch (error: any) {
        console.error(`Error processing repository ${repo}:`, error.message);
        this.stats.errors++;
      }
    }

    return results;
  }

  private async getOpenIssues(repo: string): Promise<IssueInfo[]> {
    try {
      const response = await this.octokit.issues.listForRepo({
        owner: this.config.organization,
        repo,
        state: 'open',
        per_page: 100,
      });

      return response.data
        .filter((issue) => !issue.pull_request) // Exclude pull requests
        .map((issue) => ({
          number: issue.number,
          title: issue.title,
          body: issue.body,
          state: issue.state as 'open' | 'closed',
          labels: issue.labels.map((label) =>
            typeof label === 'string' ? label : label.name || ''
          ),
          assignees: issue.assignees?.map((a) => a.login) || [],
          created_at: issue.created_at,
          updated_at: issue.updated_at,
          html_url: issue.html_url,
        }));
    } catch (error: any) {
      console.error(`Error fetching issues for ${repo}:`, error.message);
      return [];
    }
  }

  private async processIssue(
    repo: string,
    issue: IssueInfo
  ): Promise<ResolutionResult> {
    this.stats.totalIssuesProcessed++;

    // Check if issue is stale and should be auto-closed
    if (this.config.autoCloseStale && this.isStale(issue)) {
      return await this.closeStaleIssue(repo, issue);
    }

    // Check if issue needs assignment
    if (
      this.config.autoAssign &&
      issue.assignees.length === 0 &&
      this.config.defaultAssignees.length > 0
    ) {
      return await this.assignIssue(repo, issue);
    }

    return {
      success: true,
      issueNumber: issue.number,
      repository: repo,
      action: 'skipped',
      reason: 'No action needed',
    };
  }

  private isStale(issue: IssueInfo): boolean {
    const updatedAt = new Date(issue.updated_at);
    const now = new Date();
    const daysSinceUpdate =
      (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > this.config.staleDays;
  }

  private async closeStaleIssue(
    repo: string,
    issue: IssueInfo
  ): Promise<ResolutionResult> {
    try {
      if (!this.config.dryRun) {
        // Add comment explaining closure
        await this.octokit.issues.createComment({
          owner: this.config.organization,
          repo,
          issue_number: issue.number,
          body: `This issue has been automatically closed due to inactivity for ${this.config.staleDays} days. If this issue is still relevant, please reopen it.`,
        });

        // Close the issue
        await this.octokit.issues.update({
          owner: this.config.organization,
          repo,
          issue_number: issue.number,
          state: 'closed',
        });
      }

      console.log(
        `${this.config.dryRun ? '[DRY RUN] Would close' : 'Closed'} stale issue #${issue.number} in ${repo}`
      );

      return {
        success: true,
        issueNumber: issue.number,
        repository: repo,
        action: 'closed',
        reason: `Stale issue (inactive for ${this.config.staleDays} days)`,
      };
    } catch (error: any) {
      console.error(
        `Error closing issue #${issue.number} in ${repo}:`,
        error.message
      );
      return {
        success: false,
        issueNumber: issue.number,
        repository: repo,
        action: 'skipped',
        reason: 'Failed to close',
        error: error.message,
      };
    }
  }

  private async assignIssue(
    repo: string,
    issue: IssueInfo
  ): Promise<ResolutionResult> {
    try {
      if (!this.config.dryRun) {
        await this.octokit.issues.addAssignees({
          owner: this.config.organization,
          repo,
          issue_number: issue.number,
          assignees: this.config.defaultAssignees,
        });
      }

      console.log(
        `${this.config.dryRun ? '[DRY RUN] Would assign' : 'Assigned'} issue #${issue.number} in ${repo} to ${this.config.defaultAssignees.join(', ')}`
      );

      return {
        success: true,
        issueNumber: issue.number,
        repository: repo,
        action: 'assigned',
        reason: `Assigned to ${this.config.defaultAssignees.join(', ')}`,
      };
    } catch (error: any) {
      console.error(
        `Error assigning issue #${issue.number} in ${repo}:`,
        error.message
      );
      return {
        success: false,
        issueNumber: issue.number,
        repository: repo,
        action: 'skipped',
        reason: 'Failed to assign',
        error: error.message,
      };
    }
  }

  private updateStats(result: ResolutionResult): void {
    if (result.action === 'closed') {
      this.stats.issuesClosed++;
    } else if (result.action === 'assigned') {
      this.stats.issuesAssigned++;
    } else if (result.action === 'skipped') {
      this.stats.issuesSkipped++;
    }

    if (!result.success) {
      this.stats.errors++;
    }
  }

  getStats(): AutoResolverStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      totalIssuesProcessed: 0,
      issuesClosed: 0,
      issuesAssigned: 0,
      issuesSkipped: 0,
      errors: 0,
    };
  }
}
