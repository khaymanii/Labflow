// @ts-expect-error Next.js processes global CSS imports at build time.
import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "LabFlow — Laboratory Workflow Tracking",
    template: "%s · LabFlow",
  },
  description:
    "Track laboratory samples and results from registration through dispatch and collection.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
