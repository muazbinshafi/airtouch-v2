<div align="center">

# 🖐️ OmniPoint HCI

### Touchless gesture control for your entire desktop.

**Wave your hand → the OS cursor moves.** No special hardware. No drivers. Just a webcam, a browser tab, and a tiny Linux daemon.

[**▶ Quickstart**](#-quickstart) · [**Full setup guide →**](./SETUP.md) · [**Architecture**](#-architecture) · [**Gestures**](#-gesture-library) · [**Roadmap**](#-roadmap)

![status](https://img.shields.io/badge/status-active-10b981?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-10b981?style=flat-square)
![stack](https://img.shields.io/badge/stack-React%2019%20%C2%B7%20TanStack%20Start-10b981?style=flat-square)
![vision](https://img.shields.io/badge/vision-MediaPipe%20GPU-10b981?style=flat-square)

</div>

---

## ✨ What is this?

OmniPoint is a **gesture-to-HID bridge**. It turns your webcam into a virtual mouse for your real operating system.

- 🎥 Your **browser** runs MediaPipe Hand Landmarker at **60 FPS** and recognizes gestures.
- 🌉 A **WebSocket message** describes what you did (pinch, drag, scroll).
- 🐧 A **Linux daemon** uses `uinput` to inject the matching mouse event into the kernel.

The result: you can pinch the air to click anything on screen — your file manager, your browser, your terminal, your games.

```
 ┌─────────────────────────┐         ┌──────────────────────────┐
 │  Browser (Chromium)     │   WS    │  Linux Bridge Daemon     │
 │  Webcam + MediaPipe     │ ──────► │  python-uinput (HID)     │
 │  Gesture engine + UI    │  JSON   │  Moves real OS cursor    │
 │                         │  :8765  │  Click / drag / scroll   │
 └─────────────────────────┘         └──────────────────────────┘
```

---

## 🚀 Quickstart

You need **two things running**: the web app (in your browser) and the bridge daemon (on Linux). The web app is enough on its own to see the gesture detection — the daemon is what makes it actually move your cursor.

> 📖 **Need step-by-step instructions, troubleshooting, and platform notes?**
> See **[SETUP.md](./SETUP.md)** — the full end-to-end install & run guide.

### 1 · Web app

```bash
# Install
bun install        # or: npm install

# Run dev server
bun dev            # or: npm run dev

# Open http://localhost:3000 → click "▶ LAUNCH DEMO" → grant camera access
```

### 2 · Linux bridge daemon (optional, for real cursor control)

```bash
cd bridge
sudo modprobe uinput
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 omnipoint_bridge.py
```

The status LED in the top bar of the web app turns **green** when it reaches the daemon at `ws://localhost:8765`.

> 💡 **Don't have Linux?** The web app still works — you'll see live hand tracking, gesture classification, and live telemetry. Only the OS-level cursor injection requires the daemon.

### 3 · Use it

| Gesture | Action |
|---|---|
| 👉 Index finger movement | Move cursor |
| 🤏 Pinch thumb + index | Left click |
| ✊ Sustained pinch | Drag |
| ✌️ Index + middle up/down | Scroll wheel |
| 🖐️ Open palm | Idle / release |
| 🛑 **EMERGENCY STOP** button | Instantly cut all input |

---

## 🎯 Gesture library

Each gesture is a small state machine with **hysteresis** and **debounce** — so a fluttering hand never spams clicks, and a steady pinch reliably starts a drag.

- **Pointer movement** — index fingertip drives the OS cursor with EMA smoothing on landmarks 4 & 8 and a velocity² acceleration curve. Configurable sensitivity, deadzone, and active zone.
- **Click** — pinch threshold + release threshold are separate. Configure both in the telemetry panel.
- **Drag** — a sustained pinch beyond a hold-time threshold transitions to drag. Releasing the pinch lifts.
- **Scroll** — index + middle extended together, vertical motion mapped to wheel ticks. Rate-limited at 120 Hz on the daemon.
- **Idle** — open palm releases all state.
- **Emergency stop** — kill switch wipes pending events and freezes outbound WS messages until rearmed.

---

## 🏗 Architecture

```
src/
 ├─ routes/
 │   ├─ index.tsx           Marketing landing page
 │   └─ demo.tsx            Live sensor demo
 ├─ components/omnipoint/
 │   ├─ InitScreen.tsx      Pre-launch screen (camera permission, errors)
 │   ├─ StatusBar.tsx       Top HUD: WS LED + emergency stop
 │   ├─ SensorPanel.tsx     <video>/<canvas> live preview
 │   └─ TelemetryPanel.tsx  Live FPS / latency / config sliders
 ├─ lib/omnipoint/
 │   ├─ GestureEngine.ts    MediaPipe Hand Landmarker + state machine
 │   ├─ HIDBridge.ts        Persistent WS, backoff, heartbeat, kill-switch
 │   └─ TelemetryStore.ts   Reactive store via useSyncExternalStore
 └─ hooks/
     └─ useTelemetry.ts     Subscribe to telemetry without re-rendering canvas

bridge/
 └─ omnipoint_bridge.py     Python daemon — kernel uinput (X11+Wayland)
                            with pynput fallback
```

### Why split this way?

| Concern | Lives in | Why |
|---|---|---|
| Hand vision | Browser | MediaPipe GPU delegate is fastest in WebGL. |
| Gesture state | Browser | Cheap, ~1 KB of state, easy to iterate. |
| OS event injection | Daemon | Needs `uinput` kernel module — only the OS can move the real cursor. |
| Telemetry | `useSyncExternalStore` | Live FPS updates **without** re-rendering the 60 FPS canvas loop. |

---

## ⚡ Performance targets

| Metric | Target |
|---|---|
| Frame rate | **60 FPS** at 1280 × 720 input |
| End-to-end latency | **< 16.6 ms** per frame |
| Vision delegate | GPU (MediaPipe Tasks) |
| Move event rate | 240 Hz (capped at daemon) |
| Scroll event rate | 120 Hz (capped at daemon) |
| Reconnect backoff | 250 ms → 8 s exponential |
| Heartbeat | 5 s |

---

## 🛠 Tech stack

- **React 19** + **TanStack Start v1** (file-based routing, SSR-ready)
- **Vite 7** + **TypeScript 5** strict mode
- **Tailwind CSS v4** with custom "Deep Space" design tokens (HSL)
- **MediaPipe Tasks Vision** for `HandLandmarker`
- **Python 3** + **python-uinput** + **pynput** for the bridge daemon
- Deployed on **Cloudflare Workers** (edge SSR)

---

## 🔧 Configuration

All gesture parameters are tunable live from the **Telemetry Panel** in the demo, or by editing `defaultConfig` in `src/lib/omnipoint/GestureEngine.ts`:

| Parameter | Default | Description |
|---|---|---|
| `sensitivity` | `1.4` | Pointer gain multiplier |
| `smoothing` | `0.55` | EMA factor on landmark positions |
| `pinchOn` | `0.045` | Distance threshold to fire click (normalized) |
| `pinchOff` | `0.065` | Distance threshold to release |
| `dragHoldMs` | `220` | How long to hold a pinch before it becomes a drag |
| `scrollGain` | `1500` | Wheel ticks per unit of vertical motion |
| `activeZone` | `0.7` | Center fraction of camera frame that maps to screen |

Bridge URL is configurable too (defaults to `ws://localhost:8765`).

---

## 🐧 Daemon setup (Linux)

The daemon needs access to `/dev/uinput`. For root-free operation:

```bash
# /etc/udev/rules.d/99-uinput.rules
KERNEL=="uinput", MODE="0660", GROUP="input"

sudo udevadm control --reload-rules
sudo usermod -aG input $USER
# log out & back in
```

To autostart on login, drop a `systemd --user` unit (template in `bridge/systemd/`).

---

## 🗺 Roadmap

- [ ] macOS bridge via CGEvent
- [ ] Windows bridge via SendInput
- [ ] Multi-hand support (gesture chords)
- [ ] Per-app gesture profiles
- [ ] Voice + gesture combos
- [ ] WebGPU vision delegate

---

## 🤝 Contributing

Issues and PRs welcome. Please:

1. Fork, branch from `main`
2. `npm install && npm run dev`
3. Keep the canvas loop allocation-free (no `new` inside `tick()`)
4. Run `npm run lint` before pushing
5. Open a PR with a short clip of the gesture in action

---

## 📜 License

MIT — do whatever you want, just don't blame us if the cursor pinches itself.

---

<div align="center">

**Built with hands. Literally.**

</div>