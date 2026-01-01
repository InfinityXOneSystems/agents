# Auto-Merge Workflow for Infinity-Matrix

## Overview

This workflow automatically merges pull requests that affect the `infinity-matrix/` directory in the repository.

## How It Works

1. **Trigger**: The workflow runs when a pull request is:
   - Opened
   - Synchronized (new commits pushed)
   - Reopened
   - Marked as ready for review
   - AND affects files in the `infinity-matrix/**` path

2. **Auto-Merge Process**:
   - The workflow enables auto-merge with squash commit strategy
   - Adds a comment to the PR indicating auto-merge is enabled
   - The PR will automatically merge once all required checks pass

3. **Force Merge Fallback**:
   - If a PR is marked as ready for review, a fallback job attempts to merge after 30 seconds
   - This ensures PRs are merged even if auto-merge feature is not available

## Configuration

### Required Permissions
The workflow requires:
- `contents: write` - To merge PRs
- `pull-requests: write` - To enable auto-merge and add comments
- `checks: read` - To check status of other workflows

### Merge Strategy
- Uses **squash merge** to keep commit history clean
- All commits in the PR are squashed into a single commit

## Usage

### For Pull Request Authors
1. Create a PR that modifies files in `infinity-matrix/`
2. Ensure the PR is not marked as draft
3. The workflow will automatically enable auto-merge
4. Once all checks pass, the PR will be automatically merged

### Disabling Auto-Merge
If you need to disable auto-merge for a specific PR:
```bash
gh pr merge <PR_NUMBER> --disable-auto
```

## Troubleshooting

### PR Not Auto-Merging
- Check if the PR is marked as draft (auto-merge only works on ready PRs)
- Verify all required status checks are passing
- Check if branch protection rules require reviews
- Ensure the PR only affects `infinity-matrix/` files

### Manual Merge
If needed, you can manually merge with:
```bash
gh pr merge <PR_NUMBER> --squash
```

## Security Considerations

- The workflow uses `GITHUB_TOKEN` which has limited permissions
- Only PRs affecting `infinity-matrix/` directory are processed
- Draft PRs are excluded from auto-merge
- All existing branch protection rules still apply

## Related Files
- Workflow file: `.github/workflows/auto-merge-infinity-matrix.yml`
- Infinity-Matrix docs: `infinity-matrix/README.md`
