import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OmniPoint HCI — Touchless Gesture Control" },
      { name: "description", content: "Control your Linux desktop with hand gestures. Real-time MediaPipe vision pipeline with a WebSocket HID bridge." },
      { name: "author", content: "OmniPoint" },
      { property: "og:title", content: "OmniPoint HCI — Touchless Gesture Control" },
      { property: "og:description", content: "Control your Linux desktop with hand gestures. Real-time MediaPipe vision pipeline with a WebSocket HID bridge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "OmniPoint HCI — Touchless Gesture Control" },
      { name: "twitter:description", content: "Control your Linux desktop with hand gestures. Real-time MediaPipe vision pipeline with a WebSocket HID bridge." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f027eabb-33d3-4a18-b988-892ce74b1d59/id-preview-6be67c6a--89055588-3e18-4819-a809-a224cb4f604c.lovable.app-1776843184953.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f027eabb-33d3-4a18-b988-892ce74b1d59/id-preview-6be67c6a--89055588-3e18-4819-a809-a224cb4f604c.lovable.app-1776843184953.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
