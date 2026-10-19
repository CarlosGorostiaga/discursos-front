import type { Metadata, Viewport } from "next";
import "@fontsource-variable/noto-sans";
import "@fontsource-variable/noto-serif";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discursos públicos · Sanse Centro",
  description:
    "Calendario de discursos públicos de la congregación San Sebastián de los Reyes Centro",
};

export const viewport: Viewport = {
  themeColor: "#2b3a67",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
