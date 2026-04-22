# 🛠 OmniPoint — Complete Setup & Run Guide

This guide walks you end-to-end: from a clean machine to your hand actually
moving the OS cursor. Follow it top to bottom.

**TL;DR**

1. `bun install && bun dev` → open `http://localhost:3000`
2. (Linux only, optional) `cd bridge && python3 omnipoint_bridge.py`
3. Click **▶ LAUNCH DEMO**, allow camera, press **TEST BRIDGE**.

---

## 0 · What you'll end up with

- A **web app** running locally that uses your webcam + MediaPipe to detect
  hand gestures in real time.
- An **optional Python daemon** that listens on `ws://127.0.0.1:8765` and
  injects real OS mouse events (click, move, scroll) when the web app sends
  validated gesture packets.

The web app works **without** the daemon — you'll see live hand tracking,
landmarks, and telemetry. You only need the daemon if you want to actually
control your real cursor.

---

## 1 · Prerequisites

| Requirement | Why | How to check |
|---|---|---|
| **Node 20+** or **Bun 1.1+** | Runs the web app | `node -v` / `bun -v` |
| **Modern browser** (Chrome / Edge / Brave) | MediaPipe GPU + WebSocket | — |
| **A webcam** | Vision input | — |
| **Python 3.10+** *(daemon only)* | Runs the bridge | `python3 --version` |
| **Linux with `uinput`** *(daemon only)* | Inject HID events | `lsmod \| grep uinput` |
| **HTTPS or localhost** | `getUserMedia` requires it | localhost is fine |

macOS and Windows can run the web app fine. The bridge daemon is
Linux-first (uinput); macOS/Windows fall back to `pynput` and need
Accessibility / admin permissions.

---

## 2 · Get the code

```bash
git clone https://github.com/<your-org>/omnipoint.git
cd omnipoint
```

---

## 3 · Run the web app

### Install

```bash
bun install
# or
npm install
```

### Start dev server

```bash
bun dev
# or
npm run dev
```

Open **`http://localhost:3000`**. You should see the landing page.

### Try the demo

1. Click **▶ LAUNCH DEMO** (top right or hero CTA) — you'll land on `/demo`.
2. Click **INITIALIZE** on the InitScreen.
3. Your browser will prompt for **camera permission** → **Allow**.
4. You should now see your webcam preview with hand landmarks drawn over it,
   and live FPS / latency / pinch distance in the Telemetry panel.

If the camera doesn't appear, see [Troubleshooting](#7-troubleshooting).

### Production build (optional)

```bash
bun run build
bun run start
```

---

## 4 · Run the bridge daemon (Linux)

The daemon is what makes your real cursor move. Without it the demo is
visualization-only.

### Install dependencies

```bash
cd bridge
sudo modprobe uinput                # load kernel module
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Start it

```bash
python3 omnipoint_bridge.py --host 127.0.0.1 --port 8765
```

You should see:

```
[omnipoint] listening on ws://127.0.0.1:8765
```

### Grant `/dev/uinput` access without sudo (recommended)

```bash
echo 'KERNEL=="uinput", MODE="0660", GROUP="input"' \
  | sudo tee /etc/udev/rules.d/99-uinput.rules
sudo udevadm control --reload-rules
sudo usermod -aG input $USER
# log out and back in
```

### Autostart on login (systemd --user)

```bash
mkdir -p ~/.config/systemd/user
cp bridge/systemd/omnipoint-bridge.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now omnipoint-bridge
```

### macOS / Windows

The Python daemon also runs there using `pynput`:

- **macOS**: System Settings → Privacy & Security → **Accessibility** → add
  your Terminal (or iTerm). Without this, mouse events are silently dropped.
- **Windows**: Run the terminal as Administrator the first time.

---

## 5 · Connect the web app to the daemon

1. In the demo, open the **Telemetry panel** (right side).
2. Confirm **Bridge URL** is `ws://127.0.0.1:8765` (default).
3. Click **TEST BRIDGE**.
4. The status LED turns **green** and shows RTT in ms when validated.

**Safety gate**: gesture packets are **only** sent after a successful
`TEST BRIDGE` validation. If you change the Bridge URL, you must re-test.

---

## 6 · Use the gestures

| Gesture | Action |
|---|---|
| 👉 Point with index finger | Move cursor |
| 🤏 Pinch thumb + index | Left click |
| ✊ Hold pinch (>220 ms) | Drag |
| ✌️ Index + middle, swipe up/down | Scroll |
| 🖐️ Open palm | Idle / release |
| 🛑 **EMERGENCY STOP** (top bar) | Cuts all input instantly |

Tune sensitivity, pinch thresholds, smoothing, and active zone live from the
Telemetry panel.

---

## 7 · Troubleshooting

**Camera prompt never appears**
- You're not on `localhost` or `https://`. `getUserMedia` requires a secure
  context. Use `http://localhost:3000`, not your LAN IP.
- Browser blocked the site. Click the camera icon in the address bar →
  Always allow.

**Black video / "Camera failed"**
- Another app (Zoom, OBS) is holding the device. Close it.
- On Linux, check `v4l2-ctl --list-devices`.

**`TEST BRIDGE` stays red**
- Daemon isn't running. In another terminal: `cd bridge && python3 omnipoint_bridge.py`.
- Wrong port. Default is `8765`.
- Firewall blocking localhost (rare). Try `curl -v http://127.0.0.1:8765`.

**Cursor doesn't move even though LED is green**
- Linux: `/dev/uinput` permission denied. Re-check the udev rule in §4 and
  log out/in.
- macOS: Terminal lacks Accessibility permission.
- Windows: Run as Administrator once.

**Cursor is jittery**
- Increase **Smoothing** in the Telemetry panel (try `0.7`).
- Lower **Sensitivity** to ~`1.0`.
- Make sure the room is well-lit; MediaPipe loses precision in low light.

**FPS is low (<30)**
- Disable other GPU-heavy tabs.
- Make sure WebGL is enabled (`chrome://gpu` → Hardware acceleration ON).

---

## 8 · Project layout (cheat sheet)

```
src/
  routes/index.tsx        landing page
  routes/demo.tsx         live demo (camera + gestures + bridge)
  components/omnipoint/   UI panels (Init, Status, Sensor, Telemetry)
  lib/omnipoint/          GestureEngine, HIDBridge, TelemetryStore
  hooks/useTelemetry.ts   reactive subscription to telemetry

bridge/
  omnipoint_bridge.py     Python WS → uinput / pynput daemon
  requirements.txt        Python deps
  systemd/                user-level service unit
```

---

## 9 · Uninstall

```bash
# stop autostart (if installed)
systemctl --user disable --now omnipoint-bridge
rm ~/.config/systemd/user/omnipoint-bridge.service

# remove repo
rm -rf omnipoint
```

---

Made with 🖐️. If a step here is unclear, open an issue — clarity beats
cleverness.