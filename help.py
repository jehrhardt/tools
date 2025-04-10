# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///

import os
import pathlib


def main() -> None:
    print("\033[32mVibes from a Cozy Craft Coder")
    print("=============================\033[0m")
    print("\nAvailable commands:")
    print("  uv run help.py         - Show this help information")
    
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


if __name__ == "__main__":
    main()
