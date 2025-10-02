#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "typer",
# ]
# ///

"""Manage fingerprint authentication on Arch Linux."""

import os
import shutil
import subprocess
from pathlib import Path
import tempfile

import typer

app = typer.Typer(help="Manage fingerprint authentication")

PAM_FPRINTD_LINE = "auth      sufficient pam_fprintd.so"
PAM_SUDO_PATH = Path("/etc/pam.d/sudo")
PAM_POLKIT_PATH = Path("/etc/pam.d/polkit-1")
POLKIT_DEFAULT_CONFIG = """auth      sufficient pam_fprintd.so
auth      required pam_unix.so

account   required pam_unix.so
password  required pam_unix.so
session   required pam_unix.so
"""


def check_requirements() -> bool:
    """Check if required commands are available."""
    required_cmds = ["fprintd-enroll", "fprintd-verify", "fprintd-delete"]
    missing = [cmd for cmd in required_cmds if shutil.which(cmd) is None]

    if missing:
        typer.secho(
            f"Error: Missing required commands: {', '.join(missing)}",
            fg=typer.colors.RED,
            err=True,
        )
        typer.secho(
            "Install fprintd package: sudo pacman -S fprintd",
            fg=typer.colors.YELLOW,
            err=True,
        )
        return False
    return True


def write_privileged(content: str, target_path: Path) -> None:
    """Write content to a privileged file using sudo."""
    with tempfile.NamedTemporaryFile(mode="w", delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name
    try:
        subprocess.run(
            ["sudo", "cp", tmp_path, str(target_path)],
            check=True,
        )
    finally:
        Path(tmp_path).unlink()


@app.command()
def init():
    """Setup PAM configuration for fingerprint authentication."""
    if not check_requirements():
        raise typer.Exit(1)

    try:
        # Configure sudo
        if PAM_SUDO_PATH.exists():
            content = PAM_SUDO_PATH.read_text()
            if "pam_fprintd.so" not in content:
                typer.secho(
                    "Configuring sudo for fingerprint authentication...",
                    fg=typer.colors.YELLOW,
                )
                # Add fprintd line at the beginning
                write_privileged(PAM_FPRINTD_LINE + "\n" + content, PAM_SUDO_PATH)

        # Configure polkit
        if PAM_POLKIT_PATH.exists():
            content = PAM_POLKIT_PATH.read_text()
            if "pam_fprintd.so" not in content:
                typer.secho(
                    "Configuring polkit for fingerprint authentication...",
                    fg=typer.colors.YELLOW,
                )
                write_privileged(PAM_FPRINTD_LINE + "\n" + content, PAM_POLKIT_PATH)
        else:
            typer.secho(
                "Creating polkit configuration with fingerprint authentication...",
                fg=typer.colors.YELLOW,
            )
            write_privileged(POLKIT_DEFAULT_CONFIG, PAM_POLKIT_PATH)

        typer.secho("PAM configuration setup successfully!", fg=typer.colors.GREEN)
    except subprocess.CalledProcessError as e:
        typer.secho(
            f"Failed to setup PAM configuration: {e}", fg=typer.colors.RED, err=True
        )
        raise typer.Exit(1)
    except PermissionError as e:
        typer.secho(
            f"Permission denied reading PAM files: {e}", fg=typer.colors.RED, err=True
        )
        raise typer.Exit(1)


@app.command()
def add():
    """Add a new fingerprint for the current user."""
    if not check_requirements():
        raise typer.Exit(1)

    username = os.getlogin()

    typer.secho(
        "Enrolling fingerprint. Keep moving your finger on the sensor until complete.",
        fg=typer.colors.YELLOW,
    )

    try:
        result = subprocess.run(
            ["sudo", "fprintd-enroll", username],
            check=True,
        )

        if result.returncode == 0:
            typer.secho("Fingerprint enrolled successfully!", fg=typer.colors.GREEN)

            # Verify the fingerprint
            if typer.confirm(
                "\nWould you like to verify the fingerprint?", default=True
            ):
                typer.echo("\nPlace your finger on the sensor to verify...")
                verify_result = subprocess.run(["fprintd-verify"], check=False)

                if verify_result.returncode == 0:
                    typer.secho("Verification successful!", fg=typer.colors.GREEN)
                else:
                    typer.secho(
                        "Verification failed. You may want to try enrolling again.",
                        fg=typer.colors.RED,
                        err=True,
                    )
    except subprocess.CalledProcessError as e:
        typer.secho(f"Enrollment failed: {e}", fg=typer.colors.RED, err=True)
        raise typer.Exit(1)
    except KeyboardInterrupt:
        typer.secho("\nEnrollment cancelled.", fg=typer.colors.YELLOW)
        raise typer.Exit(1)


@app.command()
def remove(
    pam: bool = typer.Option(False, "--pam", help="Also remove PAM configuration"),
):
    """Remove all fingerprints for the current user."""
    if not check_requirements():
        raise typer.Exit(1)

    username = os.getlogin()

    if not typer.confirm(
        f"Are you sure you want to remove all fingerprints for user '{username}'?",
        default=False,
    ):
        typer.echo("Cancelled.")
        raise typer.Exit(0)

    try:
        subprocess.run(
            ["fprintd-delete", username],
            check=True,
        )
        typer.secho("All fingerprints removed successfully!", fg=typer.colors.GREEN)
    except subprocess.CalledProcessError as e:
        typer.secho(
            f"Failed to remove fingerprints: {e}", fg=typer.colors.RED, err=True
        )
        raise typer.Exit(1)

    # Remove PAM configuration if requested
    if pam:
        try:
            # Remove from sudo
            if PAM_SUDO_PATH.exists():
                content = PAM_SUDO_PATH.read_text()
                if "pam_fprintd.so" in content:
                    typer.secho(
                        "Removing fingerprint authentication from sudo...",
                        fg=typer.colors.YELLOW,
                    )
                    lines = [
                        line
                        for line in content.splitlines()
                        if "pam_fprintd.so" not in line
                    ]
                    write_privileged("\n".join(lines) + "\n", PAM_SUDO_PATH)

            # Remove from polkit
            if PAM_POLKIT_PATH.exists():
                content = PAM_POLKIT_PATH.read_text()
                if "pam_fprintd.so" in content:
                    typer.secho(
                        "Removing fingerprint authentication from polkit...",
                        fg=typer.colors.YELLOW,
                    )
                    lines = [
                        line
                        for line in content.splitlines()
                        if "pam_fprintd.so" not in line
                    ]
                    write_privileged("\n".join(lines) + "\n", PAM_POLKIT_PATH)

            typer.secho(
                "PAM configuration removed successfully!", fg=typer.colors.GREEN
            )
        except subprocess.CalledProcessError as e:
            typer.secho(
                f"Failed to remove PAM configuration: {e}",
                fg=typer.colors.RED,
                err=True,
            )
            raise typer.Exit(1)
        except PermissionError as e:
            typer.secho(
                f"Permission denied reading PAM files: {e}",
                fg=typer.colors.RED,
                err=True,
            )
            raise typer.Exit(1)


if __name__ == "__main__":
    app()
