import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Using Outfit for modern/tech feel
import "./globals.css";

// Using modern fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "AISEHack | ANRF's AI for Science & Engineering Hackathon — Polymers & Space",
  description:
    "AISEHack 2nd Edition — India's premier research hackathon at the intersection of AI, Science and Engineering. Polymer property prediction & Remote Sensing. Organised by ANRF, in coordination with Galaxeye and IIT Madras.",
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
