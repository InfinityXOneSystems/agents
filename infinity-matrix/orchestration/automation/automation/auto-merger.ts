import { Octokit } from '@octokit/rest';
import {
  AutoMergerConfig,
  PullRequestInfo,
  MergeResult,
  AutoMergerStats,
} from './auto-resolver-types.js';

export class AutoMerger {
  private octokit: Octokit;
  private config: AutoMergerConfig;
  private stats: AutoMergerStats;

  constructor(config: AutoMergerConfig) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.githubToken,
      request: {
        timeout: 60000,
      },
    });
    this.stats = {
      totalPrsProcessed: 0,
      prsMerged: 0,
      prsSkipped: 0,
      errors: 0,
    };
  }

  async mergePullRequests(): Promise<MergeResult[]> {
    const results: MergeResult[] = [];

    for (const repo of this.config.repositories) {
      try {
        const prs = await this.getOpenPullRequests(repo);
        console.log(`Processing ${prs.length} pull requests in ${repo}`);

        for (const pr of prs) {
          const result = await this.processPullRequest(repo, pr);
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

  private async getOpenPullRequests(repo: string): Promise<PullRequestInfo[]> {
    try {
      const response = await this.octokit.pulls.list({
        owner: this.config.organization,
        repo,
        state: 'open',
        per_page: 100,
      });

      return response.data.map((pr) => ({
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state as 'open' | 'closed',
        head: {
          ref: pr.head.ref,
          sha: pr.head.sha,
        },
        base: {
          ref: pr.base.ref,
          sha: pr.base.sha,
        },
        mergeable: null, // Will be fetched when processing
        mergeable_state: 'unknown',
        merged: false,
        draft: pr.draft || false,
        labels: pr.labels.map((label) => label.name || ''),
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        html_url: pr.html_url,
      }));
    } catch (error: any) {
      console.error(
        `Error fetching pull requests for ${repo}:`,
        error.message
      );
      return [];
    }
  }

  private async getPRDetails(
    repo: string,
    prNumber: number
  ): Promise<{ mergeable: boolean | null } | null> {
    try {
      const { data: pr } = await this.octokit.pulls.get({
        owner: this.config.organization,
        repo,
        pull_number: prNumber,
      });
      return { mergeable: pr.mergeable };
    } catch (error: any) {
      console.error(
        `Error fetching PR details for #${prNumber} in ${repo}:`,
        error.message
      );
      return null;
    }
  }

  private async processPullRequest(
    repo: string,
    pr: PullRequestInfo
  ): Promise<MergeResult> {
    this.stats.totalPrsProcessed++;

    // Skip draft PRs
    if (pr.draft) {
      return {
        success: true,
        prNumber: pr.number,
        repository: repo,
        action: 'skipped',
        reason: 'PR is in draft state',
      };
    }

    // Check if PR has auto-merge label
    const hasAutoMergeLabel = this.config.autoMergeLabels.some((label) =>
      pr.labels.includes(label)
    );

    if (!hasAutoMergeLabel && this.config.autoMergeLabels.length > 0) {
      return {
        success: true,
        prNumber: pr.number,
        repository: repo,
        action: 'skipped',
        reason: `Missing required auto-merge label (${this.config.autoMergeLabels.join(', ')})`,
      };
    }

    // Fetch detailed PR info to get mergeable status
    const detailedPr = await this.getPRDetails(repo, pr.number);
    if (detailedPr && detailedPr.mergeable === false) {
      return {
        success: false,
        prNumber: pr.number,
        repository: repo,
        action: 'skipped',
        reason: 'PR has merge conflicts',
      };
    }

    // Check if passing checks are required
    if (this.config.requirePassingChecks) {
      const checksPass = await this.checkPRStatus(repo, pr);
      if (!checksPass) {
        return {
          success: false,
          prNumber: pr.number,
          repository: repo,
          action: 'skipped',
          reason: 'PR checks are not passing',
        };
      }
    }

    // Check approvals
    if (this.config.requireApprovals > 0) {
      const approvals = await this.getApprovalCount(repo, pr);
      if (approvals < this.config.requireApprovals) {
        return {
          success: false,
          prNumber: pr.number,
          repository: repo,
          action: 'skipped',
          reason: `Insufficient approvals (${approvals}/${this.config.requireApprovals})`,
        };
      }
    }

    // Attempt to merge
    return await this.mergePR(repo, pr);
  }

  private async checkPRStatus(
    repo: string,
    pr: PullRequestInfo
  ): Promise<boolean> {
    try {
      const { data: combinedStatus } =
        await this.octokit.repos.getCombinedStatusForRef({
          owner: this.config.organization,
          repo,
          ref: pr.head.sha,
        });

      // Check if all statuses are successful
      if (
        combinedStatus.state !== 'success' &&
        combinedStatus.state !== 'pending'
      ) {
        return false;
      }

      // Also check check runs (GitHub Actions, etc.)
      const { data: checkRuns } = await this.octokit.checks.listForRef({
        owner: this.config.organization,
        repo,
        ref: pr.head.sha,
      });

      // All check runs must be successful or skipped
      const failedChecks = checkRuns.check_runs.filter(
        (run) =>
          run.status === 'completed' &&
          run.conclusion !== 'success' &&
          run.conclusion !== 'skipped' &&
          run.conclusion !== 'neutral'
      );

      return failedChecks.length === 0;
    } catch (error: any) {
      console.error(
        `Error checking PR status for #${pr.number} in ${repo}:`,
        error.message
      );
      return false;
    }
  }

  private async getApprovalCount(
    repo: string,
    pr: PullRequestInfo
  ): Promise<number> {
    try {
      const { data: reviews } = await this.octokit.pulls.listReviews({
        owner: this.config.organization,
        repo,
        pull_number: pr.number,
      });

      // Count unique approvals (latest review per user)
      const latestReviews = new Map<string, string>();
      reviews.forEach((review) => {
        if (review.user) {
          latestReviews.set(review.user.login, review.state);
        }
      });

      return Array.from(latestReviews.values()).filter(
        (state) => state === 'APPROVED'
      ).length;
    } catch (error: any) {
      console.error(
        `Error getting approvals for #${pr.number} in ${repo}:`,
        error.message
      );
      return 0;
    }
  }

  private async mergePR(
    repo: string,
    pr: PullRequestInfo
  ): Promise<MergeResult> {
    try {
      if (!this.config.dryRun) {
        const { data: mergeResult } = await this.octokit.pulls.merge({
          owner: this.config.organization,
          repo,
          pull_number: pr.number,
          merge_method: this.config.mergeMethod,
        });

        // Delete branch if configured
        if (this.config.autoDeleteBranch && mergeResult.merged) {
          try {
            await this.octokit.git.deleteRef({
              owner: this.config.organization,
              repo,
              ref: `heads/${pr.head.ref}`,
            });
            console.log(`Deleted branch ${pr.head.ref} after merge`);
          } catch (error: any) {
            console.warn(
              `Could not delete branch ${pr.head.ref}:`,
              error.message
            );
          }
        }

        console.log(
          `Merged PR #${pr.number} in ${repo} using ${this.config.mergeMethod} method`
        );

        return {
          success: true,
          prNumber: pr.number,
          repository: repo,
          action: 'merged',
          reason: `Merged using ${this.config.mergeMethod} method`,
          sha: mergeResult.sha,
        };
      } else {
        console.log(
          `[DRY RUN] Would merge PR #${pr.number} in ${repo} using ${this.config.mergeMethod} method`
        );

        return {
          success: true,
          prNumber: pr.number,
          repository: repo,
          action: 'merged',
          reason: `[DRY RUN] Would merge using ${this.config.mergeMethod} method`,
        };
      }
    } catch (error: any) {
      console.error(`Error merging PR #${pr.number} in ${repo}:`, error.message);
      return {
        success: false,
        prNumber: pr.number,
        repository: repo,
        action: 'failed',
        reason: 'Merge failed',
        error: error.message,
      };
    }
  }

  private updateStats(result: MergeResult): void {
    if (result.action === 'merged') {
      this.stats.prsMerged++;
    } else if (result.action === 'skipped') {
      this.stats.prsSkipped++;
    }

    if (!result.success && result.action !== 'skipped') {
      this.stats.errors++;
    }
  }

  getStats(): AutoMergerStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      totalPrsProcessed: 0,
      prsMerged: 0,
      prsSkipped: 0,
      errors: 0,
    };
  }
}
