# /// script
# requires-python = ">=3.12"
# dependencies = ["click", "PyGithub"]
# ///

import click
import subprocess
import re
from github import Github


def help() -> tuple[str, str]:
    """Return help information for gh_work module."""
    title = "GitHub Work Helper"
    content = (
        "A utility script for GitHub-related work tasks.\n\n"
        "Usage:\n"
        "  uv run gh_work.py  - Run the CLI\n"
        "  uv run gh_work.py start <issue_id>  - Start work on a GitHub issue\n"
    )
    return title, content


def get_github_repo():
    """Get the GitHub repository from git remote origin."""
    try:
        # Get the remote origin URL
        result = subprocess.run(
            ["git", "config", "--get", "remote.origin.url"],
            capture_output=True,
            text=True,
            check=True
        )
        remote_url = result.stdout.strip()
        
        # Extract owner and repo from the URL
        # Handle different URL formats (HTTPS or SSH)
        if remote_url.startswith("https://"):
            # Format: https://github.com/owner/repo.git
            match = re.search(r"github.com/([^/]+)/([^/.]+)", remote_url)
        else:
            # Format: git@github.com:owner/repo.git
            match = re.search(r"github.com:([^/]+)/([^/.]+)", remote_url)
        
        if match:
            owner, repo = match.groups()
            return owner, repo
        return None, None
    except subprocess.CalledProcessError:
        return None, None


@click.group()
def cli():
    """GitHub Work Helper - Manage your GitHub work tasks."""
    pass


@cli.command()
@click.argument("issue_id", type=int)
def start(issue_id):
    """Start work on a GitHub issue with the given ID."""
    # Check if the issue exists in the GitHub repository
    issue = None
    owner, repo = get_github_repo()
    
    if not owner or not repo:
        print("Error: Could not determine GitHub repository from git remote origin.")
        return
    
    try:
        # Connect to GitHub API (uses GITHUB_TOKEN environment variable if available)
        g = Github()
        repository = g.get_repo(f"{owner}/{repo}")
        
        # Try to get the issue
        try:
            issue = repository.get_issue(issue_id)
            print(f"✅ Found issue #{issue_id}: {issue.title}")
            print(f"Status: {issue.state}")
            print(f"Starting work on GitHub issue #{issue_id}")
            
            # Create a new branch from origin main with issue ID and title
            # Sanitize issue title for branch name
            branch_title = re.sub(r"[^\w-]", "-", issue.title.lower())
            branch_title = re.sub(r"-+", "-", branch_title).strip("-")  # Replace multiple dashes with single dash
            branch_name = f"{issue_id}-{branch_title}"
            
            print(f"\nCreating and switching to branch: {branch_name}")
            
            # Fetch from origin main
            try:
                subprocess.run(["git", "fetch", "origin", "main"], check=True)
                # Create a new branch from origin/main
                subprocess.run(["git", "checkout", "-b", branch_name, "origin/main"], check=True)
                print(f"✅ Successfully created and switched to branch {branch_name}")
            except subprocess.CalledProcessError as e:
                print(f"❌ Failed to create branch: {str(e)}")
                
        except Exception as e:
            print(f"❌ Issue #{issue_id} not found in {owner}/{repo}.")
            print(f"Error: {str(e)}")
            return
            
    except Exception as e:
        print(f"Error connecting to GitHub: {str(e)}")
        print(f"Proceeding without GitHub verification for issue #{issue_id}")


if __name__ == "__main__":
    # Run the CLI
    cli()
