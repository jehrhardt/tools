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

## Environment Variables
