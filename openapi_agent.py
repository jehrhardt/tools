#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.14"
# dependencies = [
#     "typer",
#     "httpx",
#     "rich",
#     "pydantic-ai",
#     "python-dotenv",
# ]
# ///

"""OpenAPI Agent - AI agent that can interact with APIs using OpenAPI specifications."""

import json
import os
from typing import Any, Dict, List, Optional, Callable
from urllib.parse import urlparse

import httpx
import typer
from dotenv import load_dotenv
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.syntax import Syntax

# Load environment variables
load_dotenv()

# Constants
DEFAULT_SERVER_URL = "localhost:8000"
DEFAULT_SERVER_PORT = 8000

console = Console()
app = typer.Typer(help="OpenAPI Agent - AI agent for API interaction")


class OpenAPIEndpoint:
    """Represents an OpenAPI endpoint."""

    def __init__(self, path: str, method: str, spec: Dict[str, Any]):
        self.path = path
        self.method = method.upper()
        self.spec = spec
        self.operation_id = spec.get(
            "operationId",
            f"{method}_{path.replace('/', '_').replace('{', '').replace('}', '')}",
        )
        self.summary = spec.get("summary", "")
        self.description = spec.get("description", "")
        self.parameters = spec.get("parameters", [])
        self.request_body = spec.get("requestBody", {})
        self.responses = spec.get("responses", {})

    def __str__(self):
        return f"{self.method} {self.path}"


class OpenAPISpec:
    """OpenAPI specification parser."""

    def __init__(self, spec: Dict[str, Any], base_url: str):
        self.spec = spec
        self.base_url = base_url.rstrip("/")
        self.title = spec.get("info", {}).get("title", "API")
        self.version = spec.get("info", {}).get("version", "1.0.0")
        self.endpoints = self._parse_endpoints()

    def _parse_endpoints(self) -> List[OpenAPIEndpoint]:
        """Parse endpoints from OpenAPI spec."""
        endpoints = []
        paths = self.spec.get("paths", {})

        for path, path_spec in paths.items():
            for method, method_spec in path_spec.items():
                if method.upper() in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
                    endpoint = OpenAPIEndpoint(path, method, method_spec)
                    endpoints.append(endpoint)

        return endpoints

    def display_endpoints_table(self):
        """Display endpoints as a formatted table."""
        table = Table(title=f"{self.title} - Available Endpoints")
        table.add_column("Method", style="cyan", width=8)
        table.add_column("Path", style="magenta", width=30)
        table.add_column("Operation ID", style="green", width=25)
        table.add_column("Summary", style="white", width=40)

        for endpoint in self.endpoints:
            method_color = {
                "GET": "blue",
                "POST": "green",
                "PUT": "yellow",
                "DELETE": "red",
                "PATCH": "magenta",
            }.get(endpoint.method, "white")

            table.add_row(
                f"[{method_color}]{endpoint.method}[/{method_color}]",
                endpoint.path,
                endpoint.operation_id,
                endpoint.summary or endpoint.description or "No description",
            )

        console.print(table)

    def get_endpoint_by_operation_id(
        self, operation_id: str
    ) -> Optional[OpenAPIEndpoint]:
        """Find endpoint by operation ID."""
        for endpoint in self.endpoints:
            if endpoint.operation_id == operation_id:
                return endpoint
        return None


class APIClient:
    """HTTP client for API requests."""

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.client = httpx.Client(timeout=30.0)

    def make_request(self, endpoint: OpenAPIEndpoint, **kwargs) -> Dict[str, Any]:
        """Make HTTP request to API endpoint."""
        # Build URL
        url = self.base_url + endpoint.path

        # Replace path parameters
        for param in endpoint.parameters:
            if param["in"] == "path" and param["name"] in kwargs:
                url = url.replace(f"{{{param['name']}}}", str(kwargs[param["name"]]))

        # Prepare request data
        request_data = {}
        query_params = {}
        headers = {"Content-Type": "application/json"}

        # Process parameters
        for param in endpoint.parameters:
            param_name = param["name"]
            if param_name in kwargs:
                if param["in"] == "query":
                    query_params[param_name] = kwargs[param_name]
                elif param["in"] == "header":
                    headers[param_name] = kwargs[param_name]

        # Process request body
        if endpoint.request_body and "content" in endpoint.request_body:
            if "application/json" in endpoint.request_body["content"]:
                schema = endpoint.request_body["content"]["application/json"].get(
                    "schema", {}
                )
                body_data = {
                    k: v
                    for k, v in kwargs.items()
                    if k not in query_params
                    and k
                    not in [p["name"] for p in endpoint.parameters if p["in"] == "path"]
                }
                request_data["json"] = body_data

        # Display request details
        console.print(f"\n[bold cyan]Making API Request:[/bold cyan]")
        console.print(f"Method: [bold]{endpoint.method}[/bold]")
        console.print(f"URL: [blue]{url}[/blue]")
        if query_params:
            console.print(f"Query Params: [yellow]{query_params}[/yellow]")
        if request_data.get("json"):
            console.print("Request Body:")
            syntax = Syntax(
                json.dumps(request_data["json"], indent=2), "json", theme="monokai"
            )
            console.print(syntax)

        # Make the request
        try:
            response = self.client.request(
                method=endpoint.method,
                url=url,
                params=query_params,
                headers=headers,
                **request_data,
            )

            # Display response details
            console.print(f"\n[bold cyan]API Response:[/bold cyan]")
            console.print(f"Status Code: [bold]{response.status_code}[/bold]")

            if response.status_code >= 200 and response.status_code < 300:
                try:
                    response_data = response.json()
                    console.print("Response Body:")
                    syntax = Syntax(
                        json.dumps(response_data, indent=2), "json", theme="monokai"
                    )
                    console.print(syntax)
                    return response_data
                except json.JSONDecodeError:
                    console.print(f"Response Text: {response.text}")
                    return {"text": response.text}
            else:
                console.print(f"[red]Error Response: {response.text}[/red]")
                return {"error": response.text, "status_code": response.status_code}

        except httpx.RequestError as e:
            console.print(f"[red]Request Error: {e}[/red]")
            return {"error": str(e)}
        except Exception as e:
            console.print(f"[red]Unexpected Error: {e}[/red]")
            return {"error": str(e)}


def create_tool_function(endpoint: OpenAPIEndpoint, api_client: APIClient) -> Callable:
    """Create a tool function for an OpenAPI endpoint."""

    def tool_function(**kwargs):
        """Dynamic tool function for API endpoint."""
        return api_client.make_request(endpoint, **kwargs)

    # Set function name and documentation
    tool_function.__name__ = endpoint.operation_id
    tool_function.__doc__ = f"""
    {endpoint.summary or endpoint.description or f"{endpoint.method} {endpoint.path}"}

    Method: {endpoint.method}
    Path: {endpoint.path}
    """.strip()

    return tool_function


def create_pydantic_agent(
    openapi_spec: OpenAPISpec, api_client: APIClient, model_name: str = "mistral"
):
    """Create a Pydantic AI agent with OpenAPI tools."""
    try:
        from pydantic_ai import Agent
    except ImportError:
        console.print(
            "[red]pydantic-ai not installed. Install with: uv add --script openapi_agent.py pydantic-ai[/red]"
        )
        return None

    # Create agent with simplified model configuration using string format
    if model_name == "devstral":
        # Use devstral model
        agent = Agent(
            "mistral:devstral-medium-latest",
            system_prompt=f"""You are an AI agent that can interact with APIs using the provided tools.
            
You have access to the following API: {openapi_spec.title} (v{openapi_spec.version})

Available endpoints:
{chr(10).join([f"- {ep.method} {ep.path}: {ep.summary or ep.description}" for ep in openapi_spec.endpoints])}

When responding to user requests:
1. Analyze what API calls are needed to fulfill the request
2. Use the appropriate tools to make those API calls
3. Interpret and present the results in a helpful way
4. If multiple API calls are needed, chain them logically
5. Handle errors gracefully and provide helpful feedback

Always show the user what API calls you're making and what the results are.""",
        )
    else:
        # Use mistral model (default)
        agent = Agent(
            "mistral:mistral-large-latest",
            system_prompt=f"""You are an AI agent that can interact with APIs using the provided tools.
            
You have access to the following API: {openapi_spec.title} (v{openapi_spec.version})

Available endpoints:
{chr(10).join([f"- {ep.method} {ep.path}: {ep.summary or ep.description}" for ep in openapi_spec.endpoints])}

When responding to user requests:
1. Analyze what API calls are needed to fulfill the request
2. Use the appropriate tools to make those API calls
3. Interpret and present the results in a helpful way
4. If multiple API calls are needed, chain them logically
5. Handle errors gracefully and provide helpful feedback

Always show the user what API calls you're making and what the results are.""",
        )

    # Add tools for each endpoint
    for endpoint in openapi_spec.endpoints:
        tool_func = create_tool_function(endpoint, api_client)
        agent.tool_plain(tool_func)

    return agent


@app.command()
def run(
    openapi_url: str = typer.Argument(
        ...,
        help=f"URL to OpenAPI specification (e.g., {DEFAULT_SERVER_URL}/openapi.json)",
    ),
    prompt: str = typer.Option(
        ..., "--prompt", "-p", help="Prompt for the AI agent to execute"
    ),
    devstral: bool = typer.Option(
        False, "--devstral", help="Use devstral model instead of default Mistral"
    ),
):
    """Run the OpenAPI agent with a specific prompt."""

    console.print(
        Panel.fit("[bold blue]OpenAPI Agent[/bold blue]", border_style="blue")
    )

    # Ensure URL has proper format
    if not openapi_url.startswith(("http://", "https://")):
        openapi_url = f"http://{openapi_url}"

    console.print(f"Fetching OpenAPI spec from: [cyan]{openapi_url}[/cyan]")

    # Fetch OpenAPI specification
    try:
        with httpx.Client() as client:
            response = client.get(openapi_url)
            response.raise_for_status()
            openapi_spec_data = response.json()
    except Exception as e:
        console.print(f"[red]Failed to fetch OpenAPI spec: {e}[/red]")
        raise typer.Exit(1)

    # Parse OpenAPI spec
    try:
        base_url = urlparse(openapi_url)._replace(path="").geturl()
        openapi_spec = OpenAPISpec(openapi_spec_data, base_url)
        console.print(
            f"[green]Successfully parsed OpenAPI spec: {openapi_spec.title} v{openapi_spec.version}[/green]"
        )
    except Exception as e:
        console.print(f"[red]Failed to parse OpenAPI spec: {e}[/red]")
        raise typer.Exit(1)

    # Display available endpoints
    console.print("\n")
    openapi_spec.display_endpoints_table()

    # Create API client
    api_client = APIClient(base_url)

    # Create agent
    model_name = "devstral" if devstral else "mistral"
    console.print(f"\n[bold]Creating AI agent with {model_name} model...[/bold]")

    agent = create_pydantic_agent(openapi_spec, api_client, model_name)
    if not agent:
        console.print("[red]Failed to create agent[/red]")
        raise typer.Exit(1)

    # Run the agent with the prompt
    console.print(f"\n[bold cyan]Executing prompt:[/bold cyan] [white]{prompt}[/white]")
    console.print("=" * 60)

    try:
        result = agent.run_sync(prompt)
        console.print("\n[bold green]Agent Response:[/bold green]")
        console.print(Panel(result.output, border_style="green", title="AI Agent"))

    except Exception as e:
        console.print(f"[red]Agent execution failed: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def test():
    """Test the agent with a local OpenAPI spec."""
    console.print("[yellow]Testing with local server...[/yellow]")

    # Test with local server
    test_prompt = "Get all users and show me their names and emails. Then create a new user named 'Test User' with email 'test@example.com' and show me the result."

    try:
        run(f"{DEFAULT_SERVER_URL}/openapi.json", prompt=test_prompt)
    except typer.Exit:
        console.print("[red]Test failed. Make sure the test server is running.[/red]")
        console.print("Start it with: uv run --script openapi_server.py")


if __name__ == "__main__":
    app()
