import { AutoResolver } from '../src/automation/auto-resolver';
import { AutoResolverConfig } from '../src/automation/auto-resolver-types';

describe('AutoResolver', () => {
  const mockConfig: AutoResolverConfig = {
    githubToken: 'test-token',
    organization: 'test-org',
    repositories: ['test-repo'],
    dryRun: true,
    autoCloseStale: true,
    staleDays: 30,
    autoAssign: true,
    defaultAssignees: ['test-user'],
  };

  describe('constructor', () => {
    it('should create an instance with provided config', () => {
      const resolver = new AutoResolver(mockConfig);
      expect(resolver).toBeInstanceOf(AutoResolver);
    });
  });

  describe('getStats', () => {
    it('should return initial stats', () => {
      const resolver = new AutoResolver(mockConfig);
      const stats = resolver.getStats();
      
      expect(stats.totalIssuesProcessed).toBe(0);
      expect(stats.issuesClosed).toBe(0);
      expect(stats.issuesAssigned).toBe(0);
      expect(stats.issuesSkipped).toBe(0);
      expect(stats.errors).toBe(0);
    });
  });

  describe('resetStats', () => {
    it('should reset stats to zero', () => {
      const resolver = new AutoResolver(mockConfig);
      
      // Stats would be modified during processing
      resolver.resetStats();
      
      const stats = resolver.getStats();
      expect(stats.totalIssuesProcessed).toBe(0);
      expect(stats.issuesClosed).toBe(0);
      expect(stats.issuesAssigned).toBe(0);
      expect(stats.issuesSkipped).toBe(0);
      expect(stats.errors).toBe(0);
    });
  });

  describe('resolveIssues', () => {
    it('should return empty array when no repositories configured', async () => {
      const emptyConfig = { ...mockConfig, repositories: [] };
      const resolver = new AutoResolver(emptyConfig);
      
      const results = await resolver.resolveIssues();
      
      expect(results).toEqual([]);
    });
  });
});
