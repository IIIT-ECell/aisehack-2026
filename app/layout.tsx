import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Using Outfit for modern/tech feel
import "./globals.css";

// Using modern fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "AISEHack 2026 | National Climate AI Hackathon",
  description: "Building AI for Climate, Sustainability and Impact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="bg-black antialiased font-sans">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

// Client component for Lenis to avoid Server Component issues
import { ReactLenis } from "lenis/react";

function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
