# Branch Protection Configuration

To protect the `main` branch in GitHub:

1. Go to **Settings → Branches → Add rule**
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require 1 approval for PRs
   - ✅ Dismiss stale reviews when new commits are pushed
   - ✅ Require status checks to pass (TypeScript, ESLint)
   - ✅ Require branches to be up to date before merging
   - ✅ Require linear history
   - ✅ Do not allow bypassing (even for admins)

Status checks to require:
- `TypeScript` (from ci.yml)
- `ESLint` (from ci.yml)

For maintainers: configure this manually in the GitHub repo settings.
