# tools

Miscellaneous Python tools to automate everyday tasks.

Inspired by this quote from [Simon Willison](https://simonwillison.net):

> "*This* is why I care so much about the productivity boost I get from LLMs so much: it’s not about getting work done faster, it’s about being able to ship projects that I wouldn’t have been able to justify spending time on at all."

### Why Python is the right tool for the job?

* Python is a nice scripting language that is easy to learn and read.
* Due to its popularity, LLMs are good at writing Python code.
* It is also a powerful language with a huge ecosystem of libraries for all kinds of tasks.
* Lastly, [uv](https://github.com/astral-sh/uv) has made Python a breeze to work with.

## Setup

This project uses [uv](https://github.com/astral-sh/uv) for managing Python dependencies and running scripts.

### Prerequisites

Install [uv](https://github.com/astral-sh/uv) by running:

```bash
# macOS
brew install uv

# Arch Linux
sudo pacman -S uv
```

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
