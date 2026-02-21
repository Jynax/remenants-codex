#!/usr/bin/env python3
"""Launch a local static server for the REMNANTS prototype and open it in a browser."""

from __future__ import annotations

import argparse
import functools
import http.server
import socketserver
import threading
import time
import webbrowser
from pathlib import Path


DEFAULT_PORT = 4173


def run_server(port: int, directory: Path) -> None:
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(directory))
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"Serving REMNANTS on http://localhost:{port}")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Start a local server and open the REMNANTS prototype in your browser."
    )
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"Port to use (default: {DEFAULT_PORT})")
    parser.add_argument(
        "--no-open",
        action="store_true",
        help="Start the server but do not auto-open a browser tab.",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent
    index_file = repo_root / "index.html"
    if not index_file.exists():
        raise FileNotFoundError(f"Could not find {index_file}")

    url = f"http://localhost:{args.port}/index.html"
    if not args.no_open:
        threading.Thread(target=lambda: (time.sleep(0.35), webbrowser.open(url)), daemon=True).start()

    run_server(args.port, repo_root)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
