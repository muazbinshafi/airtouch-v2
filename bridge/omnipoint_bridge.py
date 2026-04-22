#!/usr/bin/env python3
"""
OmniPoint Bridge Daemon
-----------------------
Receives gesture packets from the OmniPoint web app over a local WebSocket
and translates them into real OS-level mouse / keyboard events using
python-uinput (kernel-level, works under both X11 and Wayland).

Packet format (JSON):
  { "type": "move",   "x": 0.0-1.0, "y": 0.0-1.0 }
  { "type": "click",  "button": "left" | "right" }
  { "type": "down",   "button": "left" }
  { "type": "up",     "button": "left" }
  { "type": "scroll", "dx": int, "dy": int }
  { "type": "ping" }                           -> replies { "type": "pong" }

Run:
  sudo modprobe uinput
  python3 omnipoint_bridge.py --host 127.0.0.1 --port 8765
"""
from __future__ import annotations

import argparse
import asyncio
import json
import logging
import sys
from typing import Any

try:
    import websockets
except ImportError:
    sys.exit("Missing dependency: pip install websockets")

try:
    from pynput.mouse import Controller, Button
except ImportError:
    sys.exit("Missing dependency: pip install pynput")

log = logging.getLogger("omnipoint-bridge")
mouse = Controller()


def screen_size() -> tuple[int, int]:
    """Best-effort screen size detection (X11/Wayland)."""
    try:
        from screeninfo import get_monitors
        m = get_monitors()[0]
        return m.width, m.height
    except Exception:
        return 1920, 1080


SCREEN_W, SCREEN_H = screen_size()
log.info("Screen size: %dx%d", SCREEN_W, SCREEN_H)


def handle_packet(pkt: dict[str, Any]) -> dict[str, Any] | None:
    # Accept both schemas:
    #   1. {"type": "...", ...}                       (native daemon protocol)
    #   2. {"event": "...", "data": {...}}            (web app MotionPayload)
    t = pkt.get("type") or pkt.get("event")
    data = pkt.get("data") if isinstance(pkt.get("data"), dict) else pkt

    if t == "ping":
        return {"type": "pong"}
    if t == "heartbeat":
        return None
    if t in ("move", "motion"):
        x = max(0.0, min(1.0, float(data.get("x", 0))))
        y = max(0.0, min(1.0, float(data.get("y", 0))))
        mouse.position = (int(x * SCREEN_W), int(y * SCREEN_H))
        # Map gesture-driven press/release if the web app included one.
        gesture = data.get("gesture")
        if gesture == "pinch":
            mouse.press(Button.left)
        elif gesture in ("release", "open", "idle"):
            mouse.release(Button.left)
    elif t == "click":
        btn = Button.right if data.get("button") == "right" else Button.left
        mouse.click(btn, 1)
    elif t == "down":
        mouse.press(Button.left)
    elif t == "up":
        mouse.release(Button.left)
    elif t == "scroll":
        mouse.scroll(int(data.get("dx", 0)), int(data.get("dy", 0)))
    else:
        log.warning("Unknown packet type: %s", t)
    return None


async def session(ws):
    peer = ws.remote_address
    log.info("Client connected: %s", peer)
    try:
        async for raw in ws:
            try:
                pkt = json.loads(raw)
            except json.JSONDecodeError:
                log.warning("Bad JSON from %s", peer)
                continue
            reply = handle_packet(pkt)
            if reply is not None:
                await ws.send(json.dumps(reply))
    except websockets.ConnectionClosed:
        pass
    finally:
        log.info("Client disconnected: %s", peer)


async def main_async(host: str, port: int) -> None:
    log.info("OmniPoint bridge listening on ws://%s:%d", host, port)
    async with websockets.serve(session, host, port):
        await asyncio.Future()  # run forever


def main() -> None:
    p = argparse.ArgumentParser(description="OmniPoint local HID bridge")
    p.add_argument("--host", default="127.0.0.1")
    p.add_argument("--port", type=int, default=8765)
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )
    try:
        asyncio.run(main_async(args.host, args.port))
    except KeyboardInterrupt:
        log.info("Shutting down.")


if __name__ == "__main__":
    main()