# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a repository for miscellaneous Python tools to automate everyday tasks. The project uses [uv](https://github.com/astral-sh/uv) for running Python scripts without traditional package management overhead.

## Key Philosophy

The repository follows Simon Willison's principle: LLM productivity boost is about shipping projects that wouldn't justify the time investment otherwise. Scripts here should be practical automation tools that solve real everyday problems.

## Environment Management

- Uses [mise](https://mise.jdx.dev/) for environment variable management
- Environment variables are loaded from `.env` file (configured in `mise.toml`)
- The `.env` file is gitignored and should contain any necessary API keys or secrets

## Running Scripts

Scripts are intended to be run with `uv run`. For example:

```bash
uv run script_name.py
```

Users are encouraged to set up shell aliases for frequently used scripts.

## Creating Scripts

Scripts are created using `uv init --script`. For example:

```bash
uv init --script script_name.py --python 3.13
```

This creates a Python script with PEP 723 inline metadata (dependencies declared in a comment block at the top). Scripts should:

- Not be executable with shebang
- Use Typer for CLI with `--help` flag
- Have docstrings explaining their purpose

Example structure:

```python
#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.13"
# dependencies = ["typer"]
# ///

"""Brief description of what the script does."""

import typer
app = typer.Typer(help="Command description")

@app.command()
def main():
    """Command help text."""
    pass

if __name__ == "__main__":
    app()
```

## Adding Dependencies

Dependencies are added to individual scripts with `uv add`. For example:

```bash
uv add --script script_name.py 'requests'
```

## Existing Tools

### fingerprint.py

Manages fingerprint authentication on Arch Linux systems using `fprintd`. Provides commands to:

- `init` - Configure PAM for fingerprint authentication (modifies `/etc/pam.d/sudo` and `/etc/pam.d/polkit-1`)
- `add` - Enroll fingerprints for the current user
- `remove` - Delete fingerprints (with optional `--pam` flag to also remove PAM config)

**System-specific:** Arch Linux only. Requires `fprintd` package.
