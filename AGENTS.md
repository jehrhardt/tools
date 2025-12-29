# Agent Guidelines for tools Repository

This document provides essential information for AI coding agents working in this repository.

## Project Overview

This is a collection of miscellaneous Python tools designed to automate everyday tasks and experiment with ideas. Each tool is a standalone Python script that uses `uv` for dependency management and execution.

**Philosophy**: Ship small, useful projects that wouldn't normally justify the time investment - enabled by LLM productivity boost.

## Technology Stack

- **Language**: Python 3.14+
- **Package Manager**: [uv](https://github.com/astral-sh/uv)
- **CLI Framework**: [typer](https://typer.tiangolo.com/) for command-line interfaces
- **Script Format**: PEP 723 inline script metadata
- **Platform**: Linux (Arch Linux specific for some tools like fingerprint.py)

## Build/Run/Test Commands

### Running Scripts

```bash
# Run a script directly (uv handles dependencies automatically)
uv run fingerprint.py <command>

# Run with specific arguments
uv run --script fingerprint.py init
uv run --script fingerprint.py add
uv run --script fingerprint.py remove --pam
```

### Development

```bash
# No build step required - scripts are standalone

# Format code (if ruff or black is added in the future)
# Currently no formatter configured

# Type checking (if mypy is added in the future)
# Currently no type checker configured

# Run a single test (once tests are added)
# pytest tests/test_fingerprint.py::test_specific_function
```

### Testing

**Current State**: No test framework currently configured.

**When Adding Tests**: Use pytest with the following structure:

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_fingerprint.py

# Run specific test function
pytest tests/test_fingerprint.py::test_init_command

# Run with coverage
pytest --cov=. --cov-report=html
```

## Code Style Guidelines

### Script Structure

Every new tool should be a standalone executable Python script following this template:

```python
#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.14"
# dependencies = [
#     "typer",
#     # Add other dependencies here
# ]
# ///

"""Brief description of what this tool does."""

import os
import subprocess
from pathlib import Path

import typer

app = typer.Typer(help="Tool description")

# Your code here

if __name__ == "__main__":
    app()
```

### Imports

**Order**: Standard library imports first, then third-party imports, separated by a blank line.

```python
# Standard library
import os
import shutil
import subprocess
from pathlib import Path
import tempfile

# Third-party
import typer
```

**Style**:

- Use absolute imports
- Avoid wildcard imports (`from module import *`)
- Group related imports together

### Formatting

- **Indentation**: 4 spaces (no tabs)
- **Line Length**: Keep lines reasonable (≤88 characters preferred, but not strict)
- **Quotes**: Double quotes for strings (as seen in `fingerprint.py`)
- **Blank Lines**: 2 blank lines between top-level functions/classes

### Types

- **Python Version**: Target Python 3.14+ (use modern Python features)
- **Type Hints**: Not currently enforced, but welcome for clarity
- **When to use**: Add type hints for function signatures when it improves readability

### Naming Conventions

- **Files**: Lowercase with underscores (e.g., `fingerprint.py`)
- **Functions**: Lowercase with underscores (e.g., `check_requirements()`, `write_privileged()`)
- **Variables**: Lowercase with underscores (e.g., `username`, `tmp_path`)
- **Constants**: Uppercase with underscores (e.g., `PAM_FPRINTD_LINE`, `PAM_SUDO_PATH`)
- **Classes**: PascalCase (when needed)

### Error Handling

**Pattern**: Use try-except blocks for expected failures, provide helpful error messages.

```python
try:
    subprocess.run(["some-command"], check=True)
    typer.secho("Success message!", fg=typer.colors.GREEN)
except subprocess.CalledProcessError as e:
    typer.secho(f"Failed: {e}", fg=typer.colors.RED, err=True)
    raise typer.Exit(1)
except PermissionError as e:
    typer.secho(f"Permission denied: {e}", fg=typer.colors.RED, err=True)
    raise typer.Exit(1)
```

**Best Practices**:

- Catch specific exceptions (avoid bare `except:`)
- Always provide context in error messages
- Use `typer.secho()` with colors for user feedback (GREEN for success, RED for errors, YELLOW for warnings)
- Exit with non-zero status on errors (`raise typer.Exit(1)`)
- Write errors to stderr using `err=True`
- Handle `KeyboardInterrupt` gracefully for interactive commands

### CLI Commands

Use typer decorators for commands:

```python
@app.command()
def command_name(
    option: bool = typer.Option(False, "--flag", help="Description"),
):
    """Command description shown in help."""
    pass
```

**Guidelines**:

- Provide clear help text for all commands and options
- Use `typer.confirm()` for destructive operations
- Provide progress feedback with `typer.secho()`
- Use colored output for better UX (GREEN=success, RED=error, YELLOW=info/warning)

### Documentation

- **Docstrings**: Use for all functions/commands, brief and descriptive
- **Comments**: Explain "why", not "what" (code should be self-documenting)
- **README**: Update README.md when adding new tools with usage examples

### File Handling

- **Paths**: Use `pathlib.Path` instead of string manipulation
- **Example**: `PAM_SUDO_PATH = Path("/etc/pam.d/sudo")`

### Subprocess Usage

- Use `subprocess.run()` with `check=True` for commands that should fail on error
- Use `check=False` when failure is acceptable
- Always provide user feedback about what's happening

## Adding New Tools

**IMPORTANT**: Use `uv` commands to create and manage scripts. Do NOT manually create scripts.

### Creating a New Script

```bash
# Create a new script with uv (automatically sets up PEP 723 metadata)
uv init --script example.py --python 3.14

# Make it executable
chmod +x example.py
```

### Adding Dependencies

```bash
# Add a dependency to a script (updates inline metadata)
uv add --script example.py typer

# Add a dependency with version constraint
uv add --script example.py 'requests<3'

# Add multiple dependencies
uv add --script example.py typer 'requests<3' pydantic
```

### Workflow

1. Create the script: `uv init --script tool_name.py --python 3.14`
2. Add dependencies: `uv add --script tool_name.py typer`
3. Make it executable: `chmod +x tool_name.py`
4. Implement the tool following the code style guidelines above
5. Update README.md with tool description and usage examples
6. Test the tool: `uv run tool_name.py`

## Environment

- **Platform**: Linux (some tools may be distro-specific)
- **Environment Variables**: Can be loaded from `.env` file (configured in `mise.toml`)
- **Virtual Environments**: Managed automatically by `uv`

## Git Workflow

- Keep commits focused and atomic
- Write clear commit messages
- Update README.md and this file when adding significant features
