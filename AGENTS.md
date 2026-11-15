# Instructions for Agents

This project uses `uv` as package manager.

## Version Control

ALWAYS use conventional commit messages.

### Pre-commit verification

Before committing changes, run the following.

1. Format the code with `ruff`:

   ```bash
   uv run ruff format .
   ```

2. Run type checks with `ty`:

   ```bash
   uv run ty check
   ```

3. Lint the code with `ruff`:

   ```bash
   uv run ruff check .
   ```

All errors and warnings reported by `ty` and `ruff` MUST be fixed before committing.
