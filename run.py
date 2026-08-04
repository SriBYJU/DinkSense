#!/usr/bin/env python3
"""Launch DinkSense on the first available local port and open a browser."""
from __future__ import annotations

import contextlib
import http.server
import os
import socket
import socketserver
import threading
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def available_port(start: int = 8080, end: int = 8099) -> int:
    for port in range(start, end + 1):
        with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
            try:
                sock.bind(("127.0.0.1", port))
            except OSError:
                continue
            return port
    raise RuntimeError("No open port found between 8080 and 8099.")


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        print(f"[DinkSense] {format % args}")


def main() -> None:
    os.chdir(ROOT)
    port = available_port()
    url = f"http://127.0.0.1:{port}/index.html#dashboard"
    with socketserver.ThreadingTCPServer(("127.0.0.1", port), QuietHandler) as server:
        server.daemon_threads = True
        print("\nDinkSense is running locally.")
        print(f"Open: {url}")
        print("Keep this window open while using the app. Press Ctrl+C to stop.\n")
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nDinkSense stopped.")


if __name__ == "__main__":
    main()
