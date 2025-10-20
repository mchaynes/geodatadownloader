# GitHub Actions CI for Playwright Tests

This repository includes automated Playwright test execution via GitHub Actions.

## How It Works

The workflow (`.github/workflows/playwright.yml`) runs automatically:
- On every push to `main` or `master` branches
- On every pull request targeting `main` or `master` branches

## Test Execution

When a PR is created or updated:
1. GitHub Actions will automatically run the Playwright test suite
2. Tests must pass before the PR can be merged
3. Test results are visible in the PR "Checks" tab

## Viewing Test Results

### In GitHub Actions UI
1. Go to the "Actions" tab in the repository
2. Click on the workflow run you want to view
3. Click on the "test" job to see detailed logs
4. Test output is visible in the "Run Playwright tests" step

### Test Artifacts
If tests fail or you want to review detailed reports:
1. Go to the workflow run in the "Actions" tab
2. Scroll to the bottom of the page
3. Download the artifacts:
   - **playwright-report**: HTML report with test results, screenshots, and traces
   - **test-results**: Raw test results and failure artifacts

### GitHub Annotations
Failed tests will appear as annotations directly in the PR:
- Check the "Files changed" tab
- Failed tests will be annotated in relevant code sections
- The "Checks" tab shows a summary of all test failures

## Local Testing

Run tests locally before pushing:
```bash
# Run all tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests with visible browser
npm run test:e2e:headed
```

## Reporters

The CI uses multiple reporters:
- **html**: Generates an interactive HTML report (available as artifact)
- **github**: Creates GitHub annotations for failed tests
- **list**: Provides detailed console output in the workflow logs

## Configuration

The workflow is configured to:
- Run tests on Ubuntu Latest
- Install Chromium browser automatically
- Use Node.js version specified in `.nvmrc`
- Cache npm dependencies for faster runs
- Retry failed tests up to 2 times
- Keep artifacts for 30 days
