# tools

Miscellaneous Python tools to automate everyday tasks and experiment with ideas.

Inspired by this quote from [Simon Willison](https://simonwillison.net):

> "*This* is why I care so much about the productivity boost I get from LLMs so
> much: it’s not about getting work done faster, it’s about being able to ship
> projects that I wouldn’t have been able to justify spending time on at all."

## Why Python is the right tool for the job?

* Python is a nice scripting language that is easy to learn and read.
* It is a powerful language with a huge ecosystem of libraries for all
  kinds of tasks.
* Lastly, [uv](https://github.com/astral-sh/uv) has made Python a breeze to
  work with.

## Install

This project uses [uv](https://github.com/astral-sh/uv) for running scripts.

## Usage

It is recommended to use an alias for running scripts. This is an example for
Fish from my dotfiles.

## Available Tools

### fingerprint

Manage fingerprint authentication on Arch Linux.

**Commands:**

* `fingerprint init` - Setup PAM configuration for fingerprint
  authentication (sudo/polkit)
* `fingerprint add` - Add a new fingerprint for the current user
* `fingerprint remove` - Remove all fingerprints for the current user
  * `--pam` - Also remove PAM configuration

**Requirements:**

* `fprintd` package must be installed: `paru -S fprintd`

**Example:**

```bash
# Initial setup
uv run --script fingerprint.py init

# Add a fingerprint
uv run --script fingerprint.py add

# Remove fingerprints (keeping PAM config)
uv run --script fingerprint.py remove

# Remove fingerprints and PAM config
uv run --script fingerprint.py remove --pam
```

### openapi_server

FastAPI test server with diverse endpoints for OpenAPI agent experimentation.

**Features:**

* RESTful API with users, items, orders, and search endpoints
* Full CRUD operations for resources
* OpenAPI 3.1 specification at `/openapi.json`
* Interactive docs at `/docs`

**Example:**

```bash
# Start the server
uv run --script openapi_server.py

# Server runs on http://localhost:8000
# OpenAPI spec: http://localhost:8000/openapi.json
# Interactive docs: http://localhost:8000/docs
```

### openapi_agent

AI agent that can interact with APIs using OpenAPI specifications. Creates dynamic tools from OpenAPI specs and uses Pydantic AI with Mistral to execute API calls.

**Commands:**

* `openapi_agent run <openapi_url> --prompt "<your_prompt>"` - Execute a prompt against an API
  * `--devstral` - Use devstral model instead of default Mistral
* `openapi_agent test` - Test with local server

**Requirements:**

* `MISTRAL_API_KEY` environment variable for Mistral model (optional - uses test model if not set)

**Example:**

```bash
# Test with local server (make sure openapi_server.py is running)
uv run --script openapi_agent.py run localhost:8000/openapi.json --prompt "Get all users and show their names and emails"

# Create a new user and show results
uv run --script openapi_agent.py run localhost:8000/openapi.json --prompt "Create a user named 'John Doe' with email 'john@example.com' and show all users"

# Search for items
uv run --script openapi_agent.py run localhost:8000/openapi.json --prompt "Show me all items in the Electronics category"

# Use devstral model
uv run --script openapi_agent.py run localhost:8000/openapi.json --prompt "Get system statistics" --devstral
```

## Environment Variables

### General
* Various tools may require specific environment variables - check individual tool documentation.

### OpenAPI Agent
* `MISTRAL_API_KEY` - API key for Mistral AI model (optional - falls back to test model if not set)

### Example .env file
```bash
# Mistral API key for OpenAPI agent
MISTRAL_API_KEY=your-mistral-api-key-here
```
