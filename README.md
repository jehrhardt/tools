# tools

Miscellaneous Python tools to automate everyday tasks and experiment with ideas.

Inspired by this quote from [Simon Willison](https://simonwillison.net):

> "*This* is why I care so much about the productivity boost I get from LLMs so
> much: it’s not about getting work done faster, it’s about being able to ship
> projects that I wouldn’t have been able to justify spending time on at all."

## Usage

Start the API (defaults to `http://127.0.0.10:8000`):

```bash
uv run tools serve --port 8000 --bind 127.0.0.10
```

The API exposes `GET /info`, which responds with:

```json
{ "status": "OK" }
```

Start the web UI in a second terminal:

```bash
cd web
pnpm install
pnpm dev
```

The dev server proxies `/info` to `http://127.0.0.10:8000`. Set `TOOLS_API_URL` to
point it at a different API address, for example when using a custom `--bind` or
`--port`.
