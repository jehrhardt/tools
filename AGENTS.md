# Instructions for Agents

This project is a TypeScript monorepo managed with pnpm workspaces.

- `apps/web` – SolidJS, Vite, Tailwind CSS, and daisyUI.
- `apps/api` – Node.js Hono API with Automerge WebSocket sync and file-system storage.
- `packages/shared` – Zod schemas and shared types.
- `packages/toolkit` – shared tool contracts and Automerge document helpers.
- `tools/*` – independently packaged tool UIs and document logic.

## Version Control

ALWAYS use conventional commit messages.

## Pre-commit verification

Before committing changes, run the following from the project root.

1. Format the code with `oxfmt`:

   ```bash
   pnpm fmt
   ```

2. Lint and type-check the code with `oxlint`:

   ```bash
   pnpm lint
   ```

3. Build the workspace:

   ```bash
   pnpm build
   ```

4. Run the automated tests:

   ```bash
   pnpm test
   ```

   The web browser tests need Chromium. Install it once with
   `pnpm --filter @tools/web exec playwright install chromium`.

All errors and warnings reported by `oxlint` or the build, as well as any
failing test, MUST be fixed before committing.
