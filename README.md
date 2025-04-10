# Vibes

Vibes from a Cozy Craft Coder.

This project provides helpful tools for everyday development tasks that have been automated with vibe coding ✨.

## Setup

This project uses [uv](https://github.com/astral-sh/uv) for managing Python dependencies and running scripts.

### Prerequisites

- [uv](https://github.com/astral-sh/uv) installed
- Git

## Available Scripts

### Help System

The help system provides information about available modules and commands.

```bash
# Show general help information
uv run help.py

# Show help for a specific module
uv run help.py gh_work
```

### GitHub Work Helper

A utility for GitHub-related work tasks, such as starting work on issues.

```bash
# Start work on a GitHub issue
uv run gh_work.py start <issue_id>
```

This command will:
1. Verify the issue exists in your GitHub repository
2. Create a new branch named `<issue_id>-<sanitized-issue-title>`
3. Switch to the newly created branch

## Environment Variables

- `GITHUB_TOKEN` - GitHub access token (optional, used for GitHub API access)

## Project Structure

- `gh_work.py` - GitHub workflow utilities
- `help.py` - Help system for displaying information about modules

## License

[Apache License 2.0](https://opensource.org/licenses/Apache-2.0)
