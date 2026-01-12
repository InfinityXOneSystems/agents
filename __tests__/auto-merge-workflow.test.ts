import { describe, it, expect, beforeAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

describe('Auto-Merge Workflow', () => {
  const workflowPath = path.join(
    __dirname,
    '..',
    '.github',
    'workflows',
    'auto-merge-infinity-matrix.yml'
  );

  let workflowContent: string;
  let workflow: any;

  beforeAll(() => {
    workflowContent = fs.readFileSync(workflowPath, 'utf8');
    workflow = yaml.parse(workflowContent);
  });

  it('should exist', () => {
    expect(fs.existsSync(workflowPath)).toBe(true);
  });

  it('should be valid YAML', () => {
    expect(() => yaml.parse(workflowContent)).not.toThrow();
  });

  it('should have correct name', () => {
    expect(workflow.name).toBe('Auto-Merge Infinity-Matrix PRs');
  });

  it('should trigger on pull_request events', () => {
    expect(workflow.on).toHaveProperty('pull_request');
    expect(workflow.on.pull_request.types).toEqual(
      expect.arrayContaining(['opened', 'synchronize', 'reopened', 'ready_for_review'])
    );
  });

  it('should filter by infinity-matrix path', () => {
    expect(workflow.on.pull_request.paths).toContain('infinity-matrix/**');
  });

  it('should have required permissions', () => {
    expect(workflow.permissions).toHaveProperty('contents', 'write');
    expect(workflow.permissions).toHaveProperty('pull-requests', 'write');
    expect(workflow.permissions).toHaveProperty('checks', 'read');
  });

  it('should have auto-merge job', () => {
    expect(workflow.jobs).toHaveProperty('auto-merge');
  });

  it('should have force-merge fallback job', () => {
    expect(workflow.jobs).toHaveProperty('force-merge');
  });
});
