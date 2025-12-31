# Auto-Resolver and Auto-Merger

Automated tools for resolving GitHub issues and merging pull requests across repositories.

## Features

### Auto-Resolver
- Automatically close stale issues after a configurable period of inactivity
- Auto-assign issues to default assignees
- Configurable dry-run mode for testing
- Detailed logging and statistics

### Auto-Merger
- Automatically merge pull requests that meet criteria
- Support for multiple merge methods (merge, squash, rebase)
- Require minimum approvals before merging
- Require passing checks before merging
- Auto-delete branches after merge
- Label-based auto-merge control
- Configurable dry-run mode for testing

## Installation

```bash
cd repos/agents
npm install
npm run build
```

## Usage

### CLI Commands

#### Auto-Resolve Issues

```bash
npm run auto-resolve -- \
  --token YOUR_GITHUB_TOKEN \
  --org YOUR_ORG \
  --repos repo1 repo2 repo3 \
  --dry-run \
  --auto-close-stale \
  --stale-days 30 \
  --auto-assign \
  --assignees user1 user2
```

#### Auto-Merge Pull Requests

```bash
npm run auto-merge -- \
  --token YOUR_GITHUB_TOKEN \
  --org YOUR_ORG \
  --repos repo1 repo2 repo3 \
  --dry-run \
  --require-approvals 1 \
  --require-passing-checks \
  --auto-delete-branch \
  --merge-method squash \
  --auto-merge-labels auto-merge ready-to-merge
```

#### Run Both

```bash
npm run auto-ops -- all \
  --token YOUR_GITHUB_TOKEN \
  --org YOUR_ORG \
  --repos repo1 repo2 repo3 \
  --dry-run
```

### Programmatic Usage

```typescript
import { AutoResolver, AutoMerger } from './agents/automation';

// Auto-resolve issues
const resolver = new AutoResolver({
  githubToken: process.env.GITHUB_TOKEN,
  organization: 'InfinityXOneSystems',
  repositories: ['repo1', 'repo2'],
  dryRun: false,
  autoCloseStale: true,
  staleDays: 30,
  autoAssign: true,
  defaultAssignees: ['bot-user'],
});

const resolverResults = await resolver.resolveIssues();
console.log(resolver.getStats());

// Auto-merge pull requests
const merger = new AutoMerger({
  githubToken: process.env.GITHUB_TOKEN,
  organization: 'InfinityXOneSystems',
  repositories: ['repo1', 'repo2'],
  dryRun: false,
  requireApprovals: 1,
  requirePassingChecks: true,
  autoDeleteBranch: true,
  mergeMethod: 'squash',
  autoMergeLabels: ['auto-merge'],
});

const mergeResults = await merger.mergePullRequests();
console.log(merger.getStats());
```

## Configuration

### Auto-Resolver Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `githubToken` | string | GitHub personal access token | Required |
| `organization` | string | GitHub organization name | Required |
| `repositories` | string[] | Repository names to process | Required |
| `dryRun` | boolean | Run without making changes | `false` |
| `autoCloseStale` | boolean | Auto-close stale issues | `false` |
| `staleDays` | number | Days of inactivity before closing | `30` |
| `autoAssign` | boolean | Auto-assign unassigned issues | `false` |
| `defaultAssignees` | string[] | Default assignees | `[]` |

### Auto-Merger Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `githubToken` | string | GitHub personal access token | Required |
| `organization` | string | GitHub organization name | Required |
| `repositories` | string[] | Repository names to process | Required |
| `dryRun` | boolean | Run without making changes | `false` |
| `requireApprovals` | number | Minimum approvals required | `0` |
| `requirePassingChecks` | boolean | Require passing CI checks | `false` |
| `autoDeleteBranch` | boolean | Delete branch after merge | `false` |
| `mergeMethod` | string | Merge method (merge/squash/rebase) | `merge` |
| `autoMergeLabels` | string[] | Labels for auto-merge eligibility | `[]` |

## GitHub Token Permissions

The GitHub token needs the following permissions:

- `repo` - Full control of repositories
- `workflow` - Update GitHub Actions workflows
- `read:org` - Read organization data

## Examples

### Close Stale Issues

```bash
npm run auto-resolve -- \
  --token $GITHUB_TOKEN \
  --org InfinityXOneSystems \
  --repos agents infinity-matrix \
  --auto-close-stale \
  --stale-days 60
```

### Merge Approved PRs

```bash
npm run auto-merge -- \
  --token $GITHUB_TOKEN \
  --org InfinityXOneSystems \
  --repos agents \
  --require-approvals 2 \
  --require-passing-checks \
  --merge-method squash \
  --auto-delete-branch
```

### Label-Based Auto-Merge

```bash
npm run auto-merge -- \
  --token $GITHUB_TOKEN \
  --org InfinityXOneSystems \
  --repos agents \
  --auto-merge-labels auto-merge \
  --require-passing-checks \
  --merge-method squash
```

## Safety Features

1. **Dry-Run Mode**: Test operations without making changes
2. **Draft PR Detection**: Automatically skips draft pull requests
3. **Merge Conflict Detection**: Skips PRs with conflicts
4. **Status Checks**: Validates CI/CD status before merging
5. **Approval Requirements**: Enforces minimum review approvals
6. **Detailed Logging**: Comprehensive operation logs and statistics

## Enterprise Features

- **24/7 Operation**: Designed for continuous autonomous operation
- **Multi-Repository Support**: Process multiple repositories in parallel
- **Error Handling**: Robust error handling and recovery
- **Audit Trail**: Detailed results and statistics for compliance
- **Rate Limit Aware**: Respects GitHub API rate limits

## Testing

```bash
npm test
```

## License

MIT
