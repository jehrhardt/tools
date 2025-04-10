# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///

import os
import pathlib
import sys
import importlib


def show_default_help() -> None:
    print("\033[32mVibes from a Cozy Craft Coder")
    print("=============================\033[0m")
    print("\nAvailable commands:")
    print("  uv run help.py         - Show this help information")
    print("  uv run help.py MODULE  - Show help for a specific module")

    # Print information about the directory structure
    current_dir = pathlib.Path(".").absolute()
    print(f"\nCurrent directory: {current_dir}")
    print("\nDirectory contents:")

    # List Python files
    python_files = [f for f in os.listdir(".") if f.endswith(".py")]
    if python_files:
        print("\nPython files:")
        for file in sorted(python_files):
            print(f"  - {file}")

    # List directories
    dirs = [d for d in os.listdir(".") if os.path.isdir(d) and not d.startswith(".")]
    if dirs:
        print("\nSubdirectories:")
        for directory in sorted(dirs):
            print(f"  - {directory}/")


def show_module_help(module_name: str) -> bool:
    """Show help for a specific module.

    Returns True if help was displayed, False otherwise.
    """
    try:
        # Try to import the module
        module = importlib.import_module(module_name)

        # Check if the module has a help function
        if hasattr(module, "help") and callable(module.help):
            title, content = module.help()

            # Display the help information
            print(f"\033[32m{title}")
            print("=" * len(title) + "\033[0m")
            print(f"\n{content}")
            return True
        else:
            print(f"Module '{module_name}' does not provide help information.")
            return False
    except ImportError:
        print(f"Module '{module_name}' not found.")
        return False


def main() -> None:
    # Check if a module name was provided
    if len(sys.argv) > 1:
        module_name = sys.argv[1]
        if not show_module_help(module_name):
            # If module help fails, show default help
            show_default_help()
    else:
        show_default_help()


if __name__ == "__main__":
    main()
