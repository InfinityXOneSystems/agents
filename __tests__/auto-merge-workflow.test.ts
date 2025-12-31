import { describe, it, expect } from '@jest/globals';
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

  it('should exist', () => {
    expect(fs.existsSync(workflowPath)).toBe(true);
  });

  it('should be valid YAML', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');
    expect(() => yaml.parse(content)).not.toThrow();
  });

  it('should have correct name', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.parse(content);
    expect(workflow.name).toBe('Auto-Merge Infinity-Matrix PRs');
  });

  it('should trigger on pull_request events', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.parse(content);
    expect(workflow.on).toHaveProperty('pull_request');
    expect(workflow.on.pull_request.types).toEqual(
      expect.arrayContaining(['opened', 'synchronize', 'reopened', 'ready_for_review'])
    );
  });

  it('should filter by infinity-matrix path', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.parse(content);
    expect(workflow.on.pull_request.paths).toContain('infinity-matrix/**');
  });

  it('should have required permissions', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.parse(content);
    expect(workflow.permissions).toHaveProperty('contents', 'write');
    expect(workflow.permissions).toHaveProperty('pull-requests', 'write');
    expect(workflow.permissions).toHaveProperty('checks', 'read');
  });

  it('should have auto-merge job', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.parse(content);
    expect(workflow.jobs).toHaveProperty('auto-merge');
  });

  it('should have force-merge fallback job', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.parse(content);
    expect(workflow.jobs).toHaveProperty('force-merge');
  });
});
