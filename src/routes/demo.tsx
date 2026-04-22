import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { InitScreen } from "@/components/omnipoint/InitScreen";
import { StatusBar } from "@/components/omnipoint/StatusBar";
import { SensorPanel } from "@/components/omnipoint/SensorPanel";
import { TelemetryPanel } from "@/components/omnipoint/TelemetryPanel";
import { GestureEngine, defaultConfig, type EngineConfig } from "@/lib/omnipoint/GestureEngine";
import { HIDBridge } from "@/lib/omnipoint/HIDBridge";
import { TelemetryStore } from "@/lib/omnipoint/TelemetryStore";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Live Sensor — OmniPoint HCI" },
      { name: "description", content: "Run the OmniPoint gesture sensor in your browser. MediaPipe Hand Landmarker at 60 FPS." },
      { property: "og:title", content: "Live Sensor — OmniPoint HCI" },
      { property: "og:description", content: "60 FPS hand tracking demo. Pinch, drag, scroll." },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [status, setStatus] = useState("Awaiting operator input...");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfigState] = useState<EngineConfig>(defaultConfig);
  const [bridgeUrl, setBridgeUrl] = useState("ws://localhost:8765");

  const engineRef = useRef<GestureEngine | null>(null);
  const bridgeRef = useRef<HIDBridge | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const setConfig = useCallback((patch: Partial<EngineConfig>) => {
    setConfigState((prev) => {
      const next = { ...prev, ...patch };
      if (engineRef.current) engineRef.current.config = next;
      return next;
    });
  }, []);

  const initialize = useCallback(async () => {
    setError(null);
    setInitializing(true);
    setProgress(5);
    setStatus("Requesting camera access...");
    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices) {
        throw new Error("Camera API unavailable in this environment.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setProgress(25);

      const video = document.getElementById("omnipoint-video") as HTMLVideoElement | null;
      const canvas = document.getElementById("omnipoint-canvas") as HTMLCanvasElement | null;
      if (!video || !canvas) throw new Error("Sensor surface not mounted");
      video.srcObject = stream;
      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) return resolve();
        video.onloadedmetadata = () => resolve();
      });
      await video.play();
      setProgress(45);

      const bridge = new HIDBridge(bridgeUrl);
      bridgeRef.current = bridge;
      TelemetryStore.set({ bridgeUrl });
      bridge.connect();

      const engine = new GestureEngine(video, canvas, bridge, config);
      engineRef.current = engine;
      setStatus("Loading vision runtime...");
      setProgress(60);
      await engine.init((m) => {
        setStatus(m);
        setProgress((p) => Math.min(95, p + 12));
      });
      setProgress(100);
      setStatus("Sensor online.");
      engine.start();
      TelemetryStore.set({ initialized: true });
      setInitialized(true);
      setInitializing(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setInitializing(false);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [bridgeUrl, config]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.config = config;
  }, [config]);

  useEffect(() => {
    TelemetryStore.set({ bridgeUrl });
  }, [bridgeUrl]);

  useEffect(() => {
    return () => {
      engineRef.current?.stop();
      bridgeRef.current?.emergencyStop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleEmergencyToggle = useCallback(() => {
    const b = bridgeRef.current;
    if (!b) return;
    if (TelemetryStore.get().emergencyStop) {
      b.rearm();
    } else {
      b.emergencyStop();
    }
  }, []);

  const handleReconnect = useCallback(() => {
    if (!bridgeRef.current) return;
    bridgeRef.current.setUrl(bridgeUrl);
  }, [bridgeUrl]);

  const handleSetOrigin = useCallback(() => {
    engineRef.current?.setOrigin();
  }, []);

  const showInit = !initialized;

  return useMemo(
    () => (
      <main className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
        <h1 className="sr-only">OmniPoint HCI — Live Sensor</h1>
        {!showInit && <StatusBar onEmergencyToggle={handleEmergencyToggle} />}
        {!showInit && (
          <div className="absolute top-2 right-2 z-50">
            <Link
              to="/"
              className="font-mono text-[10px] tracking-[0.3em] px-3 h-8 inline-flex items-center border hairline text-muted-foreground hover:text-foreground bg-card/60 backdrop-blur"
            >
              ← HOME
            </Link>
          </div>
        )}
        <div className={`flex-1 min-h-0 ${showInit ? "hidden" : "flex"} gap-2 p-2`}>
          <div className="flex-1 min-w-0 flex flex-col">
            <SensorPanel onSetOrigin={handleSetOrigin} />
          </div>
          <TelemetryPanel
            config={config}
            setConfig={setConfig}
            bridgeUrl={bridgeUrl}
            setBridgeUrl={setBridgeUrl}
            onReconnect={handleReconnect}
          />
        </div>
        {showInit && (
          <div className="absolute opacity-0 pointer-events-none -z-10" aria-hidden>
            <video id="omnipoint-video" autoPlay playsInline muted />
            <canvas id="omnipoint-canvas" width={1280} height={720} />
          </div>
        )}
        {showInit && (
          <div className="flex-1 relative">
            <div className="absolute top-3 left-3 z-50">
              <Link
                to="/"
                className="font-mono text-[10px] tracking-[0.3em] px-3 h-8 inline-flex items-center border hairline text-muted-foreground hover:text-foreground bg-card/60 backdrop-blur"
              >
                ← HOME
              </Link>
            </div>
            <InitScreen
              status={status}
              progress={progress}
              error={error}
              onInitialize={initialize}
              initializing={initializing}
            />
          </div>
        )}
      </main>
    ),
    [showInit, status, progress, error, initialize, initializing, config, setConfig, bridgeUrl, handleEmergencyToggle, handleReconnect, handleSetOrigin],
  );
}