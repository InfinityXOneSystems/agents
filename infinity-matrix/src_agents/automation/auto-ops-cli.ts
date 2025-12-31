#!/usr/bin/env node

import { Command } from 'commander';
import { AutoResolver } from './auto-resolver.js';
import { AutoMerger } from './auto-merger.js';
import { AutoResolverConfig, AutoMergerConfig } from './auto-resolver-types.js';

const program = new Command();

program
  .name('auto-ops')
  .description('Auto-resolver and auto-merger for GitHub repositories')
  .version('1.0.0');

program
  .command('resolve')
  .description('Automatically resolve issues in repositories')
  .requiredOption('-t, --token <token>', 'GitHub personal access token')
  .requiredOption('-o, --org <organization>', 'GitHub organization name')
  .requiredOption('-r, --repos <repos...>', 'Repository names to process')
  .option('-d, --dry-run', 'Run in dry-run mode (no actual changes)', false)
  .option('--auto-close-stale', 'Auto-close stale issues', false)
  .option('--stale-days <days>', 'Days of inactivity before closing', '30')
  .option('--auto-assign', 'Auto-assign issues', false)
  .option(
    '--assignees <assignees...>',
    'Default assignees for unassigned issues',
    []
  )
  .action(async (options) => {
    console.log('Starting Auto-Resolver...\n');

    const config: AutoResolverConfig = {
      githubToken: options.token,
      organization: options.org,
      repositories: options.repos,
      dryRun: options.dryRun,
      autoCloseStale: options.autoCloseStale,
      staleDays: parseInt(options.staleDays, 10),
      autoAssign: options.autoAssign,
      defaultAssignees: options.assignees,
    };

    const resolver = new AutoResolver(config);

    try {
      const results = await resolver.resolveIssues();
      const stats = resolver.getStats();

      console.log('\n=== Auto-Resolver Results ===');
      console.log(`Total issues processed: ${stats.totalIssuesProcessed}`);
      console.log(`Issues closed: ${stats.issuesClosed}`);
      console.log(`Issues assigned: ${stats.issuesAssigned}`);
      console.log(`Issues skipped: ${stats.issuesSkipped}`);
      console.log(`Errors: ${stats.errors}`);

      // Show detailed results
      console.log('\n=== Detailed Results ===');
      results.forEach((result) => {
        const status = result.success ? '✓' : '✗';
        console.log(
          `${status} ${result.repository}#${result.issueNumber}: ${result.action} - ${result.reason}`
        );
        if (result.error) {
          console.log(`  Error: ${result.error}`);
        }
      });
    } catch (error: any) {
      console.error('Error running auto-resolver:', error.message);
      process.exit(1);
    }
  });

program
  .command('merge')
  .description('Automatically merge pull requests in repositories')
  .requiredOption('-t, --token <token>', 'GitHub personal access token')
  .requiredOption('-o, --org <organization>', 'GitHub organization name')
  .requiredOption('-r, --repos <repos...>', 'Repository names to process')
  .option('-d, --dry-run', 'Run in dry-run mode (no actual changes)', false)
  .option(
    '--require-approvals <count>',
    'Minimum number of approvals required',
    '0'
  )
  .option('--require-passing-checks', 'Require all checks to pass', false)
  .option('--auto-delete-branch', 'Auto-delete branch after merge', false)
  .option(
    '--merge-method <method>',
    'Merge method (merge, squash, rebase)',
    'merge'
  )
  .option(
    '--auto-merge-labels <labels...>',
    'Labels required for auto-merge',
    []
  )
  .action(async (options) => {
    console.log('Starting Auto-Merger...\n');

    const config: AutoMergerConfig = {
      githubToken: options.token,
      organization: options.org,
      repositories: options.repos,
      dryRun: options.dryRun,
      requireApprovals: parseInt(options.requireApprovals, 10),
      requirePassingChecks: options.requirePassingChecks,
      autoDeleteBranch: options.autoDeleteBranch,
      mergeMethod: options.mergeMethod as 'merge' | 'squash' | 'rebase',
      autoMergeLabels: options.autoMergeLabels,
    };

    const merger = new AutoMerger(config);

    try {
      const results = await merger.mergePullRequests();
      const stats = merger.getStats();

      console.log('\n=== Auto-Merger Results ===');
      console.log(`Total PRs processed: ${stats.totalPrsProcessed}`);
      console.log(`PRs merged: ${stats.prsMerged}`);
      console.log(`PRs skipped: ${stats.prsSkipped}`);
      console.log(`Errors: ${stats.errors}`);

      // Show detailed results
      console.log('\n=== Detailed Results ===');
      results.forEach((result) => {
        const status = result.success ? '✓' : '✗';
        console.log(
          `${status} ${result.repository}#${result.prNumber}: ${result.action} - ${result.reason}`
        );
        if (result.sha) {
          console.log(`  Merge SHA: ${result.sha}`);
        }
        if (result.error) {
          console.log(`  Error: ${result.error}`);
        }
      });
    } catch (error: any) {
      console.error('Error running auto-merger:', error.message);
      process.exit(1);
    }
  });

program
  .command('all')
  .description('Run both auto-resolver and auto-merger')
  .requiredOption('-t, --token <token>', 'GitHub personal access token')
  .requiredOption('-o, --org <organization>', 'GitHub organization name')
  .requiredOption('-r, --repos <repos...>', 'Repository names to process')
  .option('-d, --dry-run', 'Run in dry-run mode (no actual changes)', false)
  .action(async (options) => {
    console.log('Starting Auto-Resolver and Auto-Merger...\n');

    // Run resolver first
    const resolverConfig: AutoResolverConfig = {
      githubToken: options.token,
      organization: options.org,
      repositories: options.repos,
      dryRun: options.dryRun,
      autoCloseStale: true,
      staleDays: 30,
      autoAssign: true,
      defaultAssignees: [],
    };

    const resolver = new AutoResolver(resolverConfig);

    try {
      console.log('=== Running Auto-Resolver ===\n');
      await resolver.resolveIssues();
      const resolverStats = resolver.getStats();
      console.log('\nResolver Stats:', resolverStats);
    } catch (error: any) {
      console.error('Error running auto-resolver:', error.message);
    }

    // Run merger
    const mergerConfig: AutoMergerConfig = {
      githubToken: options.token,
      organization: options.org,
      repositories: options.repos,
      dryRun: options.dryRun,
      requireApprovals: 0,
      requirePassingChecks: true,
      autoDeleteBranch: true,
      mergeMethod: 'merge',
      autoMergeLabels: [],
    };

    const merger = new AutoMerger(mergerConfig);

    try {
      console.log('\n\n=== Running Auto-Merger ===\n');
      await merger.mergePullRequests();
      const mergerStats = merger.getStats();
      console.log('\nMerger Stats:', mergerStats);
    } catch (error: any) {
      console.error('Error running auto-merger:', error.message);
    }
  });

program.parse(process.argv);
