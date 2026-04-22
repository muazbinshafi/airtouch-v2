import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OmniPoint HCI — Touchless Gesture Control" },
      {
        name: "description",
        content:
          "Control your Linux PC with hand gestures. 60 FPS MediaPipe vision + uinput HID bridge. Open source.",
      },
      { property: "og:title", content: "OmniPoint HCI — Touchless Gesture Control" },
      {
        property: "og:description",
        content: "Hand gestures → real OS cursor. MediaPipe + Linux uinput bridge.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground scan-grid">
      <Header />
      <Hero />
      <Specs />
      <Gestures />
      <Architecture />
      <Quickstart />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b hairline bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 sm:px-6 h-14">
        <Link to="/" className="flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-primary led anim-pulse-soft" />
          <span className="text-emerald-glow text-[11px] tracking-[0.4em]">OMNIPOINT</span>
          <span className="text-muted-foreground text-[11px] tracking-[0.3em]">// HCI</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 font-mono text-[11px] tracking-[0.25em] text-muted-foreground">
          <a href="#gestures" className="hover:text-foreground transition-colors">GESTURES</a>
          <a href="#architecture" className="hover:text-foreground transition-colors">ARCH</a>
          <a href="#quickstart" className="hover:text-foreground transition-colors">QUICKSTART</a>
          <a href="https://github.com/muazbinshafi/airtouch" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GITHUB</a>
        </nav>
        <Link
          to="/demo"
          className="font-mono text-[11px] tracking-[0.3em] px-3 h-9 inline-flex items-center border border-primary text-primary hover:bg-primary/10 transition-colors"
        >
          ▶ LAUNCH DEMO
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-24">
        <div className="font-mono text-[10px] tracking-[0.5em] text-primary mb-5">
          ENTERPRISE TOUCHLESS INTERFACE · v1.0
        </div>
        <h1 className="font-mono text-4xl sm:text-6xl md:text-7xl tracking-tight text-foreground leading-[1.05] max-w-4xl">
          Control your <span className="text-emerald-glow">entire desktop</span> with a wave of your hand.
        </h1>
        <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          OmniPoint is a gesture-to-HID bridge. The browser tracks your hand at 60 FPS with
          MediaPipe; a tiny Linux daemon injects real mouse events into your OS — desktop,
          browsers, terminals, games. Everything.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/demo"
            className="font-mono text-xs tracking-[0.35em] h-12 px-6 inline-flex items-center border border-primary bg-primary/10 text-primary hover:bg-primary/20 led transition-colors"
            style={{ boxShadow: "0 0 18px hsl(var(--primary) / 0.4)" }}
          >
            ▶ INITIALIZE SENSOR
          </Link>
          <a
            href="#quickstart"
            className="font-mono text-xs tracking-[0.35em] h-12 px-6 inline-flex items-center border hairline text-foreground hover:bg-card transition-colors"
          >
            ⌘ INSTALL BRIDGE
          </a>
        </div>

        <div className="mt-16 panel p-1 max-w-3xl glow-emerald">
          <div className="border-b hairline px-3 h-9 flex items-center justify-between">
            <div className="font-mono text-[10px] tracking-[0.3em] text-emerald-glow">SENSOR // PREVIEW</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
          </div>
          <div className="relative aspect-video bg-black scan-grid overflow-hidden anim-scanline">
            <HandGlyph />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
              <span>FPS <span className="text-emerald-glow">60.0</span></span>
              <span>LAT <span className="text-emerald-glow">12 ms</span></span>
              <span>GST <span className="text-emerald-glow">PINCH</span></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HandGlyph() {
  // Decorative landmark visualization
  const dots: Array<[number, number]> = [
    [50, 78], [44, 70], [40, 60], [38, 50], [37, 42],
    [50, 60], [50, 46], [50, 36], [50, 28],
    [56, 60], [58, 46], [58, 36], [58, 28],
    [62, 62], [64, 50], [65, 42], [65, 34],
    [68, 64], [71, 56], [73, 50], [74, 44],
  ];
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
      {dots.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="0.9" fill="hsl(var(--primary))" />
          <circle cx={x} cy={y} r="2.4" fill="hsl(var(--primary) / 0.18)" />
        </g>
      ))}
      <line x1="37" y1="42" x2="50" y2="60" stroke="hsl(var(--primary) / 0.6)" strokeWidth="0.5" />
      <line x1="50" y1="28" x2="50" y2="60" stroke="hsl(var(--primary) / 0.6)" strokeWidth="0.5" />
      <line x1="58" y1="28" x2="50" y2="60" stroke="hsl(var(--primary) / 0.6)" strokeWidth="0.5" />
      <line x1="65" y1="34" x2="50" y2="60" stroke="hsl(var(--primary) / 0.6)" strokeWidth="0.5" />
      <line x1="74" y1="44" x2="50" y2="60" stroke="hsl(var(--primary) / 0.6)" strokeWidth="0.5" />
      {/* pinch indicator */}
      <circle cx="37" cy="42" r="6" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.4" className="anim-pulse-soft" />
      <circle cx="50" cy="28" r="6" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.4" className="anim-pulse-soft" />
    </svg>
  );
}

function Specs() {
  const specs = [
    { k: "VISION", v: "MediaPipe GPU" },
    { k: "TARGET", v: "60 FPS @ 720p" },
    { k: "BRIDGE", v: "ws://:8765" },
    { k: "MODEL", v: "Hand Landmarker" },
    { k: "LATENCY", v: "< 16.6 ms" },
    { k: "PROTOCOL", v: "JSON over WS" },
    { k: "DAEMON", v: "Python + uinput" },
    { k: "PLATFORM", v: "Linux X11/Wayland" },
  ];
  return (
    <section className="border-y hairline bg-card/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
        {specs.map((s) => (
          <div key={s.k} className="font-mono">
            <div className="text-[10px] tracking-[0.3em] text-muted-foreground">{s.k}</div>
            <div className="text-sm tracking-[0.15em] text-foreground mt-1">{s.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Gestures() {
  const items = [
    { g: "INDEX MOVE", a: "Move cursor", d: "Index fingertip drives the OS pointer with EMA smoothing and velocity² acceleration." },
    { g: "PINCH", a: "Left click", d: "Bring thumb + index together. Hysteresis + debounce prevents accidental fires." },
    { g: "SUSTAINED PINCH", a: "Drag", d: "Hold the pinch to grab and move windows, files, or selections." },
    { g: "TWO-FINGER UP/DOWN", a: "Scroll", d: "Index + middle vertical motion is mapped to the system scroll wheel." },
    { g: "OPEN PALM", a: "Idle", d: "Releases all input and parks the cursor. Safe default state." },
    { g: "EMERGENCY STOP", a: "Kill switch", d: "Instant teardown — no further events leave the browser until rearmed." },
  ];
  return (
    <section id="gestures" className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
      <SectionHead eyebrow="GESTURE LIBRARY" title="Six gestures. Full desktop control." />
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
        {items.map((i) => (
          <div key={i.g} className="bg-background p-6 hover:bg-card transition-colors">
            <div className="font-mono text-[10px] tracking-[0.3em] text-emerald-glow">{i.g}</div>
            <div className="font-mono text-xl text-foreground mt-2 tracking-wider">{i.a}</div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{i.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Architecture() {
  return (
    <section id="architecture" className="border-t hairline bg-card/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
        <SectionHead eyebrow="ARCHITECTURE" title="Browser sees. Daemon acts." />
        <div className="mt-12 grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
          <ArchBox
            title="Browser (Chromium)"
            lines={["Webcam + MediaPipe", "Gesture engine + UI", "60 FPS canvas loop"]}
          />
          <div className="hidden lg:flex flex-col items-center justify-center font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
            <div className="text-emerald-glow">WS</div>
            <div className="my-2 h-px w-24 bg-primary/60" />
            <div>JSON</div>
            <div className="mt-2">:8765</div>
          </div>
          <ArchBox
            title="Linux Bridge Daemon"
            lines={["python-uinput (HID)", "Moves real OS cursor", "Click / drag / scroll"]}
          />
        </div>
        <div className="mt-12 grid sm:grid-cols-3 gap-6 font-mono text-[11px]">
          <FilePill path="src/lib/omnipoint/GestureEngine.ts" note="Vision + state machine" />
          <FilePill path="src/lib/omnipoint/HIDBridge.ts" note="WS + heartbeat + kill-switch" />
          <FilePill path="bridge/omnipoint_bridge.py" note="uinput daemon (X11+Wayland)" />
        </div>
      </div>
    </section>
  );
}

function ArchBox({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="panel p-6">
      <div className="font-mono text-[10px] tracking-[0.3em] text-emerald-glow mb-3">{title.toUpperCase()}</div>
      <ul className="font-mono text-sm text-foreground space-y-2 tracking-wide">
        {lines.map((l) => (
          <li key={l} className="flex items-start gap-2">
            <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilePill({ path, note }: { path: string; note: string }) {
  return (
    <div className="panel p-4">
      <div className="text-emerald-glow break-all">{path}</div>
      <div className="text-muted-foreground mt-1 tracking-[0.2em] text-[10px]">{note}</div>
    </div>
  );
}

function Quickstart() {
  return (
    <section id="quickstart" className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
      <SectionHead eyebrow="QUICKSTART" title="Up and running in 60 seconds." />
      <div className="mt-12 grid lg:grid-cols-2 gap-6">
        <CodeBlock
          step="01"
          title="Run the Linux bridge daemon"
          code={`cd bridge
sudo modprobe uinput
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 omnipoint_bridge.py`}
        />
        <CodeBlock
          step="02"
          title="Open the web app"
          code={`# In Chromium, visit your deployment URL
# or run locally:
npm install
npm run dev

# Click "INITIALIZE SENSOR" and grant camera access`}
        />
      </div>
      <p className="mt-6 font-mono text-[11px] text-muted-foreground tracking-wide max-w-3xl">
        The browser-only demo works without the daemon — you can preview gesture detection in the
        <Link to="/demo" className="text-emerald-glow ml-1">live sensor view</Link>. The daemon is only required
        for system-wide cursor control on Linux.
      </p>
    </section>
  );
}

function CodeBlock({ step, title, code }: { step: string; title: string; code: string }) {
  return (
    <div className="panel">
      <div className="border-b hairline px-4 h-10 flex items-center justify-between">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.3em]">
          <span className="text-emerald-glow">{step}</span>
          <span className="text-foreground">{title.toUpperCase()}</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground tracking-[0.3em]">SH</span>
      </div>
      <pre className="p-4 font-mono text-[12px] text-foreground/90 overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-[0.5em] text-primary">{eyebrow}</div>
      <h2 className="mt-3 font-mono text-3xl sm:text-4xl text-foreground tracking-tight max-w-2xl">
        {title}
      </h2>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t hairline">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary led" />
          OMNIPOINT HCI · OPEN SOURCE
        </div>
        <div className="flex items-center gap-5">
          <a href="https://github.com/muazbinshafi/airtouch" target="_blank" rel="noreferrer" className="hover:text-foreground">GITHUB</a>
          <Link to="/demo" className="hover:text-foreground">DEMO</Link>
          <a href="#quickstart" className="hover:text-foreground">DOCS</a>
        </div>
      </div>
    </footer>
  );
}
