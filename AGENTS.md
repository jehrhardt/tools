# Instructions for Agents

This project is a TypeScript monorepo managed with pnpm workspaces.

- `apps/web` – SolidJS, Vite, Tailwind CSS, and daisyUI.
- `apps/api` – Hono on Cloudflare Workers. The API is served by a Durable Object.
- `packages/shared` – Zod schemas and shared types.

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
