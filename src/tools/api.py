"""FastAPI application served by the ``tools serve`` command."""

from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field


class InfoResponse(BaseModel):
    """Response body of the ``/info`` endpoint."""

    status: Literal["OK"] = Field(default="OK", description="Health status of the API.")


def create_app() -> FastAPI:
    """Build and return the FastAPI application."""
    app = FastAPI(
        title="tools",
        description="API backing the tools web UI.",
        version="0.1.0",
    )

    @app.get("/info")
    def read_info() -> InfoResponse:
        """Report the health status of the API."""
        return InfoResponse()

    return app
