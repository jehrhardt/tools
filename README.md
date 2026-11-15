# tools

Miscellaneous tools to automate everyday tasks and experiment with ideas.

Inspired by this quote from [Simon Willison](https://simonwillison.net):

> "_This_ is why I care so much about the productivity boost I get from LLMs so
> much: it’s not about getting work done faster, it’s about being able to ship
> projects that I wouldn’t have been able to justify spending time on at all."

## Stack

This is a TypeScript monorepo managed with pnpm workspaces.

- `apps/web` – SolidJS web UI built with Vite, Tailwind CSS, and daisyUI.
- `apps/api` – Hono API deployed as a Cloudflare Worker. Requests are handled by
  a Durable Object.
- `packages/shared` – Zod schemas shared by the API and web UI. The web UI uses
  the API's exported Hono RPC type for typed requests.

## Requirements

- Node.js LTS or newer
- pnpm 12 or newer

## Setup

```bash
pnpm install
```

## Development

Start the API and web UI together:

```bash
pnpm dev
```

- Web UI: `http://localhost:5173`
- API: `http://127.0.0.1:8787`

Set `TOOLS_API_URL` to proxy the web UI to a different API address, for example:

```bash
TOOLS_API_URL=http://127.0.0.1:8788 pnpm --filter @tools/web dev
```

## API

The API exposes `GET /info`, which responds with:

```json
{ "status": "OK" }
```

## Testing

Run all tests from the project root:

```bash
pnpm test
```

- `apps/api` – Vitest integration tests covering the worker entry point, routing,
  and response schemas.
- `apps/web` – Vitest browser tests running in headless Chromium through
  Playwright. The API is started with `wrangler dev` for the tests unless it is
  already reachable at `TOOLS_API_URL` (default `http://127.0.0.1:8787`).

Install the Playwright browser once after cloning:

```bash
pnpm --filter @tools/web exec playwright install chromium
```

## Continuous integration

GitHub Actions runs the format check (`oxfmt`), the linter (`oxlint`), and the
full test suite on every push to `main` and on every pull request. Dependabot
checks for dependency updates weekly.
