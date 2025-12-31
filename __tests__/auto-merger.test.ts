import { AutoMerger } from '../src/automation/auto-merger';
import { AutoMergerConfig } from '../src/automation/auto-resolver-types';

describe('AutoMerger', () => {
  const mockConfig: AutoMergerConfig = {
    githubToken: 'test-token',
    organization: 'test-org',
    repositories: ['test-repo'],
    dryRun: true,
    requireApprovals: 1,
    requirePassingChecks: true,
    autoDeleteBranch: true,
    mergeMethod: 'squash',
    autoMergeLabels: ['auto-merge'],
  };

  describe('constructor', () => {
    it('should create an instance with provided config', () => {
      const merger = new AutoMerger(mockConfig);
      expect(merger).toBeInstanceOf(AutoMerger);
    });
  });

  describe('getStats', () => {
    it('should return initial stats', () => {
      const merger = new AutoMerger(mockConfig);
      const stats = merger.getStats();
      
      expect(stats.totalPrsProcessed).toBe(0);
      expect(stats.prsMerged).toBe(0);
      expect(stats.prsSkipped).toBe(0);
      expect(stats.errors).toBe(0);
    });
  });

  describe('resetStats', () => {
    it('should reset stats to zero', () => {
      const merger = new AutoMerger(mockConfig);
      
      // Stats would be modified during processing
      merger.resetStats();
      
      const stats = merger.getStats();
      expect(stats.totalPrsProcessed).toBe(0);
      expect(stats.prsMerged).toBe(0);
      expect(stats.prsSkipped).toBe(0);
      expect(stats.errors).toBe(0);
    });
  });

  describe('mergePullRequests', () => {
    it('should return empty array when no repositories configured', async () => {
      const emptyConfig = { ...mockConfig, repositories: [] };
      const merger = new AutoMerger(emptyConfig);
      
      const results = await merger.mergePullRequests();
      
      expect(results).toEqual([]);
    });
  });
});
