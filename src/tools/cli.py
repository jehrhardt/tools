"""Command line interface for the tools package."""

import typer
import uvicorn

from tools.api import create_app

cli = typer.Typer(
    add_completion=False,
    help="Miscellaneous tools to automate everyday tasks.",
    no_args_is_help=True,
)


@cli.callback()
def main() -> None:
    """Run one of the tools available in this package."""


@cli.command()
def serve(
    port: int = typer.Option(8000, help="Port the API listens on."),
    bind: str = typer.Option("127.0.0.10", help="Address the API binds to."),
) -> None:
    """Serve the API and the web UI."""
    uvicorn.run(create_app(), host=bind, port=port)
