"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/sections/v2/Hero";
import About from "@/components/sections/v2/About";
import Timeline from "@/components/sections/v2/Timeline";
import Tracks from "@/components/sections/v2/Tracks";
import Rules from "@/components/sections/v2/Rules";
import FAQ from "@/components/sections/v2/FAQ";
import Footer from "@/components/sections/v2/Footer";
import PrizePool from "@/components/sections/PrizePool";
import FloatingNav from "@/components/ui/FloatingNav";
import FloatingSocials from "@/components/ui/FloatingSocials";
import Scene from "@/components/canvas/Scene";
import SpaceField from "@/components/canvas/v2/SpaceField";
import HeroSceneV2 from "@/components/canvas/v2/HeroSceneV2";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-black text-white selection:bg-primary selection:text-black noise-overlay relative">
      {/* Deep-space nebula gradient backdrop — corners glow, centre stays calm */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_rgba(124,58,237,0.22),_transparent_50%),radial-gradient(ellipse_at_top_right,_rgba(236,72,153,0.14),_transparent_45%),radial-gradient(ellipse_at_bottom_right,_rgba(0,184,255,0.18),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(0,255,157,0.14),_transparent_50%),#000]" />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Scene>
          <SpaceField />
          <HeroSceneV2 mousePosition={mousePosition} />
        </Scene>
      </div>

      <FloatingNav />
      <FloatingSocials />

      <div className="relative z-10">
        <Hero />
        <div className="relative bg-black/20 backdrop-blur-sm border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,1)]">
          <PrizePool />
          <About />
          <Timeline />
          <Tracks />
          <Rules />
          <FAQ />
          <Footer />
        </div>
      </div>
    </main>
  );
}
