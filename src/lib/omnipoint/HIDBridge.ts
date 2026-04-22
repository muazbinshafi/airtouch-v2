// HID Bridge - persistent WebSocket with exponential backoff & heartbeat.
// Sends OmniPoint payload schema to local Linux daemon (ws://localhost:8765).

import { TelemetryStore, type GestureKind } from "./TelemetryStore";

export interface MotionPayload {
  event: "motion";
  data: {
    x: number;
    y: number;
    pressure: number;
    gesture: GestureKind;
  };
  timestamp: number;
}

export class HIDBridge {
  private ws: WebSocket | null = null;
  private url: string;
  private backoff = 250;
  private readonly backoffMax = 8000;
  private heartbeatTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private packetCounter = 0;
  private packetWindowStart = performance.now();
  private stopped = false;
  private offlineLog: MotionPayload[] = [];
  private readonly logCap = 200;

  constructor(url: string) {
    this.url = url;
  }

  setUrl(url: string) {
    this.url = url;
    this.reconnect();
  }

  emergencyStop() {
    this.stopped = true;
    TelemetryStore.set({ wsState: "stopped", emergencyStop: true });
    if (this.heartbeatTimer) window.clearInterval(this.heartbeatTimer);
    if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
    try {
      this.ws?.close(1000, "emergency_stop");
    } catch {
      /* noop */
    }
    this.ws = null;
  }

  rearm() {
    this.stopped = false;
    TelemetryStore.set({ emergencyStop: false });
    this.connect();
  }

  connect() {
    if (this.stopped) return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    TelemetryStore.set({ wsState: "connecting" });
    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws.onopen = () => {
      this.backoff = 250;
      TelemetryStore.set({ wsState: "connected" });
      if (this.heartbeatTimer) window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = window.setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ event: "heartbeat", timestamp: Date.now() }));
        }
      }, 5000);
    };
    this.ws.onclose = () => {
      TelemetryStore.set({ wsState: "disconnected" });
      if (this.heartbeatTimer) window.clearInterval(this.heartbeatTimer);
      this.scheduleReconnect();
    };
    this.ws.onerror = () => {
      try {
        this.ws?.close();
      } catch {
        /* noop */
      }
    };
  }

  reconnect() {
    try {
      this.ws?.close();
    } catch {
      /* noop */
    }
    this.ws = null;
    this.connect();
  }

  private scheduleReconnect() {
    if (this.stopped) return;
    if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = window.setTimeout(() => this.connect(), this.backoff);
    this.backoff = Math.min(this.backoffMax, this.backoff * 2);
  }

  send(payload: MotionPayload) {
    if (this.stopped) return;
    // Gate HID emission until the bridge has been validated by the operator.
    if (!TelemetryStore.get().bridgeValidated) return;
    // Track packets/sec regardless of connection state
    this.packetCounter += 1;
    const now = performance.now();
    if (now - this.packetWindowStart >= 1000) {
      TelemetryStore.set({ packetsPerSec: this.packetCounter });
      this.packetCounter = 0;
      this.packetWindowStart = now;
    }
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(payload));
      } catch {
        /* noop */
      }
    } else {
      this.offlineLog.push(payload);
      if (this.offlineLog.length > this.logCap) this.offlineLog.shift();
    }
  }

  getOfflineLog() {
    return this.offlineLog;
  }

  /**
   * Probe the configured WebSocket endpoint to confirm the local HID bridge
   * is reachable. Resolves with a status the UI can present to the operator.
   * Times out after `timeoutMs` to avoid hanging the UX on dead endpoints.
   */
  async probe(timeoutMs = 2500): Promise<{ ok: boolean; rttMs: number; message: string }> {
    const url = this.url;
    TelemetryStore.set({
      bridgeProbe: "probing",
      bridgeProbeMsg: `Probing ${url}…`,
    });
    const start = performance.now();
    return await new Promise((resolve) => {
      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Invalid URL";
        TelemetryStore.set({
          bridgeProbe: "failed",
          bridgeValidated: false,
          bridgeProbeMsg: message,
        });
        resolve({ ok: false, rttMs: 0, message });
        return;
      }
      const finish = (ok: boolean, message: string) => {
        window.clearTimeout(timer);
        const rttMs = Math.round(performance.now() - start);
        try { ws.close(); } catch { /* noop */ }
        TelemetryStore.set({
          bridgeProbe: ok ? "ok" : "failed",
          bridgeValidated: ok,
          bridgeProbeMsg: message,
          bridgeProbeRttMs: rttMs,
        });
        resolve({ ok, rttMs, message });
      };
      const timer = window.setTimeout(
        () => finish(false, `No response in ${timeoutMs}ms — is the bridge running?`),
        timeoutMs,
      );
      ws.onopen = () => {
        try {
          ws.send(JSON.stringify({ event: "ping", timestamp: Date.now() }));
        } catch { /* noop */ }
        // Treat a successful open as a valid bridge; pong is best-effort.
        finish(true, "Bridge reachable");
      };
      ws.onerror = () => finish(false, "Connection refused");
      ws.onclose = (ev) => {
        if (ev.code !== 1000) finish(false, `Closed (${ev.code})`);
      };
    });
  }

  invalidate() {
    TelemetryStore.set({
      bridgeProbe: "idle",
      bridgeValidated: false,
      bridgeProbeMsg: "Not tested",
      bridgeProbeRttMs: 0,
    });
  }
}
